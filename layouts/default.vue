<template>
  <div
      :class="[
      'bg-background-light-2 dark:bg-background-dark-2 relative flex min-h-screen w-full items-start justify-center',
      { 'h-full w-full': isInterestsPage },
    ]"
  >
    <div
        v-if="isBlogPage"
        :style="{ width: scrollProgress + '%' }"
        class="fixed top-0 left-0 z-50 h-1 bg-linear-to-r from-blue-300 to-red-200 transition-all duration-150"
    />
    <!-- The centre column no longer owns the scrollbar. It used to be an
         `h-screen overflow-y-auto` box, which meant the wheel only scrolled
         while the pointer was over the column itself -- over the side gutters
         nothing moved. The document scrolls now, so the whole viewport
         responds. -->
    <div
        class="bg-background-light dark:bg-background-dark border-x-border-dark relative z-0 flex min-h-screen w-full flex-col border-x-0 border-solid md:border-x lg:w-2/3"
    >
      <Navbar/>
      <main class="flex-1">
        <slot/>
      </main>
      <Footer/>
    </div>
    <CustomCursor/>
    <SpeedInsights />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import CustomCursor from "~/components/CustomCursor.vue";

const route = useRoute();

// Compare on path: Nuxt derives route names from filenames, so this never
// matched the capitalised "Interests" it was previously tested against.
const isInterestsPage = computed(() => route.path === "/interests");
const isBlogPage = computed(() => route.path.startsWith("/blog/"));

const scrollProgress = ref(0);

const updateScroll = () => {
  const doc = document.documentElement;
  const scrollTop = window.scrollY;
  const scrollHeight = doc.scrollHeight - window.innerHeight;
  // Guard the divide: a page shorter than the viewport gives 0 here, which
  // produced `width: NaN%` on the progress bar.
  scrollProgress.value =
    scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
};

let scrollListening = false;

const addScrollListener = () => {
  if (typeof window === "undefined" || scrollListening) return;
  // Passive: this listener never calls preventDefault, and saying so lets
  // the browser scroll without waiting on it.
  window.addEventListener("scroll", updateScroll, { passive: true });
  scrollListening = true;
  updateScroll();
};

const removeScrollListener = () => {
  if (typeof window === "undefined" || !scrollListening) return;
  window.removeEventListener("scroll", updateScroll);
  scrollListening = false;
  scrollProgress.value = 0;
};

// Scroll to top on route change. `behavior: "smooth"` is a JS argument, so
// the reduced-motion CSS cannot override it -- ask before animating.
const scrollToTop = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

onMounted(() => {
  if (isBlogPage.value) {
    addScrollListener();
  }
});

// Watch route changes to toggle scroll listener and progress bar
watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith("/blog/")) {
      addScrollListener();
    } else {
      removeScrollListener();
    }
    // Scroll to top on every route change
    scrollToTop();
  },
);

onUnmounted(() => {
  removeScrollListener();
});
</script>

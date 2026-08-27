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
    <div ref="cursor" :class="['cursor', cursorType]"/>
    <SpeedInsights />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { SpeedInsights } from "@vercel/speed-insights/vue";

const route = useRoute();

// Compare on path: Nuxt derives route names from filenames, so this never
// matched the capitalised "Interests" it was previously tested against.
const isInterestsPage = computed(() => route.path === "/interests");
const isBlogPage = computed(() => route.path.startsWith("/blog/"));

const cursor = ref<HTMLElement | null>(null);
const cursorType = ref<"default" | "hover" | "text">("default");
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

const TEXT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const TEXT_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, span, article, li, pre, code, [contenteditable='true']";

let mouseX = 0;
let mouseY = 0;
let frame = 0;

const paintCursor = () => {
  frame = 0;
  if (cursor.value) {
    cursor.value.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  }
};

const updateCursor = (e: MouseEvent) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Coalesce moves into one paint per frame rather than writing style on
  // every event.
  if (!frame) frame = requestAnimationFrame(paintCursor);

  const target = e.target as HTMLElement;
  if (!target?.closest) return;

  // Note: no getComputedStyle here. Calling it per mousemove forced a style
  // recalculation on every pointer event.
  if (target.tagName === "IMG" || target.closest("img")) {
    cursorType.value = "default";
  } else if (target.closest("a, button, [role='button'], .cursor-hover")) {
    cursorType.value = "hover";
  } else if (TEXT_TAGS.has(target.tagName) || target.closest(TEXT_SELECTOR)) {
    cursorType.value = "text";
  } else {
    cursorType.value = "default";
  }
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

// Scroll to top on route change
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

/** The custom cursor is hidden on touch devices, so skip the work entirely. */
const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let cursorEnabled = false;

onMounted(() => {
  cursorEnabled = hasFinePointer();

  if (cursorEnabled) {
    document.body.style.cursor = "none";
    window.addEventListener("mousemove", updateCursor, { passive: true });
  }

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
  if (cursorEnabled) {
    document.body.style.cursor = "auto";
    window.removeEventListener("mousemove", updateCursor);
  }
  if (frame) cancelAnimationFrame(frame);
  removeScrollListener();
});
</script>

<style>
* {
  cursor: none !important;
}

/* Match the JS gate: restore the native cursor wherever there is no fine
   pointer, rather than guessing from viewport width. */
@media (hover: none), (pointer: coarse) {
  * {
    cursor: auto !important;
  }

  .cursor {
    display: none !important;
  }
}

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  transform: translate(-50%, -50%);
  transition: width 0.15s ease,
  height 0.15s ease;
}

.cursor.hover {
  width: 25px;
  height: 25px;
}

.cursor.text {
  width: 2px;
  height: 24px;
  border-radius: 0;
}
</style>

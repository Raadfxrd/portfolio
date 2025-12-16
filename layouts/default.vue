<template>
  <div
      :class="[
      'bg-background-light-2 dark:bg-background-dark-2 relative flex min-h-screen w-full items-start justify-center overflow-hidden',
      { 'h-full w-full': isInterestsPage },
    ]"
  >
    <div
        class="bg-background-light dark:bg-background-dark border-x-border-dark relative z-0 min-h-screen w-full border-x-0 border-solid md:border-x lg:w-2/3"
    >
      <div
          v-if="isBlogPage"
          :style="{ width: scrollProgress + '%' }"
          class="fixed top-0 left-0 z-50 h-1 bg-linear-to-r from-blue-300 to-red-200 transition-all duration-150"
      />
      <div
          ref="scrollContainer"
          class="no-scrollbar sticky top-0 z-10 h-screen overflow-y-auto"
          @mousemove="updateCursor"
      >
        <Navbar/>
        <main class="flex-1">
          <slot/>
        </main>
        <Footer/>
      </div>
    </div>
    <div ref="cursor" :class="['cursor', cursorType]"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute} from "vue-router";

const route = useRoute();

const isInterestsPage = route.name === "Interests";
const isBlogPage = computed(() => route.path.startsWith("/blog/"));

const cursor = ref<HTMLElement | null>(null);
const cursorType = ref<"default" | "hover" | "text">("default");
const scrollProgress = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

const updateScroll = () => {
  if (!scrollContainer.value) return;
  const scrollTop = scrollContainer.value.scrollTop;
  const scrollHeight =
      scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight;
  scrollProgress.value = (scrollTop / scrollHeight) * 100;
};

let mouseX = 0;
let mouseY = 0;

const updateCursor = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (cursor.value) {
    cursor.value.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  }

  if (target.tagName === "IMG" || target.closest("img")) {
    cursorType.value = "default";
  } else if (target.closest("a, button, [role='button'], .cursor-hover")) {
    cursorType.value = "hover";
  } else if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
      getComputedStyle(target).cursor === "text" ||
      target.closest(
          "h1, h2, h3, h4, h5, h6, p, span, div[contenteditable='true'], pre, code, li",
      ) ||
      target.matches(
          "h1, h2, h3, h4, h5, h6, p, span, div[contenteditable='true'], pre, code, article, li",
      )
  ) {
    cursorType.value = "text";
  } else {
    cursorType.value = "default";
  }
};

const addScrollListener = () => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("scroll", updateScroll);
    updateScroll();
  }
};

const removeScrollListener = () => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("scroll", updateScroll);
    scrollProgress.value = 0;
  }
};

// Scroll to top on route change
const scrollToTop = () => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

onMounted(() => {
  document.body.style.cursor = "none";
  window.addEventListener("mousemove", updateCursor);

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
  document.body.style.cursor = "auto";
  window.removeEventListener("mousemove", updateCursor);
  removeScrollListener();
});
</script>

<style>
* {
  cursor: none !important;
}

@media (max-width: 768px) {
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

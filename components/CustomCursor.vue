<template>
  <div ref="cursor" :class="['cursor', cursorType]"/>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from "vue";

/**
 * The site's custom cursor.
 *
 * Lives in its own component so it is not tied to the default layout: the
 * error page renders standalone (it must not depend on the layout's data
 * fetching) and would otherwise be the one page on the site with a stock
 * pointer.
 */
const cursor = ref<HTMLElement | null>(null);
const cursorType = ref<"default" | "hover" | "text">("default");

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

/** The custom cursor is hidden on touch devices, so skip the work entirely. */
const hasFinePointer = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let cursorEnabled = false;

onMounted(() => {
  cursorEnabled = hasFinePointer();

  if (cursorEnabled) {
    document.body.style.cursor = "none";
    window.addEventListener("mousemove", updateCursor, {passive: true});
  }
});

onUnmounted(() => {
  if (cursorEnabled) {
    document.body.style.cursor = "auto";
    window.removeEventListener("mousemove", updateCursor);
  }
  if (frame) cancelAnimationFrame(frame);
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

<template>
  <div
      class="bg-background-dark flex min-h-screen flex-col"
      @mousemove="updateCursor"
  >
    <AdminNavbar/>
    <main class="flex-1 overflow-y-auto">
      <slot/>
    </main>
    <div ref="cursor" :class="['cursor', cursorType]"/>
  </div>
</template>

<script lang="ts" setup>
import AdminNavbar from "~/components/AdminNavbar.vue";

const cursor = ref<HTMLElement | null>(null);
const cursorType = ref<"default" | "hover" | "text">("default");

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

onMounted(() => {
  document.body.style.cursor = "none";
  window.addEventListener("mousemove", updateCursor);
});

onUnmounted(() => {
  document.body.style.cursor = "auto";
  window.removeEventListener("mousemove", updateCursor);
});
</script>

<style scoped>
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

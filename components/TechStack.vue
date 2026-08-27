<template>
  <div
      ref="marqueeRef"
      class="marquee relative my-6 md:my-8 w-11/12 md:w-4/5 overflow-hidden rounded-lg py-4 md:py-6 shadow-md"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      @focusin="isHovered = true"
      @focusout="isHovered = false"
  >
    <div ref="trackRef" class="flex w-max will-change-transform">
      <div
          v-for="tech in techStack"
          :key="tech.title"
          class="flex items-center gap-8 md:gap-12 px-4 md:px-6"
      >
        <i
            :class="tech.class"
            :title="tech.title"
            class="text-text-primary hover:text-text-secondary text-2xl md:text-4xl transition-transform duration-300 ease-in-out hover:scale-125"
        ></i>
      </div>
      <div
          v-for="tech in techStack"
          :key="tech.title + '-duplicate'"
          class="flex items-center gap-8 md:gap-12 px-4 md:px-6"
      >
        <i
            :class="tech.class"
            :title="tech.title"
            class="text-text-primary hover:text-text-secondary text-2xl md:text-4xl transition-transform duration-300 ease-in-out hover:scale-125"
        ></i>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useElementVisibility} from "@vueuse/core";
import {useTechStack} from "@/composables/techStack";

const {techStack} = useTechStack();

const marqueeRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);
const isHovered = ref(false);

/**
 * The strip is driven frame by frame rather than by a CSS keyframe animation.
 *
 * `animation-play-state: paused` stops dead on the frame the pointer arrives,
 * which is what made hovering feel unfinished. Speed is a value that can be
 * eased, so here it decays toward zero on hover and recovers on leave, and the
 * strip coasts to a stop and back up to pace.
 */
const PIXELS_PER_SECOND = 40;

/** Fraction of the remaining gap closed per frame; higher settles faster. */
const EASING = 0.08;

let offset = 0;
let speed = PIXELS_PER_SECOND;
let frame = 0;
let lastTime = 0;
let halfWidth = 0;

const measure = () => {
  // The track holds the icon set twice, so one full set is half its width and
  // resetting there is seamless.
  halfWidth = (trackRef.value?.scrollWidth ?? 0) / 2;
};

const step = (time: number) => {
  const delta = lastTime ? (time - lastTime) / 1000 : 0;
  lastTime = time;

  const target = isHovered.value ? 0 : PIXELS_PER_SECOND;
  speed += (target - speed) * EASING;

  // Below a pixel every few seconds it is stopped for all practical purposes;
  // snapping avoids an asymptote that never quite reaches zero.
  if (Math.abs(speed - target) < 0.1) speed = target;

  offset += speed * delta;
  if (halfWidth > 0 && offset >= halfWidth) offset -= halfWidth;

  if (trackRef.value) {
    trackRef.value.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  frame = requestAnimationFrame(step);
};

const startLoop = () => {
  if (frame) return;
  lastTime = 0;
  frame = requestAnimationFrame(step);
};

const stopLoop = () => {
  if (!frame) return;
  cancelAnimationFrame(frame);
  frame = 0;
};

// No reason to run a per-frame loop for a strip that is scrolled past.
const isVisible = useElementVisibility(marqueeRef);

watch(isVisible, (visible) => {
  if (visible) startLoop();
  else stopLoop();
});

onMounted(() => {
  measure();
  window.addEventListener("resize", measure, {passive: true});

  // Reduced motion gets a still strip. It stays legible and the tooltips are
  // reachable, which was the point of pausing in the first place.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  if (isVisible.value) startLoop();
});

onBeforeUnmount(() => {
  stopLoop();
  window.removeEventListener("resize", measure);
});
</script>

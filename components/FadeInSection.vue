<template>
  <div
      ref="el"
      :class="['motion-reveal', visible && 'motion-reveal--visible']"
      :style="styleVars"
  >
    <slot/>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {useIntersectionObserver} from "@vueuse/core";

const el = ref<HTMLElement | null>(null);
const visible = ref(false);

const props = withDefaults(
    defineProps<{
      delay?: number;
      distance?: number;
      duration?: number;
      timing?: string;
      once?: boolean;
    }>(),
    {
      delay: 0,
      distance: 24,
      duration: 900,
      timing: "cubic-bezier(0.22, 1, 0.36, 1)",
      once: true,
    },
);

const styleVars = computed(() => ({
  transitionDelay: `${props.delay}ms`,
  "--motion-distance": `${props.distance}px`,
  "--motion-duration": `${props.duration}ms`,
  "--motion-ease": props.timing,
}));

useIntersectionObserver(
    el,
    ([{isIntersecting}], observer) => {
      if (isIntersecting) {
        visible.value = true;
        if (props.once) observer.unobserve(el.value as Element);
      } else if (!props.once) {
        visible.value = false;
      }
    },
    {threshold: 0.14},
);
</script>

<style scoped>
.motion-reveal {
  opacity: 0;
  transform: translateY(var(--motion-distance, 24px));
  transition: opacity var(--motion-duration, 900ms) var(--motion-ease, ease-out),
  transform var(--motion-duration, 900ms) var(--motion-ease, ease-out);
  will-change: opacity, transform;
}

.motion-reveal--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>

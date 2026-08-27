<template>
  <div
      class="marquee relative my-6 md:my-8 w-11/12 md:w-4/5 overflow-hidden rounded-lg py-4 md:py-6 shadow-md"
  >
    <div class="animate-scroll flex w-max">
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
import {useTechStack} from "@/composables/techStack";

const {techStack} = useTechStack();
</script>

<style scoped>
/*
 * Hold the strip still under the pointer.
 *
 * Every icon carries a `title` tooltip, which on a strip moving continuously
 * for 60 seconds is essentially unreachable -- the icon slides out from under
 * the cursor before the tooltip appears. Pausing on the container rather than
 * the icons means the strip stops wherever you aim, not only when you land on
 * something.
 *
 * Reduced motion stops the animation outright elsewhere, so there is nothing
 * to pause there.
 */
.marquee:hover .animate-scroll,
.marquee:focus-within .animate-scroll {
  animation-play-state: paused;
}
</style>

<template>
  <div class="relative flex items-center justify-center">
    <!-- Navbar -->
    <nav
      v-if="isNavbarVisible"
      :class="{ 'animate-navbarFadeIn': isAnimationComplete }"
      class="fixed top-4 left-1/2 z-50 flex w-full -translate-x-1/2 transform justify-center px-4 md:top-6"
    >
      <div
        class="flex w-full items-center justify-between gap-2 md:w-2/3 md:justify-around md:gap-0"
      >
        <!-- Small Logo -->
        <img
          alt="Small Logo"
          class="border-border-dark h-8 w-8 shrink-0 rounded-full border hover:cursor-pointer md:h-10 md:w-10"
          src="/public/img/raadfxrd.jpeg"
          @click="$router.push('/')"
        />

        <!-- Nav Links -->
        <div
          class="backdrop-blur-fallback border-border-light text-light flex items-center gap-3 rounded-full border border-solid px-3 py-2 transition duration-300 md:gap-10 md:px-8 md:py-3"
        >
          <NavLinks />
        </div>

        <!-- Theme Toggle Button -->
        <button
          :aria-label="`Current theme: ${colorMode.preference}`"
          class="backdrop-blur-fallback ring-border-light flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 hover:ring-1 md:h-10 md:w-10"
          @click="toggleTheme"
        >
          <component
            :is="icon"
            class="text-text-primary h-5 w-5 md:h-6 md:w-6"
          />
          <span class="sr-only">Theme: {{ colorMode.preference }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import NavLinks from "./NavLinks.vue";
import { useNavbarVisibility } from "~/composables/useNavbarVisibility";
import {
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { computed } from "vue";

const { isNavbarVisible, isAnimationComplete } = useNavbarVisibility();
const colorMode = useColorMode();

// Default to 'system' if no preference is set
if (!colorMode.preference) {
  colorMode.preference = "system";
}

// Cycle between 'light', 'dark', and 'system'
const toggleTheme = () => {
  if (colorMode.preference === "light") colorMode.preference = "dark";
  else colorMode.preference = "light";
};

const icon = computed(() => {
  if (colorMode.preference === "light") return SunIcon;
  if (colorMode.preference === "dark") return MoonIcon;
  return ComputerDesktopIcon;
});
</script>

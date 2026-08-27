<template>
  <div class="relative flex items-center justify-center">
    <!-- Navbar -->
    <nav
        v-if="isNavbarVisible"
        :class="{ 'animate-navbarFadeIn': isAnimationComplete }"
        class="fixed top-4 left-1/2 z-50 flex w-full -translate-x-1/2 transform justify-center px-4 md:top-6"
    >
      <div ref="navRef" class="w-full md:w-2/3">
        <div
            class="flex w-full items-center justify-between gap-2 md:justify-around md:gap-0"
        >
          <!-- Small Logo. Kept in the flow at all times: hiding it outright
               would slide the link pill sideways every time the hero portrait
               scrolls past. -->
          <span
              :style="logoStyle"
              class="logo-slot inline-flex shrink-0"
          >
            <img
                alt="Small Logo"
                class="border-border-dark h-8 w-8 rounded-full border object-cover transition-transform hover:scale-105 hover:cursor-pointer md:h-10 md:w-10"
                src="/img/raadfxrd.jpeg"
                @click="$router.push('/')"
            />
          </span>

          <!-- Nav Links: the inline pill is a desktop affordance; below `sm`
               it is replaced by the menu button on the right. -->
          <div
              :class="
                isCondensed
                  ? 'is-condensed gap-3 px-3 py-1.5 md:gap-7 md:px-6 md:py-2'
                  : 'gap-3 px-3 py-2 md:gap-10 md:px-8 md:py-3'
              "
              class="backdrop-blur-fallback border-border-light text-light hidden items-center rounded-full border border-solid transition-all duration-300 sm:flex"
          >
            <NavLinks/>
          </div>

          <div class="flex items-center gap-2">
            <!-- Mobile Menu Button -->
            <button
                :aria-expanded="isMenuOpen"
                :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
                ref="menuButtonRef"
                aria-controls="mobile-menu"
                class="backdrop-blur-fallback ring-border-light flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 hover:ring-1 sm:hidden"
                type="button"
                @click="toggleMenu"
            >
              <component
                  :is="isMenuOpen ? XMarkIcon : Bars3Icon"
                  class="text-text-primary h-5 w-5"
              />
            </button>

            <!-- Theme Toggle Button -->
            <button
                :aria-label="`Current theme: ${colorMode.preference}`"
                class="backdrop-blur-fallback ring-border-light flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 hover:ring-1 md:h-10 md:w-10"
                type="button"
                @click="toggleTheme"
            >
              <component
                  :is="icon"
                  class="text-text-primary h-5 w-5 md:h-6 md:w-6"
              />
              <span class="sr-only">Theme: {{ colorMode.preference }}</span>
            </button>
          </div>
        </div>

        <!-- Mobile Menu Panel -->
        <Transition name="menu">
          <div
              v-if="isMenuOpen"
              id="mobile-menu"
              ref="panelRef"
              class="backdrop-blur-fallback border-border-light mt-3 overflow-hidden rounded-2xl border border-solid sm:hidden"
          >
            <ul class="flex flex-col">
              <li
                  v-for="(link, index) in links"
                  :key="link.path"
                  :class="index > 0 && 'border-border-light border-t border-solid'"
              >
                <NuxtLink
                    :to="link.path"
                    class="text-text-primary hover:bg-background-light-2 block px-5 py-3 text-sm font-medium transition-colors"
                    @click="closeMenu(false)"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </nav>
  </div>
</template>

<script setup>
import NavLinks from "./NavLinks.vue";
import {useNavbarVisibility} from "~/composables/useNavbarVisibility";
import {useNavigation} from "~/composables/useNavigation";
import {
  Bars3Icon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import {computed, nextTick, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {onClickOutside, useEventListener, useWindowScroll} from "@vueuse/core";
import {useHeroPortrait} from "~/composables/useHeroPortrait";

const {isNavbarVisible, isAnimationComplete} = useNavbarVisibility();
const {links} = useNavigation();
const {logoReveal} = useHeroPortrait();
const colorMode = useColorMode();
const route = useRoute();

const {y: scrollY} = useWindowScroll();

// Far enough down that it never flickers on a stray wheel nudge.
const isCondensed = computed(() => scrollY.value > 24);

/**
 * The navbar avatar and the hero portrait are the same photograph, so rather
 * than fading the small one in, it grows into place as the large one leaves --
 * scrubbed from the portrait's own visibility, not switched at a threshold.
 *
 * No overshoot on the settle: this is scrubbed by scroll position, and a curve
 * that overshoots forwards would read as a stumble when scrolled backwards.
 * The short transition below does the smoothing instead.
 */
const logoStyle = computed(() => ({
  opacity: logoReveal.value,
  transform: `scale(${0.4 + 0.6 * logoReveal.value})`,
  pointerEvents: logoReveal.value < 0.5 ? "none" : "auto",
}));

const navRef = ref(null);
const panelRef = ref(null);
const menuButtonRef = ref(null);
const isMenuOpen = ref(false);

/**
 * @param returnFocus whether to hand focus back to the trigger. True when the
 * menu is dismissed in place (Escape), false when a link was followed or the
 * pointer went elsewhere, since focus belongs on the destination.
 */
const closeMenu = (returnFocus = true) => {
  if (!isMenuOpen.value) return;
  isMenuOpen.value = false;
  if (returnFocus) menuButtonRef.value?.focus?.();
};

const toggleMenu = async () => {
  if (isMenuOpen.value) {
    closeMenu();
    return;
  }

  isMenuOpen.value = true;

  // Move focus into the panel: a control that opens something the keyboard
  // cannot reach is not much better than no control at all.
  await nextTick();
  panelRef.value?.querySelector("a")?.focus();
};

onClickOutside(navRef, () => closeMenu(false));

useEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

// A menu that survives the navigation it triggered would cover the page it
// just opened.
watch(() => route.path, () => closeMenu(false));

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

<style scoped>
.logo-slot {
  transform-origin: center;
  transition: opacity 0.25s var(--motion-ease),
  transform 0.25s var(--motion-ease);
  will-change: opacity, transform;
}

/* Condensed, the pill sits over content rather than empty page, so the
   surface firms up to keep the links legible. */
.is-condensed {
  background-color: rgba(238, 238, 238, 0.55);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.dark .is-condensed {
  background-color: rgba(51, 51, 51, 0.55);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s var(--motion-ease),
  transform 0.2s var(--motion-ease);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

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
          <!-- Small Logo.
               The outer span is never transformed: it holds the slot in the
               flow (removing it would slide the pill sideways) and its rect is
               the flight's landing target. The image inside is what flies. -->
          <span ref="slotRef" class="logo-slot inline-flex shrink-0">
            <img
                :style="flightStyle"
                alt="Small Logo"
                class="border-border-dark h-8 w-8 rounded-full border object-cover transition-transform hover:scale-105 hover:cursor-pointer md:h-10 md:w-10"
                src="/img/raadfxrd.jpeg"
                style="object-position: center top"
                @click="$router.push('/')"
            />
          </span>

          <!-- Nav Links: the inline pill is a desktop affordance; below `sm`
               it is replaced by the menu button on the right. -->
          <div
              :class="{ 'is-condensed': isCondensed }"
              class="pill backdrop-blur-fallback border-border-light text-light hidden items-center overflow-hidden rounded-full border border-solid sm:flex"
          >
            <EllipsisHorizontalIcon class="pill__glyph text-text-primary"/>
            <div class="pill__links">
              <NavLinks/>
            </div>
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
import {useHeroPortrait} from "~/composables/useHeroPortrait";
import {
  Bars3Icon,
  ComputerDesktopIcon,
  EllipsisHorizontalIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {onClickOutside, useEventListener} from "@vueuse/core";

const {isNavbarVisible, isAnimationComplete} = useNavbarVisibility();
const {links} = useNavigation();
const {flightProgress, flightActive, heroReady} = useHeroPortrait();
const colorMode = useColorMode();
const route = useRoute();

const navRef = ref(null);
const panelRef = ref(null);
const menuButtonRef = ref(null);
const slotRef = ref(null);
const isMenuOpen = ref(false);
const isCondensed = ref(false);

/* ---------------------------------------------------------------------------
 * Hero portrait flight
 *
 * The navbar avatar and the hero portrait are the same photograph. Rather than
 * fading a second copy in, the avatar starts scaled up and sitting exactly on
 * top of the hero, then interpolates back to its own size and place as you
 * scroll -- so the picture appears to lift off the page and fly into the
 * header. The home page fades the original out from underneath it, which is
 * what makes the two read as one object rather than a copy.
 *
 * Everything expensive is measured once. The only per-frame work is arithmetic
 * and a single style write.
 * ------------------------------------------------------------------------- */

/*
 * Refs, not plain variables: flightStyle is a computed, and a computed only
 * re-runs when a reactive dependency changes. Held as bare `let`s, a re-measure
 * that happened to land on the same value -- a resize while parked at the top
 * of the page, say -- would leave the transform built from stale geometry.
 */

/** Live scroll position, so the flyer can track where the portrait actually is. */
const scrollY = ref(0);
/** Distance the page must scroll for the portrait's centre to reach the slot. */
const flightDistance = ref(0);
/** Gap between the two centres horizontally, which vertical scroll never changes. */
const flightOffsetX = ref(0);
/** The portrait's centre in document space, which scrolling does not change. */
const heroCentreDocY = ref(0);
/** The slot's centre. The navbar is fixed, so this is a viewport constant. */
const slotCentreY = ref(0);
/** How much larger the portrait is than the slot. */
const flightScale = ref(1);

/**
 * The flight is triggered and then runs to completion on its own clock, rather
 * than being scrubbed frame by frame from the scroll position.
 *
 * Scrubbing parked the portrait wherever the scroll happened to stop. One click
 * of a mouse wheel is roughly a quarter of the trip -- far enough for the
 * original to have faded out, nowhere near far enough for the flyer to have
 * arrived -- so it hung in the middle looking like a bug rather than an
 * animation. Past the trigger it now always finishes, in both directions, and
 * there is no resting intermediate state to land in.
 */
const ENGAGE_AT = 0.22;
/** Released well below the trigger, so sitting on the boundary cannot flutter. */
const RELEASE_AT = 0.1;
const FLIGHT_MS = 380;

let engaged = false;
let hasNavigated = false;
let animationFrame = 0;
let scrollFrame = 0;
let reducedMotion = false;

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

const stopFlightAnimation = () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = 0;
};

/** Straight there, no trip: first paint, and pages with no portrait to fly. */
const settleFlight = (target) => {
  stopFlightAnimation();
  flightProgress.value = target;
};

const animateFlight = (target) => {
  if (flightProgress.value === target) return;

  stopFlightAnimation();

  const from = flightProgress.value;
  const startedAt = performance.now();

  const tick = (now) => {
    const elapsed = Math.min((now - startedAt) / FLIGHT_MS, 1);
    flightProgress.value = from + (target - from) * easeInOut(elapsed);

    if (elapsed < 1) {
      animationFrame = requestAnimationFrame(tick);
      return;
    }

    animationFrame = 0;
    flightProgress.value = target;
  };

  animationFrame = requestAnimationFrame(tick);
};

const measureFlight = () => {
  const hero = document.querySelector("[data-hero-portrait]");
  const slot = slotRef.value;

  if (reducedMotion || !hero || !slot) {
    flightDistance.value = 0;
    flightActive.value = false;
    engaged = false;
    settleFlight(1);
    return;
  }

  const heroRect = hero.getBoundingClientRect();
  // The slot itself is never transformed, so its rect is the true landing
  // target. The navbar is fixed, which is why this stays valid while scrolling.
  const slotRect = slot.getBoundingClientRect();

  const heroCentreX = heroRect.left + heroRect.width / 2;
  const slotCentreX = slotRect.left + slotRect.width / 2;

  heroCentreDocY.value = heroRect.top + window.scrollY + heroRect.height / 2;
  slotCentreY.value = slotRect.top + slotRect.height / 2;
  flightOffsetX.value = heroCentreX - slotCentreX;
  flightScale.value = slotRect.width > 0 ? heroRect.width / slotRect.width : 1;
  flightDistance.value = heroCentreDocY.value - slotCentreY.value;
  flightActive.value = flightDistance.value > 0;

  scrollY.value = window.scrollY;
  engaged =
      flightDistance.value > 0 &&
      scrollY.value / flightDistance.value > ENGAGE_AT;

  // Arriving back on the home page, the avatar is sitting in the header where
  // the previous page left it. Animating rather than settling is what flies it
  // back down onto the portrait instead of blinking it there.
  if (hasNavigated) {
    animateFlight(engaged ? 1 : 0);
    return;
  }

  // First paint: be where we belong without performing the trip.
  settleFlight(engaged ? 1 : 0);
};

const flightStyle = computed(() => {
  const progress = flightProgress.value;

  // Landed, or nothing to fly from: hand the element back to the stylesheet so
  // the hover scale works again rather than being overridden by an identity
  // transform.
  if (progress >= 1 || !flightActive.value) return {};

  const remaining = 1 - progress;
  const scale = 1 + (flightScale.value - 1) * remaining;

  // Derived live rather than baked in when the flight was triggered: progress
  // runs on its own clock now, so the portrait goes on moving underneath while
  // the flight plays. Clamped at zero so scrolling clean past the hero
  // mid-flight cannot throw the flyer up above the header.
  const gap = Math.max(
      heroCentreDocY.value - scrollY.value - slotCentreY.value,
      0,
  );

  return {
    transform: `translate3d(${flightOffsetX.value * remaining}px, ${
        gap * remaining
    }px, 0) scale(${scale})`,
    // Binary, not a fade.
    //
    // At rest the flyer must be invisible: it covers the portrait exactly, and
    // an opaque copy there would hide the portrait's own explode-on-hover
    // behind a lid. The instant the flight starts it must be the only one
    // visible. There is nothing to crossfade between -- at that instant it is
    // the same photograph at the same size in the same place, so the exchange
    // is invisible on its own. Fading them across each other is what showed
    // two: by the time a fade completes the flyer has already moved off and
    // shrunk, so it reads as a second, smaller portrait laid over the first.
    opacity: progress > 0 ? 1 : 0,
    // The border scales with everything else, so counter it to keep the ring
    // at the same visual weight as the hero's while it flies.
    borderWidth: `${2 / scale}px`,
    // Mid-flight this is a large element sitting over the hero. Without this it
    // would swallow the hover that triggers the portrait's own animation.
    pointerEvents: "none",
  };
});

/* ------------------------------------------------------------------------- */

const onScrollFrame = () => {
  scrollFrame = 0;
  scrollY.value = window.scrollY;

  // Far enough down that it never flickers on a stray wheel nudge.
  isCondensed.value = scrollY.value > 24;

  if (!flightActive.value || flightDistance.value <= 0) return;

  const ratio = scrollY.value / flightDistance.value;

  if (!engaged && ratio > ENGAGE_AT) {
    engaged = true;
    animateFlight(1);
  } else if (engaged && ratio < RELEASE_AT) {
    engaged = false;
    animateFlight(0);
  }
};

const onScroll = () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(onScrollFrame);
};

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
// just opened. The hero only exists on the home page, so the flight has to be
// re-measured -- or torn down -- on the same event.
watch(
    () => route.path,
    async () => {
      closeMenu(false);
      // Marks every later measurement as a navigation rather than first paint,
      // which is what makes the avatar fly back down instead of blinking.
      hasNavigated = true;

      // Leaving the page that owns the portrait.
      //
      // The outgoing page is still in the DOM at this point -- the transition
      // runs out-in, so it does not unmount for another beat -- which means
      // re-measuring here would find the departing portrait and aim the flight
      // at wherever the page happened to be scrolled. At the top of the page
      // that is a target of 0, which parks the avatar invisibly over a portrait
      // that is fading away and leaves the header empty until the old page
      // finally unmounts. Send it home instead, and do not measure against a
      // page on its way out.
      if (flightActive.value) {
        engaged = true;
        animateFlight(1);
        return;
      }

      await nextTick();
      measureFlight();
    },
);

// The navbar is hidden until the intro finishes, so on a first visit there is
// no slot to measure against until it appears.
watch(isNavbarVisible, async (visible) => {
  if (!visible) return;
  await nextTick();
  measureFlight();
});

// The portrait arriving is the other half of that signal, and the important one
// now that the navbar survives the trip home: it stays mounted, so its own
// visibility watcher never fires and this is the only thing that knows there is
// something to fly again.
watch(heroReady, async () => {
  await nextTick();
  measureFlight();
});

onMounted(() => {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.addEventListener("scroll", onScroll, {passive: true});
  window.addEventListener("resize", measureFlight, {passive: true});

  scrollY.value = window.scrollY;
  isCondensed.value = scrollY.value > 24;
  measureFlight();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", measureFlight);
  if (scrollFrame) cancelAnimationFrame(scrollFrame);
  stopFlightAnimation();
});

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
}

/* The flying image is written to on every frame, so it must not also be running
   a transition -- that would leave the transform a beat behind the scroll. */
.logo-slot img {
  transform-origin: center;
  will-change: transform;
}

/* ---------------------------------------------------------------------------
 * The pill
 *
 * At the top of the page it is a full navigation bar. Once scrolled it folds
 * down to a small marker and reopens on hover, so it stops competing with the
 * content it is now floating over.
 *
 * Padding, surface and width live here rather than in the class binding
 * because they key off :hover and :focus-within -- and :focus-within is what
 * keeps it reachable by keyboard, where there is no pointer to hover with.
 * ------------------------------------------------------------------------- */
.pill {
  padding: 0.5rem 0.75rem;
  transition: padding 0.3s var(--motion-ease),
  background-color 0.3s var(--motion-ease),
  box-shadow 0.3s var(--motion-ease);
}

@media (min-width: 768px) {
  .pill {
    padding: 0.75rem 2rem;
  }
}

.pill.is-condensed {
  background-color: rgba(238, 238, 238, 0.55);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 0.375rem 0.5rem;
}

.dark .pill.is-condensed {
  background-color: rgba(51, 51, 51, 0.55);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.pill.is-condensed:hover,
.pill.is-condensed:focus-within {
  padding: 0.5rem 1.25rem;
}

@media (min-width: 768px) {
  .pill.is-condensed:hover,
  .pill.is-condensed:focus-within {
    padding: 0.625rem 1.75rem;
  }
}

/* max-width rather than an animated grid track: interpolating
   grid-template-columns is still uneven across browsers, and this only has to
   clear the links' natural width. */
.pill__links {
  max-width: 24rem;
  opacity: 1;
  overflow: hidden;
  transition: max-width 0.35s var(--motion-ease),
  opacity 0.25s var(--motion-ease);
}

/* Without this the links squeeze as the container narrows, instead of sliding
   out of view behind it. */
.pill__links :deep(ul) {
  width: max-content;
}

.pill.is-condensed .pill__links {
  max-width: 0;
  opacity: 0;
}

.pill.is-condensed:hover .pill__links,
.pill.is-condensed:focus-within .pill__links {
  max-width: 24rem;
  opacity: 1;
}

/* The marker exists only while the pill is folded: it is the affordance that
   says there is something here to open. */
.pill__glyph {
  height: 1.25rem;
  width: 0;
  opacity: 0;
  transition: width 0.3s var(--motion-ease),
  opacity 0.2s var(--motion-ease);
}

.pill.is-condensed .pill__glyph {
  width: 1.25rem;
  opacity: 0.7;
}

.pill.is-condensed:hover .pill__glyph,
.pill.is-condensed:focus-within .pill__glyph {
  width: 0;
  opacity: 0;
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

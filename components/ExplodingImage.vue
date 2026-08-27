<script lang="ts" setup>
import {onUnmounted, ref} from "vue";
import {gsap} from "gsap";

interface Props {
  mainImage: string;
  satelliteImages: string[];
  alt?: string;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const hoverTimeout = ref<NodeJS.Timeout | null>(null);

/**
 * How far the satellites travel, as a fraction of the container's own width.
 *
 * This used to be a flat 150px, which is 0.375 of the 400px desktop container
 * but 0.68 of the 220px mobile one -- so on phones the satellites shot well
 * past the container and off the side of the screen. Measuring the container
 * keeps the spread proportional at every breakpoint.
 */
const ORBIT_RATIO = 0.375;

const orbitRadius = (container: HTMLElement) =>
    (container.getBoundingClientRect().width || 400) * ORBIT_RATIO;

const handleMouseEnter = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }
  hoverTimeout.value = setTimeout(() => {
    isHovered.value = true;
    const container = containerRef.value;
    if (!container) return;

    const mainImage = container.querySelector(".main-image");
    if (mainImage) {
      gsap.killTweensOf(mainImage);

      gsap.to(mainImage, {
        scale: 0.95,
        duration: 0.5,
        ease: "power2.out",
      });
    }

    const radius = orbitRadius(container);

    props.satelliteImages.forEach((_, index) => {
      const angle = (index * 360) / props.satelliteImages.length;
      const satelliteElement = container.querySelectorAll(".satellite-image")[index];

      if (satelliteElement) {
        gsap.killTweensOf(satelliteElement);

        gsap.to(satelliteElement, {
          opacity: 1,
          scale: 1,
          x: Math.cos((angle * Math.PI) / 180) * radius,
          y: Math.sin((angle * Math.PI) / 180) * radius,
          duration: 0.6,
          delay: index * 0.1,
          ease: "power3.out",
        });
      }
    });
  }, 150);
};

const handleMouseLeave = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }

  isHovered.value = false;
  const container = containerRef.value;
  if (!container) return;

  const mainImage = container.querySelector(".main-image");
  if (mainImage) {
    gsap.killTweensOf(mainImage);

    gsap.to(mainImage, {
      scale: 1,
      duration: 0.4,
      ease: "power2.inOut",
    });
  }

  container.querySelectorAll(".satellite-image").forEach((element) => {
    gsap.killTweensOf(element);

    gsap.to(element, {
      opacity: 0,
      scale: 0.5,
      x: 0,
      y: 0,
      duration: 0.3,
      ease: "power3.in",
    });
  });
};

onUnmounted(() => {
  // Without this a pending hover timer, and any tween still running, keep
  // touching nodes after the component is gone.
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
    hoverTimeout.value = null;
  }

  const container = containerRef.value;
  if (container) {
    gsap.killTweensOf(
        container.querySelectorAll(".main-image, .satellite-image"),
    );
  }
});
</script>

<template>
  <div
      ref="containerRef"
      class="grid h-[220px] w-[220px] sm:h-[280px] sm:w-[280px] md:h-[400px] md:w-[400px] place-items-center"
  >
    <div class="grid grid-cols-1 grid-rows-1 place-items-center">
      <!-- Main center image -->
      <img
          :alt="alt ?? 'Main image'"
          :src="mainImage"
          class="main-image border-border-dark col-start-1 row-start-1 h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] md:h-[280px] md:w-[280px] rounded-full border-2 object-cover shadow-lg transition-shadow duration-300 hover:cursor-pointer hover:shadow-xl"
          style="object-position: center top"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
      />

      <!-- Satellite images -->
      <template v-for="(image, index) in satelliteImages" :key="index">
        <img
            :alt="`Satellite image ${index + 1}`"
            :src="image"
            class="satellite-image border-border-dark col-start-1 row-start-1 h-[70px] w-[70px] sm:h-[100px] sm:w-[100px] md:h-[150px] md:w-[150px] scale-50 rounded-full border-1 object-cover opacity-0 shadow-md"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.satellite-image {
  transform-origin: center center;
  will-change: transform, opacity;
  object-position: center top;
}

.main-image {
  z-index: 2;
}

.satellite-image {
  z-index: 1;
}
</style>

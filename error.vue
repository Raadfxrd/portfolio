<template>
  <div
      class="bg-background-light-2 dark:bg-background-dark-2 flex min-h-screen w-full items-start justify-center"
  >
    <!-- Deliberately self-contained rather than wrapped in the default
         layout: the footer suspends on the blog-posts request, and an error
         page that depends on a working API is an error page that fails when
         it is needed most. -->
    <div
        class="bg-background-light dark:bg-background-dark border-x-border-dark flex min-h-screen w-full flex-col items-center justify-center gap-8 border-x-0 border-solid px-4 py-16 text-center md:border-x lg:w-2/3"
    >
      <NuxtLink aria-label="Back to home" to="/">
        <img
            alt=""
            class="border-border-dark h-12 w-12 rounded-full border object-cover"
            src="/img/raadfxrd.jpeg"
            style="object-position: center top"
        />
      </NuxtLink>

      <div>
        <p class="gradient w-fit mx-auto text-6xl font-bold md:text-8xl">
          {{ statusCode }}
        </p>
        <h1 class="text-text-primary mt-4 text-xl font-bold md:text-2xl">
          {{ title }}
        </h1>
        <p
            class="text-text-secondary mx-auto mt-3 max-w-md text-sm leading-relaxed md:text-base"
        >
          {{ message }}
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <button
            class="bg-button-primary text-text-primary hover:bg-background-light-2 rounded-md px-4 py-2 text-xs font-medium shadow-sm transition-all duration-300 md:text-sm"
            type="button"
            @click="handleClear"
        >
          Back home
        </button>
        <NuxtLink
            class="border-border-light text-text-primary hover:bg-background-light-2 rounded-md border px-4 py-2 text-xs font-medium transition-all duration-300 md:text-sm"
            to="/projects"
        >
          View projects
        </NuxtLink>
        <NuxtLink
            class="border-border-light text-text-primary hover:bg-background-light-2 rounded-md border px-4 py-2 text-xs font-medium transition-all duration-300 md:text-sm"
            to="/blog"
        >
          Read the blog
        </NuxtLink>
      </div>

      <!-- Surfaced in development only: in production this is either noise or
           an information leak. -->
      <pre
          v-if="isDev && error?.message"
          class="bg-background-light-2 text-text-secondary max-w-full overflow-x-auto rounded-md px-4 py-3 text-left text-xs"
      >{{ error.message }}</pre>
    </div>

    <CustomCursor/>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { NuxtError } from "#app";
import CustomCursor from "~/components/CustomCursor.vue";

const props = defineProps<{ error?: NuxtError }>();

const isDev = import.meta.dev;

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);

const title = computed(() =>
    isNotFound.value ? "This page doesn't exist" : "Something went wrong",
);

const message = computed(() =>
    isNotFound.value
        ? "The link might be out of date, or the page may have moved. Try one of these instead."
        : "That is on my end, not yours. Try again in a moment, or head somewhere else.",
);

// clearError tears down the error state before navigating, so the app does
// not render the error page again on the next route.
const handleClear = () => clearError({ redirect: "/" });

useSeoMeta({
  title: () => `${statusCode.value} - Borys`,
  // Nothing here is worth indexing, and a soft 404 in the index is worse
  // than none at all.
  robots: "noindex, follow",
});
</script>

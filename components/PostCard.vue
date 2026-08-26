<template>
  <NuxtLink
      :to="post.path"
      class="group block rounded-lg bg-transparent transition-all duration-300"
  >
    <div
        class="motion-surface hover-lift bg-background-light group-hover:bg-background-light-2/90 flex h-full flex-col justify-between rounded-lg p-4 transition-all duration-300 group-hover:cursor-pointer"
    >
      <!-- Post Title -->
      <h3 class="mb-2 text-xs font-medium md:text-sm">
        {{ post.title }}
      </h3>

      <!-- Post Description -->
      <p class="text-text-secondary mb-3 line-clamp-3 text-xs">
        {{ post.description }}
      </p>

      <!-- Author and Date -->
      <div class="flex items-center justify-between">
        <span class="text-text-secondary text-xs">{{ formattedDate }}</span>
        <p
            class="text-text-primary text-xs transition-transform group-hover:translate-x-0.5"
        >
          Read More →
        </p>
      </div>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
import { computed } from "vue";

/**
 * Previously written as an Options component importing `defineComponent` from
 * `@vue/composition-api` — the Vue 2 backport, which is not a dependency of
 * this project and does not resolve under Vue 3.
 */
interface Post {
  path: string;
  title: string;
  description: string;
  date?: string;
}

const props = defineProps<{ post: Post }>();

const formattedDate = computed(() => {
  if (!props.post.date) return "No date found.";

  const date = new Date(props.post.date);
  if (Number.isNaN(date.getTime())) return "Date couldn't be parsed correctly.";

  return new Intl.DateTimeFormat("nl-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
});
</script>

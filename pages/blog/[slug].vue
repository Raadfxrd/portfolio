<script lang="ts" setup>
import {computed, watch} from "vue";
import {useRoute} from "vue-router";
import {useAsyncData} from "#app";
import {ChevronLeftIcon} from "@heroicons/vue/24/outline";
import {marked} from "marked";

const route = useRoute();
const slug = computed(() => {
  const paramSlug = route.params.slug;
  return Array.isArray(paramSlug) ? paramSlug[0] : paramSlug;
});

const {
  data: post,
  error,
  refresh,
} = await useAsyncData(`blog-${slug.value}`, async () => {
  try {
    const posts = await $fetch("/api/cms/posts");
    if (!posts || !Array.isArray(posts)) {
      console.error("Posts API returned invalid data:", posts);
      return null;
    }
    const result = posts.find((p: any) => p.slug === slug.value);
    if (!result) {
      console.error(
          "Post not found with slug:",
          slug.value,
          "Available slugs:",
          posts.map((p: any) => p.slug),
      );
      return null;
    }
    return result;
  } catch (e) {
    console.error("Error loading post:", e);
    return null;
  }
});

// Convert Markdown content to HTML
const htmlContent = computed(() => {
  if (!post.value?.content) return "";
  return marked(post.value.content);
});

// Set SEO meta tags
watchEffect(() => {
  if (post.value) {
    useSeoMeta({
      title: `${post.value.title} - Borys`,
      description: post.value.description,
      ogTitle: post.value.title,
      ogDescription: post.value.description,
      ogType: "article",
    });
  }
});

watch(
    () => slug.value,
    async () => {
      await refresh();
    },
);

const formatDate = (date: string) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};
</script>

<template>
  <section
      class="bg-background-light text-text-primary font-default min-h-screen px-4 pt-20 pb-12 md:px-6 md:pt-24 md:pb-16"
  >
    <!-- Loading State -->
    <div
        v-if="!post && !error"
        class="flex min-h-[50vh] items-center justify-center"
    >
      <div class="text-text-secondary text-center">
        <div class="mb-4 text-lg md:text-xl">Loading post...</div>
      </div>
    </div>

    <!-- Post Content -->
    <div v-else-if="post" class="mx-auto max-w-3xl space-y-6 md:space-y-8">
      <h1
          class="text-text-primary text-2xl leading-snug font-bold tracking-tight md:text-3xl lg:text-5xl"
      >
        {{ post.title }}
      </h1>

      <div
          class="text-text-secondary border-border-light flex flex-col items-start justify-between gap-2 border-b pb-3 text-xs sm:flex-row sm:items-center sm:gap-0 md:text-sm"
      >
        <span v-if="post.author">By {{ post.author }}</span>
        <span v-if="post.date">{{ formatDate(post.date) }}</span>
      </div>

      <article>
        <div
            class="markdown prose prose-sm md:prose-base dark:prose-invert max-w-none"
            v-html="htmlContent"
        />
      </article>

      <div class="pt-8 md:pt-10">
        <RouterLink
            class="group bg-background-dark text-text-primary hover:bg-opacity-80 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition md:px-4 md:text-sm"
            to="/blog"
        >
          <span
              class="relative inline-flex h-4 w-4 items-center justify-center"
          >
            <ChevronLeftIcon
                class="text-text-primary h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-x-1"
            />
          </span>
          Back to Blog
        </RouterLink>
      </div>
    </div>

    <!-- Error/Not Found State -->
    <div v-else class="mx-auto max-w-3xl">
      <div class="py-16 text-center md:py-20">
        <h2 class="text-text-primary mb-4 text-2xl font-bold md:text-3xl">
          Post Not Found
        </h2>
        <p class="text-text-secondary mb-8 text-base md:text-lg">
          The blog post you're looking for doesn't exist or may have been
          removed.
        </p>
        <RouterLink
            class="bg-background-dark text-text-primary hover:bg-opacity-80 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition md:px-6 md:text-base"
            to="/blog"
        >
          <ChevronLeftIcon class="h-5 w-5"/>
          Back to Blog
        </RouterLink>
      </div>
    </div>
  </section>
</template>

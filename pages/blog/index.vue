<template>
  <div class="relative w-full">
    <section
        class="container mx-auto min-h-screen px-4 pt-20 pb-12 md:px-6 md:pt-30 md:pb-20"
    >
      <div class="mx-auto max-w-6xl">
        <!-- Header -->
        <div class="relative mb-8 md:mb-12">
          <h1
              class="gradient relative z-10 mb-3 w-fit pb-1 text-3xl font-bold md:mb-4 md:text-4xl lg:text-5xl"
          >
            Blog
          </h1>
          <p
              class="text-text-secondary relative z-10 w-fit max-w-2xl text-sm md:text-base lg:text-lg"
          >
            My journey through code, design, and everything in between—sharing
            what I learn along the way
          </p>
        </div>

        <!-- Loading State -->
        <div
            v-if="pending"
            class="flex items-center justify-center py-12 md:py-20"
        >
          <div class="text-text-secondary text-base md:text-lg">
            Loading posts...
          </div>
        </div>

        <!-- Error State -->
        <div
            v-else-if="error"
            class="flex items-center justify-center py-12 md:py-20"
        >
          <div class="text-base text-red-500 md:text-lg">
            Failed to load blog posts. Please try again later.
          </div>
        </div>

        <!-- Blog Posts Grid -->
        <div
            v-else-if="posts && posts.length > 0"
            class="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
        >
          <NuxtLink
              v-for="(post, index) in posts"
              :key="post.path"
              :to="post.path"
              class="bg-background-light hover:bg-background-light-2 hover:border-button-primary group flex flex-col overflow-hidden rounded-lg border border-transparent shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <!-- Header -->
            <div
                :class="getGradientClass(index)"
                class="relative h-32 w-full overflow-hidden md:h-40"
            >
              <!-- Gradient -->
              <div
                  class="absolute inset-0 bg-linear-to-br from-white/10 to-transparent transition-all duration-500 group-hover:from-white/20"
              ></div>

              <!-- Shapes -->
              <div
                  class="absolute top-2 right-2 h-16 w-16 rounded-full border-2 border-white/20 transition-all duration-700 group-hover:scale-150 group-hover:rotate-180"
              ></div>
              <div
                  class="absolute bottom-3 left-3 h-12 w-12 rounded-full bg-white/10 transition-all duration-500 group-hover:scale-125"
              ></div>
              <div
                  class="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-white/10 transition-all duration-700 group-hover:rotate-90"
              ></div>
            </div>

            <!-- Content -->
            <div class="flex flex-1 flex-col p-2 md:p-3">
              <!-- Date -->
              <div
                  class="text-text-secondary mb-3 flex items-center gap-2 text-xs"
              >
                <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                  />
                </svg>
                <span>{{ formatDate(post.date) }}</span>
              </div>

              <!-- Title -->
              <h2
                  class="text-text-secondary group-hover:text-text-primary mb-3 line-clamp-3 text-lg font-bold transition-colors md:text-xl"
              >
                {{ post.title }}
              </h2>

              <!-- Description -->
              <p
                  class="text-text-secondary group-hover:text-text-primary mb-4 line-clamp-3 text-sm leading-relaxed transition-colors"
              >
                {{ post.description }}
              </p>

              <!-- Read More -->
              <div
                  class="text-text-secondary group-hover:text-text-primary mt-auto flex items-center gap-1 text-sm font-semibold transition-all"
              >
                <span class="relative"> Read More </span>
                <svg
                    class="h-4 w-4 transition-all group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                  />
                </svg>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- No Posts -->
        <div
            v-else
            class="flex flex-col items-center justify-center py-12 md:py-20"
        >
          <div class="text-text-secondary mb-4 text-lg">No blog posts yet</div>
          <p class="text-text-secondary text-sm">
            Check back soon for new content!
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Blog - Borys",
  description:
      "Read my latest blog posts about software development, design, and technology",
});

// Fetch all blog posts from API
const {
  data: posts,
  pending,
  error,
} = await useAsyncData("blog-posts", async () => {
  try {
    const data = await $fetch("/api/cms/posts");
    // Filter only published posts and format them
    if (!data || !Array.isArray(data)) return [];
    return data
        .filter((post: any) => post.published)
        .map((post: any) => ({
          ...post,
          path: `/blog/${post.slug}`,
        }))
        .sort(
            (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
  } catch (e) {
    console.error("Failed to load posts:", e);
    return [];
  }
});

// Format date helper
const formatDate = (date: string) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

// Get dynamic gradient class based on index for variety
const getGradientClass = (index: number) => {
  const gradients = [
    "bg-gradient-to-br from-blue-400 via-blue-300 to-purple-400",
    "bg-gradient-to-br from-purple-400 via-pink-300 to-red-400",
    "bg-gradient-to-br from-green-400 via-teal-300 to-blue-400",
    "bg-gradient-to-br from-orange-400 via-red-300 to-pink-400",
    "bg-gradient-to-br from-cyan-400 via-blue-300 to-indigo-400",
    "bg-gradient-to-br from-rose-400 via-pink-300 to-purple-400",
  ];
  return gradients[index % gradients.length];
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<script lang="ts" setup>
import {ArrowTopRightOnSquareIcon} from "@heroicons/vue/24/outline";

useSeoMeta({
  title: "Sitemap - Borys",
  description: "Browse all pages and content on borysbabas.dev",
});

const {data: posts} = await useAsyncData(async () => {
  try {
    const data = await $fetch("/api/cms/posts");
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

const pageDescriptions: Record<string, string> = {
  "/": "Welcome to my portfolio",
  "/projects": "Explore my GitHub projects and repositories",
  "/services": "PC building and custom keyboard assembly services",
  "/interests": "My hobbies and personal interests",
  "/contact": "Get in touch with me",
  "/privacy": "How I handle your data",
  "/terms": "Terms and conditions",
  "/blog": "Read my latest blog posts and articles",
};

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/projects": "Projects",
  "/services": "Services",
  "/interests": "Interests",
  "/contact": "Contact",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/blog": "Blog",
};

const pageCategories: Record<string, "main" | "legal"> = {
  "/": "main",
  "/projects": "main",
  "/services": "main",
  "/interests": "main",
  "/contact": "main",
  "/blog": "main",
  "/privacy": "legal",
  "/terms": "legal",
};

const router = useRouter();
const routes = router.getRoutes();

const mainPages = routes
    .filter((route) => {
      const path = route.path;
      return (
          pageCategories[path] === "main" &&
          !path.includes(":") &&
          path !== "/sitemap"
      );
    })
    .map((route) => ({
      name: pageTitles[route.path] || route.path.split("/").pop() || "Home",
      path: route.path,
      description: pageDescriptions[route.path] || "Explore this page",
    }))
    .sort((a, b) => {
      if (a.path === "/") return -1;
      if (b.path === "/") return 1;
      return a.name.localeCompare(b.name);
    });

const legalPages = routes
    .filter((route) => pageCategories[route.path] === "legal")
    .map((route) => ({
      name: pageTitles[route.path] || route.path.replace("/", ""),
      path: route.path,
      description: pageDescriptions[route.path] || "Legal information",
    }));

const externalLinks = [
  {
    name: "GitHub",
    url: "https://github.com/raadfxrd",
    description: "View my code repositories",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/borys-babas/",
    description: "Professional profile",
  },
  {
    name: "CV / Resume",
    url: "/assets/borys-cv.pdf",
    description: "Download my resume",
  },
];
</script>

<template>
  <div class="relative w-full">
    <section
        class="container mx-auto min-h-screen px-4 pt-20 pb-12 md:px-6 md:pt-30 md:pb-20"
    >
      <div class="mx-auto max-w-5xl">
        <div class="mb-8 md:mb-12">
          <h1
              class="gradient w-fit pb-3 text-3xl font-bold md:mb-4 md:text-4xl lg:text-5xl"
          >
            Sitemap
          </h1>
          <p class="text-text-secondary w-fit text-sm md:text-lg">
            Navigate through all pages and content on my website
          </p>
        </div>

        <div class="space-y-8 md:space-y-12">
          <section>
            <h2
                class="text-text-primary mb-4 w-fit text-xl font-semibold md:mb-6 md:text-2xl"
            >
              Main Pages
            </h2>
            <div class="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              <NuxtLink
                  v-for="page in mainPages"
                  :key="page.path"
                  :to="page.path"
                  class="bg-background-light hover:bg-background-light-2 hover:border-button-primary group block rounded-lg border border-transparent p-4 transition-all duration-300 md:p-5"
              >
                <h3
                    class="text-text-secondary group-hover:text-text-primary mb-1.5 text-base font-semibold transition-colors md:mb-2 md:text-lg"
                >
                  {{ page.name }}
                </h3>
                <p
                    class="text-text-secondary group-hover:text-text-primary text-xs transition-colors md:text-sm"
                >
                  {{ page.description }}
                </p>
              </NuxtLink>
            </div>
          </section>

          <section v-if="posts && posts.length > 0">
            <h2
                class="text-text-primary mb-4 w-fit text-xl font-semibold md:mb-6 md:text-2xl"
            >
              Blog Posts ({{ posts.length }})
            </h2>
            <div class="bg-background-light rounded-lg p-4 md:p-6">
              <div class="space-y-2 md:space-y-3">
                <NuxtLink
                    v-for="post in posts"
                    :key="post.path"
                    :to="post.path"
                    class="hover:bg-background-light-2 group flex items-center justify-between rounded-lg p-2 transition-all duration-200 md:p-3"
                >
                  <div class="flex-1">
                    <h3
                        class="text-text-secondary group-hover:text-text-primary mb-0.5 text-sm font-medium transition-colors md:mb-1 md:text-base"
                    >
                      {{ post.title }}
                    </h3>
                    <p
                        class="text-text-secondary group-hover:text-text-primary text-xs transition-colors md:text-sm"
                    >
                      {{ post.description }}
                    </p>
                    <p
                        class="text-text-secondary group-hover:text-text-primary mt-0.5 text-xs transition-colors md:mt-1"
                    >
                      {{
                        new Date(post.date).toLocaleDateString("en-NL", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      }}
                    </p>
                  </div>
                  <ArrowTopRightOnSquareIcon
                      class="text-text-secondary group-hover:text-text-primary ml-3 h-4 w-4 shrink-0 transition-colors md:ml-4 md:h-5 md:w-5"
                  />
                </NuxtLink>
              </div>
            </div>
          </section>

          <section>
            <h2
                class="text-text-primary mb-4 w-fit text-xl font-semibold md:mb-6 md:text-2xl"
            >
              External Links
            </h2>
            <div class="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
              <a
                  v-for="link in externalLinks"
                  :key="link.url"
                  :href="link.url"
                  class="bg-background-light hover:bg-background-light-2 hover:border-button-primary group flex items-start justify-between rounded-lg border border-transparent p-4 transition-all duration-300 md:p-5"
                  rel="noopener noreferrer"
                  target="_blank"
              >
                <div class="flex-1">
                  <h3
                      class="text-text-secondary group-hover:text-text-primary mb-1.5 text-base font-semibold transition-colors md:mb-2 md:text-lg"
                  >
                    {{ link.name }}
                  </h3>
                  <p
                      class="text-text-secondary group-hover:text-text-primary text-xs transition-colors md:text-sm"
                  >
                    {{ link.description }}
                  </p>
                </div>
                <ArrowTopRightOnSquareIcon
                    class="text-text-secondary group-hover:text-text-primary ml-2 h-4 w-4 shrink-0 transition-colors md:ml-3 md:h-5 md:w-5"
                />
              </a>
            </div>
          </section>

          <section>
            <h2
                class="text-text-primary mb-4 w-fit text-xl font-semibold md:mb-6 md:text-2xl"
            >
              Legal & Policies
            </h2>
            <div class="grid gap-3 sm:grid-cols-2 md:gap-4">
              <NuxtLink
                  v-for="page in legalPages"
                  :key="page.path"
                  :to="page.path"
                  class="bg-background-light hover:bg-background-light-2 hover:border-button-primary group block rounded-lg border border-transparent p-4 transition-all duration-300 md:p-5"
              >
                <h3
                    class="text-text-secondary group-hover:text-text-primary mb-1.5 text-base font-semibold transition-colors md:mb-2 md:text-lg"
                >
                  {{ page.name }}
                </h3>
                <p
                    class="text-text-secondary group-hover:text-text-primary text-xs transition-colors md:text-sm"
                >
                  {{ page.description }}
                </p>
              </NuxtLink>
            </div>
          </section>

          <section class="bg-background-light rounded-lg p-4 md:p-6">
            <h2 class="text-text-primary mb-4 w-fit text-xl font-semibold">
              About This Sitemap
            </h2>
            <p class="text-text-secondary text-xs leading-relaxed md:text-sm">
              This sitemap provides a comprehensive overview of all pages and
              content available on my portfolio website. If you're looking for
              something specific or have any questions, feel free to
              <NuxtLink class="social-link underline" to="/contact">
                contact me
              </NuxtLink>
              .
            </p>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<template>
  <footer
      class="bg-background-light border-border-dark mt-auto w-full border-t border-solid py-10 md:py-16"
  >
    <div class="mx-auto w-11/12 max-w-7xl">
      <div
          class="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:mb-16 md:gap-12 lg:grid-cols-4"
      >
        <div class="space-y-4 md:space-y-6 md:pr-8">
          <h3
              class="text-text-primary gradient w-fit text-lg font-bold md:text-xl"
          >
            Borys Babas
          </h3>
          <p
              class="text-text-secondary w-fit text-xs leading-relaxed md:text-sm"
          >
            Crafting digital experiences with passion and precision.
          </p>
          <div class="flex items-center space-x-4 md:space-x-6">
            <a
                class="group block transform transition-all duration-200 ease-out hover:scale-110"
                href="https://github.com/raadfxrd"
                target="_blank"
            >
              <i
                  class="devicon-github-original text-text-secondary group-hover:text-text-primary align-middle text-xl transition-colors duration-200 md:text-2xl"
              ></i>
            </a>
            <a
                class="group block transform transition-all duration-200 ease-out hover:scale-110"
                href="https://linkedin.com/in/borys-babas"
                target="_blank"
            >
              <i
                  class="devicon-linkedin-plain text-text-secondary group-hover:text-text-primary align-middle text-xl transition-colors duration-200 md:text-2xl"
              ></i>
            </a>
            <a
                aria-label="Instagram"
                class="group block transform transition-all duration-200 ease-out hover:scale-110"
                href="https://www.instagram.com/borysbabas/"
                target="_blank"
            >
              <svg
                  class="text-text-secondary group-hover:text-text-primary h-[1.25rem] w-[1.25rem] align-middle transition-colors duration-200 md:h-[1.5rem] md:w-[1.5rem]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </a>
          </div>
        </div>

        <div class="space-y-4 md:space-y-6">
          <h4
              class="text-text-primary w-fit text-xs font-bold tracking-wider uppercase md:text-sm"
          >
            Navigation
          </h4>
          <ul class="space-y-2 md:space-y-3">
            <li v-for="link in navigationLinks" :key="link.path">
              <NuxtLink
                  :to="link.path"
                  class="text-text-secondary hover:text-text-primary group flex w-fit items-center justify-start gap-2 text-xs transition-colors md:text-sm"
              >
                <span
                    class="bg-text-primary h-px w-0 transition-all duration-300 group-hover:w-4"
                ></span>
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4 md:space-y-6">
          <h4
              class="text-text-primary w-fit text-xs font-bold tracking-wider uppercase md:text-sm"
          >
            Latest Posts
          </h4>
          <ul class="space-y-3 md:space-y-4">
            <li v-for="post in latestPosts" :key="post.slug">
              <NuxtLink :to="`/blog/${post.slug}`" class="group block w-fit">
                <h5
                    class="text-text-secondary group-hover:text-text-primary line-clamp-2 text-xs font-medium transition-colors md:text-sm"
                >
                  {{ post.title }}
                </h5>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4 md:space-y-6">
          <h4
              class="text-text-primary w-fit text-xs font-bold tracking-wider uppercase md:text-sm"
          >
            Contact
          </h4>
          <div class="space-y-2 md:space-y-3">
            <button
                class="text-text-secondary hover:text-text-primary flex w-fit cursor-pointer items-center gap-2 text-xs transition-colors md:text-sm"
                @click="handleEmailClick"
            >
              <EnvelopeIcon
                  class="text-text-secondary group-hover:text-text-primary h-4 w-4 md:h-5 md:w-5"
              />
              <span>{{ displayEmail }}</span>
            </button>
            <a
                class="text-text-secondary hover:text-text-primary flex w-fit items-center gap-2 text-xs transition-colors md:text-sm"
                href="tel:+31618900864"
            >
              <DevicePhoneMobileIcon
                  class="text-text-secondary group-hover:text-text-primary h-4 w-4 md:h-5 md:w-5"
              />
              +31 6 1890 0864
            </a>
          </div>
        </div>
      </div>

      <div class="border-border-light border-t pt-6 md:pt-8">
        <div
            class="flex flex-col items-center justify-between gap-3 md:flex-row md:gap-4"
        >
          <p
              class="text-text-secondary text-center text-xs md:text-left md:text-sm"
          >
            © {{ new Date().getFullYear() }} borysbabas<span
              class="cursor-default select-none"
              @dblclick="navigateToLogin"
          >.dev</span
          >
            - All rights reserved.
          </p>
          <div class="flex items-center space-x-4 md:space-x-6">
            <NuxtLink
                v-for="link in legalLinks"
                :key="link.path"
                :to="link.path"
                class="text-text-secondary hover:text-text-primary text-xs transition-colors md:text-sm"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import {DevicePhoneMobileIcon, EnvelopeIcon} from "@heroicons/vue/24/outline";

const {decodeEmail, revealEmail} = useEmailObfuscation();

const encodedEmail = "Ym9yeXNiYWJhc0BwbS5tZQ==";
const displayEmail = computed(() => decodeEmail(encodedEmail));

const handleEmailClick = () => {
  revealEmail(encodedEmail);
};

const navigationLinks = [
  {path: "/", label: "Home"},
  {path: "/blog", label: "Blog"},
  {path: "/projects", label: "Projects"},
  {path: "/interests", label: "Interests"},
  {path: "/services", label: "Services"},
  {path: "/contact", label: "Contact"},
];

const legalLinks = [
  {path: "/privacy", label: "Privacy Policy"},
  {path: "/terms", label: "Terms of Service"},
  {path: "/sitemap", label: "Sitemap"},
];

const {data: footerPosts} = await useAsyncData("footer-posts", async () => {
  try {
    const posts = await $fetch("/api/cms/posts");
    if (!posts || !Array.isArray(posts)) return [];
    return posts
        .filter((post: any) => post.published)
        .sort(
            (a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        .slice(0, 3);
  } catch (e) {
    console.error("Failed to load footer posts:", e);
    return [];
  }
});

const latestPosts = computed(
    () =>
        footerPosts.value?.map((post: any) => ({
          title: post.title,
          slug: post.slug,
        })) || [],
);

const navigateToLogin = () => {
  navigateTo("/admin/login");
};
</script>

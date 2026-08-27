<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CodeBracketIcon,
  StarIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";
import type { PublicRepo } from "~/server/api/github/repos.get";
import SkeletonCard from "~/components/SkeletonCard.vue";

const loadingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const minimumDelayPassed = ref(false);
const skeletonCount = 6;
const minimumLoadingMs = 300;

/**
 * The repo list is assembled and cached server-side. The browser used to call
 * the GitHub API directly, which required shipping a token to the client and
 * burned ~60 requests per page view against a 60-per-hour limit.
 *
 * Lazy, and deliberately not awaited: an awaited client-only useFetch suspends
 * this component's setup, so clicking "Projects" in the navbar sat on the old
 * page until GitHub answered. Lazy swaps the page in immediately and the
 * skeleton covers the wait.
 */
const {
  data,
  status,
  error: fetchError,
} = useLazyFetch("/api/github/repos", {
  key: "github-repos",
  server: false,
  default: (): PublicRepo[] => [],
});

const loading = computed(
  () =>
    !minimumDelayPassed.value ||
    status.value === "idle" ||
    status.value === "pending",
);

const error = computed(() =>
  fetchError.value ? "Failed to load projects. Please try again later." : null,
);

// The pinned profile repo is presented separately from the grid.
const featuredRepo = computed<PublicRepo | null>(
  () => data.value?.find((repo) => repo.name === "raadfxrd") ?? null,
);

const repos = computed<PublicRepo[]>(() =>
  (data.value ?? []).filter((repo) => repo.name !== "raadfxrd"),
);

onMounted(() => {
  // Hold the skeleton briefly so a fast cache hit does not flash.
  loadingTimeout.value = setTimeout(() => {
    minimumDelayPassed.value = true;
  }, minimumLoadingMs);
});

onUnmounted(() => {
  if (loadingTimeout.value) clearTimeout(loadingTimeout.value);
});

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.replace(/[-_]+/g, " ").split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
  return (first + second).toUpperCase();
};
</script>

<template>
  <div class="min-h-screen w-full pt-20 pb-12 md:pt-30 md:pb-20">
    <div class="container mx-auto max-w-6xl px-4 md:px-6">
      <div class="mb-8 md:mb-12">
        <h1
            class="gradient mb-3 w-fit pb-1 text-2xl font-bold md:mb-4 md:text-3xl lg:text-5xl"
        >
          Projects
        </h1>
        <p class="text-text-secondary w-fit text-sm md:text-base lg:text-lg">
          Here are some of my recent projects from GitHub
        </p>
      </div>

      <div
          v-if="loading"
          class="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
      >
        <SkeletonCard v-for="n in skeletonCount" :key="`skeleton-${n}`"/>
      </div>
      <div
          v-else-if="error"
          class="flex items-center justify-center py-12 md:py-20"
      >
        <div class="text-base text-red-500 md:text-lg">{{ error }}</div>
      </div>
      <div v-else>
        <!-- Featured Repository -->
        <FadeInSection
            v-if="featuredRepo"
            :delay="0"
            :distance="24"
            class="mb-8 md:mb-12"
        >
          <article
              class="featured-repo bg-background-light border-border-light relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl"
          >
            <div class="absolute top-4 right-4 z-10">
              <span class="featured-badge">
                <StarIconSolid class="mr-1 inline-block h-4 w-4"/>
                Featured
              </span>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <!-- Image Section -->
              <div class="relative overflow-hidden md:rounded-l-2xl">
                <div v-if="featuredRepo.thumbnail" class="featured-thumbnail">
                  <img
                      :alt="`${featuredRepo.name} thumbnail`"
                      :src="featuredRepo.thumbnail"
                      class="featured-repo__thumb h-full w-full object-cover"
                      @error="
                      (e) =>
                        ((e.target as HTMLImageElement).style.display = 'none')
                    "
                  />
                </div>
                <div v-else class="featured-fallback">
                  <span class="featured-fallback__initials">
                    {{ getInitials(featuredRepo.name) }}
                  </span>
                </div>
              </div>

              <!-- Content Section -->
              <div class="flex flex-col justify-center p-6 md:p-8">
                <h2
                    class="gradient mb-4 w-fit text-2xl font-bold md:text-3xl lg:text-4xl"
                >
                  {{ featuredRepo.readmeTitle || featuredRepo.name }}
                </h2>
                <p
                    class="text-text-secondary mb-6 text-base leading-relaxed md:text-lg"
                    style="
                    display: -webkit-box;
                    -webkit-line-clamp: 8;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  "
                >
                  {{
                    featuredRepo.readmeDescription || featuredRepo.description
                  }}
                </p>

                <div
                    v-if="featuredRepo.topics.length > 0"
                    class="mb-6 flex flex-wrap gap-2"
                >
                  <span
                      v-for="topic in featuredRepo.topics"
                      :key="topic"
                      class="featured-topic"
                  >
                    {{ topic }}
                  </span>
                </div>

                <div
                    class="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-400"
                >
                  <span
                      v-if="featuredRepo.language"
                      class="flex items-center gap-2"
                  >
                    <span class="h-3 w-3 rounded-full bg-blue-500"></span>
                    {{ featuredRepo.language }}
                  </span>
                  <span class="flex items-center gap-2">
                    <StarIcon class="h-4 w-4"/>
                    {{ featuredRepo.stargazers_count }} stars
                  </span>
                  <span
                      v-if="featuredRepo.forks_count"
                      class="flex items-center gap-2"
                  >
                    <CodeBracketIcon class="h-4 w-4"/>
                    {{ featuredRepo.forks_count }} forks
                  </span>
                  <span
                      v-if="featuredRepo.updated_at"
                      class="flex items-center gap-2"
                  >
                    <CalendarIcon class="h-4 w-4"/>
                    {{ formatDate(featuredRepo.updated_at) }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-3">
                  <a
                      :href="featuredRepo.html_url"
                      class="featured-button featured-button-primary"
                      rel="noopener noreferrer"
                      target="_blank"
                  >
                    <span>View on GitHub</span>
                    <ArrowTopRightOnSquareIcon class="h-4 w-4"/>
                  </a>
                  <a
                      v-if="featuredRepo.homepage"
                      :href="featuredRepo.homepage"
                      class="featured-button featured-button-secondary"
                      rel="noopener noreferrer"
                      target="_blank"
                  >
                    <span>Live Demo</span>
                    <ArrowTopRightOnSquareIcon class="h-4 w-4"/>
                  </a>
                </div>
              </div>
            </div>
          </article>
        </FadeInSection>

        <!-- Regular Repositories Grid -->
        <div class="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          <FadeInSection
              v-for="(repo, index) in repos"
              :key="repo.id"
              :delay="index * 60"
              :distance="18"
              class="h-full"
          >
            <article
                class="repo-card bg-background-light border-border-light flex h-full flex-col rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                  v-if="repo.thumbnail"
                  class="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-800"
              >
                <img
                    :alt="`${repo.name} thumbnail`"
                    :src="repo.thumbnail"
                    class="repo-card__thumb h-full w-full object-cover"
                    @error="
                    (e) =>
                      ((e.target as HTMLImageElement).style.display = 'none')
                  "
                />
              </div>
              <div
                  v-else
                  class="repo-fallback text-text-primary/80 aspect-video w-full rounded-t-lg bg-linear-to-br from-blue-200 to-red-200"
              >
                <span class="repo-fallback__initials">
                  {{ getInitials(repo.name) }}
                </span>
              </div>
              <div class="flex flex-1 flex-col p-4">
                <h3 class="text-text-primary mb-2 w-fit text-lg font-semibold">
                  {{ repo.readmeTitle || repo.name }}
                </h3>
                <p class="text-text-secondary mb-3 line-clamp-3 text-sm">
                  {{ repo.readmeDescription || repo.description }}
                </p>
                <div
                    v-if="repo.topics.length > 0"
                    class="mb-3 flex flex-wrap gap-2"
                >
                  <span
                      v-for="topic in repo.topics.slice(0, 6)"
                      :key="topic"
                      class="bg-background-light-2 text-text-secondary rounded-full px-2 py-1 text-[10px] tracking-wide uppercase"
                  >
                    {{ topic }}
                  </span>
                </div>
                <div
                    class="mt-auto flex items-center justify-between border-t border-gray-700 pt-3"
                >
                  <div
                      class="flex flex-wrap items-center gap-3 text-xs text-gray-400"
                  >
                    <span v-if="repo.language" class="flex items-center gap-1">
                      <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                      {{ repo.language }}
                    </span>
                    <span class="flex items-center gap-1">
                      <StarIcon class="h-3 w-3"/>
                      {{ repo.stargazers_count }}
                    </span>
                    <span
                        v-if="repo.updated_at"
                        class="flex items-center gap-1"
                    >
                      · {{ formatDate(repo.updated_at) }}
                    </span>
                  </div>

                  <a
                      :href="repo.html_url"
                      class="text-text-primary hover:text-text-secondary text-xs transition-colors"
                      rel="noopener noreferrer"
                      target="_blank"
                  >
                    View on GitHub →
                  </a>
                </div>
                <a
                    v-if="repo.homepage"
                    :href="repo.homepage"
                    class="text-text-primary hover:text-text-secondary mt-2 text-xs transition-colors"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                  Live Demo
                </a>
              </div>
            </article>
          </FadeInSection>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The twist came from the global `img:hover` rule, which only fires while the
   pointer sits on the thumbnail itself. Anchor it to the card instead, so
   hovering anywhere on a project -- title, description, topics, the meta row
   -- moves its image. */
.repo-card:hover .repo-card__thumb,
.featured-repo:hover .featured-repo__thumb {
  transform: scale(1.07) rotate(1deg);
}

/* Snapping instantly into a scale-and-rotate is not an improvement on
   animating into one -- drop the movement entirely instead. */
@media (prefers-reduced-motion: reduce) {
  .repo-card:hover .repo-card__thumb,
  .featured-repo:hover .featured-repo__thumb {
    transform: none;
  }

  .featured-badge {
    animation: none;
  }
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.repo-fallback {
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}

.repo-fallback__initials {
  font-weight: 800;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
}

.featured-repo {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.featured-repo:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.featured-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

.featured-thumbnail {
  height: 100%;
  min-height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.featured-fallback {
  height: 100%;
  min-height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.featured-fallback::before {
  content: "";
  position: absolute;
  width: 200%;
  height: 200%;
  background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
  );
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.featured-fallback__initials {
  font-weight: 900;
  font-size: 4rem;
  color: white;
  letter-spacing: 0.1em;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.featured-topic {
  background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.2) 0%,
      rgba(118, 75, 162, 0.2) 100%
  );
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: var(--color-text-primary);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.featured-topic:hover {
  background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.3) 0%,
      rgba(118, 75, 162, 0.3) 100%
  );
  transform: translateY(-2px);
}

/* Same shape and palette as the site's other buttons (the home page's
   "View my work", the contact form's submit): theme tokens, a 0.375rem
   radius and the shared hover surface -- not the standalone purple gradient
   these used to carry. */
.featured-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color 0.3s ease, border-color 0.3s ease,
  transform 0.3s ease, box-shadow 0.3s ease;
}

.featured-button-primary {
  background: var(--color-button-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.featured-button-primary:hover {
  background: var(--color-background-light-2);
  border-color: var(--color-button-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.featured-button-secondary {
  background: transparent;
  border-color: var(--color-border-light);
}

.featured-button-secondary:hover {
  background: var(--color-background-light-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

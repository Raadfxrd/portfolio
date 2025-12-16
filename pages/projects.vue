<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from "vue";
import {marked} from "marked";

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  readme?: string;
  thumbnail?: string;
  readmeTitle?: string;
  readmeDescription?: string;
}

const repos = ref<Repository[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const config = useRuntimeConfig();
const loadingTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const skeletonCount = 6;
const minimumLoadingMs = 1000;

const fetchGitHubRepos = async () => {
  const start = Date.now();
  try {
    loading.value = true;
    error.value = null;
    if (loadingTimeout.value) {
      clearTimeout(loadingTimeout.value);
      loadingTimeout.value = null;
    }

    // Prepare headers with GitHub token
    const headers: HeadersInit = {};
    if (config.public.githubToken) {
      headers.Authorization = `token ${config.public.githubToken}`;
      headers.Accept = "application/vnd.github.v3+json";
    }

    const reposResponse = await fetch(
        "https://api.github.com/users/raadfxrd/repos?sort=updated&per_page=20",
        {headers},
    );

    if (!reposResponse.ok) {
      if (reposResponse.status === 403) {
        const rateLimitRemaining = reposResponse.headers.get(
            "X-RateLimit-Remaining",
        );
        const rateLimitReset = reposResponse.headers.get("X-RateLimit-Reset");

        if (rateLimitRemaining === "0") {
          const resetDate = rateLimitReset
              ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString()
              : "unknown";
          console.error(
              "GitHub API rate limit exceeded. Resets at:",
              resetDate,
          );
          throw new Error(
              `GitHub API rate limit exceeded. Please try again after ${resetDate}`,
          );
        }
      }
      throw new Error("Failed to fetch repositories");
    }

    const reposData = await reposResponse.json();

    const publicRepos = reposData.filter((repo: any) => !repo.fork);

    repos.value = await Promise.all(
        publicRepos.map(async (repo: any) => {
          try {
            // Prepare headers for README request
            const readmeHeaders: HeadersInit = {
              Accept: "application/vnd.github.v3.raw",
            };
            if (config.public.githubToken) {
              readmeHeaders.Authorization = `token ${config.public.githubToken}`;
            }

            const readmeResponse = await fetch(
                `https://api.github.com/repos/raadfxrd/${repo.name}/readme`,
                {headers: readmeHeaders},
            );

            let readme = "";
            let thumbnail = "";
            let readmeTitle = "";
            let readmeDescription = "";

            if (!readmeResponse.ok && readmeResponse.status === 403) {
              const rateLimitRemaining = readmeResponse.headers.get(
                  "X-RateLimit-Remaining",
              );
              if (rateLimitRemaining === "0") {
                const rateLimitReset =
                    readmeResponse.headers.get("X-RateLimit-Reset");
                const resetDate = rateLimitReset
                    ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString()
                    : "unknown";
                console.error(
                    `GitHub API rate limit exceeded while fetching README for ${repo.name}. Resets at:`,
                    resetDate,
                );
              }
            }

            if (readmeResponse.ok) {
              readme = await readmeResponse.text();

              const imageMatch = readme.match(/!\[.*?]\((.*?)\)/i);
              if (imageMatch && imageMatch[1]) {
                let imagePath = imageMatch[1];

                if (
                    imagePath.startsWith("http://") ||
                    imagePath.startsWith("https://")
                ) {
                  thumbnail = imagePath;
                } else {
                  imagePath = imagePath.replace(/^\.?\//, "");

                  const branch = repo.default_branch || "main";
                  thumbnail = `https://raw.githubusercontent.com/raadfxrd/${repo.name}/${branch}/${imagePath}`;

                  try {
                    const imgCheckResponse = await fetch(thumbnail, {
                      method: "HEAD",
                    });
                    if (!imgCheckResponse.ok) {
                      const alternateBranch =
                          branch === "main" ? "master" : "main";
                      const alternateUrl = `https://raw.githubusercontent.com/raadfxrd/${repo.name}/${alternateBranch}/${imagePath}`;
                      const altCheckResponse = await fetch(alternateUrl, {
                        method: "HEAD",
                      });
                      if (altCheckResponse.ok) {
                        thumbnail = alternateUrl;
                      } else {
                        thumbnail = "";
                      }
                    }
                  } catch (err) {
                    console.warn(`Could not verify image for ${repo.name}:`, err);
                    thumbnail = "";
                  }
                }
              }
              const titleMatch = readme.match(/^#+\s+(.+?)$/m);
              if (titleMatch && titleMatch[1]) {
                readmeTitle = titleMatch[1].trim();
              }
              const lines = readme.split("\n");
              let foundTitle = false;
              for (const line of lines) {
                if (line.match(/^#+\s+/)) {
                  foundTitle = true;
                  continue;
                }
                if (
                    foundTitle &&
                    line.trim() &&
                    !line.startsWith("!") &&
                    !line.startsWith("[") &&
                    !line.startsWith("#")
                ) {
                  readmeDescription = line.trim();
                  break;
                }
              }
            }

            return {
              id: repo.id,
              name: repo.name,
              description: repo.description || "No description available",
              html_url: repo.html_url,
              homepage: repo.homepage,
              topics: repo.topics || [],
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              language: repo.language,
              updated_at: repo.updated_at,
              readme,
              thumbnail,
              readmeTitle,
              readmeDescription,
            };
          } catch (err) {
            console.error(`Error fetching README for ${repo.name}:`, err);
            return {
              id: repo.id,
              name: repo.name,
              description: repo.description || "No description available",
              html_url: repo.html_url,
              homepage: repo.homepage,
              topics: repo.topics || [],
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              language: repo.language,
              updated_at: repo.updated_at,
              readme: "",
              thumbnail: "",
              readmeTitle: "",
              readmeDescription: "",
            };
          }
        }),
    );
  } catch (err) {
    console.error("Error fetching GitHub repos:", err);
    error.value = "Failed to load projects. Please try again later.";
  } finally {
    const elapsed = Date.now() - start;
    const remaining = Math.max(minimumLoadingMs - elapsed, 0);
    loadingTimeout.value = setTimeout(() => {
      loading.value = false;
    }, remaining);
  }
};

const decodeHtmlEntities = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

const parseReadmeText = (text: string) => {
  if (!text) return "";

  try {
    const html = marked.parse(text) as string;
    let plainText = html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    plainText = decodeHtmlEntities(plainText);

    return plainText;
  } catch (err) {
    console.error("Error parsing markdown:", err);
    return text;
  }
};

onMounted(() => {
  fetchGitHubRepos();
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
        <div
            v-for="n in skeletonCount"
            :key="`skeleton-${n}`"
            class="skeleton-card"
        >
          <div class="skeleton skeleton-thumb"/>
          <div class="skeleton skeleton-title"/>
          <div class="skeleton skeleton-line"/>
          <div class="skeleton skeleton-line short"/>
          <div class="skeleton-chip-row">
            <span class="skeleton skeleton-chip"/>
            <span class="skeleton skeleton-chip"/>
          </div>
          <div class="skeleton skeleton-meta"/>
        </div>
      </div>
      <div
          v-else-if="error"
          class="flex items-center justify-center py-12 md:py-20"
      >
        <div class="text-base text-red-500 md:text-lg">{{ error }}</div>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <FadeInSection
            v-for="(repo, index) in repos"
            :key="repo.id"
            :delay="index * 60"
            :distance="18"
            class="h-full"
        >
          <article
              class="bg-background-light border-border-light flex h-full flex-col rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div
                v-if="repo.thumbnail"
                class="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-800"
            >
              <img
                  :alt="`${repo.name} thumbnail`"
                  :src="repo.thumbnail"
                  class="h-full w-full object-cover"
                  @error="
                  (e) => ((e.target as HTMLImageElement).style.display = 'none')
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
                {{ parseReadmeText(repo.readmeTitle || repo.name) }}
              </h3>
              <p class="text-text-secondary mb-3 line-clamp-3 text-sm">
                {{
                  parseReadmeText(repo.readmeDescription || repo.description)
                }}
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
                    ⭐ {{ repo.stargazers_count }}
                  </span>
                  <span v-if="repo.updated_at" class="flex items-center gap-1">
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
</template>

<style scoped>
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

.skeleton-card {
  background: var(--color-background-light);
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(var(--color-text-primary-rgb), 0.06);
  border-radius: 0.5rem;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.35) 50%,
      transparent 100%
  );
  transform: translateX(-100%);
  animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-thumb {
  height: 140px;
  border-radius: 0.65rem;
}

.skeleton-title {
  height: 18px;
  width: 70%;
}

.skeleton-line {
  height: 12px;
  width: 100%;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-chip-row {
  display: flex;
  gap: 0.5rem;
}

.skeleton-chip {
  height: 20px;
  width: 64px;
  border-radius: 9999px;
}

.skeleton-meta {
  height: 12px;
  width: 55%;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>

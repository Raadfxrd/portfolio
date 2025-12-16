<template>
  <div class="px-4 py-8 sm:px-6 lg:px-8">
    <NotificationContainer/>

    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-text-primary w-fit pb-2 text-3xl font-bold md:text-4xl">
          Blog Posts
        </h1>
        <p class="text-text-secondary w-fit text-sm md:text-base">
          Manage your blog posts and content
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading">
        <!-- Create Button Skeleton -->
        <div class="mb-6 flex items-center justify-between">
          <div class="skeleton skeleton-text w-32"/>
          <div class="skeleton skeleton-button w-40"/>
        </div>

        <!-- Table Skeleton -->
        <div
            class="bg-background-light border-border-light overflow-hidden rounded-xl border shadow-lg"
        >
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-background-dark/50">
              <tr>
                <th class="px-6 py-4">
                  <div class="skeleton skeleton-text w-16"/>
                </th>
                <th class="px-6 py-4">
                  <div class="skeleton skeleton-text w-12"/>
                </th>
                <th class="px-6 py-4">
                  <div class="skeleton skeleton-text w-12"/>
                </th>
                <th class="px-6 py-4">
                  <div class="skeleton skeleton-text w-16"/>
                </th>
                <th class="px-6 py-4">
                  <div class="skeleton skeleton-text ml-auto w-20"/>
                </th>
              </tr>
              </thead>
              <tbody class="divide-border-light divide-y">
              <tr v-for="n in 5" :key="`skeleton-${n}`">
                <td class="px-6 py-4">
                  <div class="skeleton skeleton-text w-48"/>
                </td>
                <td class="px-6 py-4">
                  <div class="skeleton skeleton-text w-32"/>
                </td>
                <td class="px-6 py-4">
                  <div class="skeleton skeleton-text w-24"/>
                </td>
                <td class="px-6 py-4">
                  <div class="skeleton skeleton-badge w-20"/>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="skeleton skeleton-text ml-auto w-24"/>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Create Button -->
        <div class="mb-6 flex items-center justify-between">
          <p class="text-text-secondary text-sm">
            {{ posts.length }} {{ posts.length === 1 ? "post" : "posts" }} total
          </p>
          <button
              class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light group inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
              @click="showCreateModal = true"
          >
            <PlusIcon
                class="h-5 w-5 transition-transform duration-300 ease-out group-hover:rotate-90"
            />
            Create New Post
          </button>
        </div>

        <!-- Posts Table -->
        <div
            class="bg-background-light border-border-light overflow-hidden rounded-xl border shadow-lg"
        >
          <div class="overflow-x-auto">
            <table class="divide-border-light min-w-full divide-y">
              <thead class="bg-background-dark/50">
              <tr>
                <th
                    class="text-text-primary px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase"
                >
                  Title
                </th>
                <th
                    class="text-text-primary px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase"
                >
                  Slug
                </th>
                <th
                    class="text-text-primary px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase"
                >
                  Date
                </th>
                <th
                    class="text-text-primary px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase"
                >
                  Status
                </th>
                <th
                    class="text-text-primary px-6 py-4 text-right text-xs font-semibold tracking-wider uppercase"
                >
                  Actions
                </th>
              </tr>
              </thead>
              <tbody class="divide-border-light divide-y">
              <tr
                  v-for="post in posts"
                  :key="post.id"
                  class="hover:bg-background-light-2 transition-colors duration-150"
              >
                <td class="text-text-primary px-6 py-4 font-medium">
                  {{ post.title }}
                </td>
                <td class="text-text-secondary px-6 py-4 font-mono text-xs">
                  {{ post.slug }}
                </td>
                <td class="text-text-secondary px-6 py-4 whitespace-nowrap">
                  {{ formatDate(post.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span
                        :class="
                        post.published
                          ? 'border border-green-500/30 bg-green-900/30 text-green-400'
                          : 'border border-yellow-500/30 bg-yellow-900/30 text-yellow-400'
                      "
                        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      {{ post.published ? "Published" : "Draft" }}
                    </span>
                </td>
                <td
                    class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap"
                >
                  <button
                      class="mr-4 text-blue-400 transition-colors duration-150 hover:text-blue-300"
                      @click="editPost(post)"
                  >
                    Edit
                  </button>
                  <button
                      class="text-red-400 transition-colors duration-150 hover:text-red-300"
                      @click="deletePost(post.slug)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
      >
        <div
            v-if="showCreateModal || editingPost"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            @click.self="closeModal"
        >
          <div
              class="bg-background-light border-border-light max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border-2 shadow-2xl"
              style="will-change: transform"
          >
            <div
                class="bg-background-light border-border-light sticky top-0 border-b px-6 py-4"
            >
              <h2 class="text-text-primary text-2xl font-bold">
                {{ editingPost ? "Edit Post" : "Create New Post" }}
              </h2>
            </div>

            <form class="space-y-5 p-6" @submit.prevent="savePost">
              <div>
                <label
                    class="text-text-primary mb-2 block text-sm font-semibold"
                >Title</label
                >
                <input
                    v-model="formData.title"
                    class="bg-background-dark text-text-primary border-border-light focus:border-button-primary focus:ring-button-primary/20 w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:ring-2 focus:outline-none"
                    placeholder="Enter post title..."
                    required
                    type="text"
                />
              </div>

              <div>
                <label
                    class="text-text-primary mb-2 block text-sm font-semibold"
                >Slug</label
                >
                <input
                    v-model="formData.slug"
                    :disabled="!!editingPost"
                    class="bg-background-dark text-text-primary border-border-light focus:border-button-primary focus:ring-button-primary/20 w-full rounded-lg border-2 px-4 py-2.5 font-mono text-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="post-slug"
                    required
                    type="text"
                />
                <p class="text-text-secondary mt-1 text-xs">
                  Used in the URL. Only edit when creating a new post.
                </p>
              </div>

              <div>
                <label
                    class="text-text-primary mb-2 block text-sm font-semibold"
                >Description</label
                >
                <textarea
                    v-model="formData.description"
                    class="bg-background-dark text-text-primary border-border-light focus:border-button-primary focus:ring-button-primary/20 w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:ring-2 focus:outline-none"
                    placeholder="Brief description of the post..."
                    required
                    rows="3"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                      class="text-text-primary mb-2 block text-sm font-semibold"
                  >Author</label
                  >
                  <input
                      v-model="formData.author"
                      class="bg-background-dark text-text-primary border-border-light focus:border-button-primary focus:ring-button-primary/20 w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:ring-2 focus:outline-none"
                      placeholder="Author name"
                      required
                      type="text"
                  />
                </div>

                <div>
                  <label
                      class="text-text-primary mb-2 block text-sm font-semibold"
                  >Date</label
                  >
                  <input
                      v-model="formData.date"
                      class="bg-background-dark text-text-primary border-border-light focus:border-button-primary focus:ring-button-primary/20 w-full rounded-lg border-2 px-4 py-2.5 transition-colors focus:ring-2 focus:outline-none"
                      required
                      type="date"
                  />
                </div>
              </div>

              <div>
                <label
                    class="text-text-primary mb-2 block text-sm font-semibold"
                >Content (Markdown)</label
                >
                <div
                    v-if="editingPost && !modalReady"
                    class="bg-background-dark text-text-secondary border-border-light flex h-[400px] items-center justify-center rounded-lg border-2"
                >
                  <div class="flex items-center gap-2">
                    <div
                        class="border-text-secondary border-t-text-primary h-4 w-4 animate-spin rounded-full border-2"
                    ></div>
                    <span class="text-sm">Loading content...</span>
                  </div>
                </div>
                <textarea
                    v-else
                    v-model.lazy="formData.content"
                    class="bg-background-dark text-text-primary border-border-light focus:border-button-primary focus:ring-button-primary/20 w-full rounded-lg border-2 px-4 py-2.5 font-mono text-sm transition-colors focus:ring-2 focus:outline-none"
                    placeholder="# Your content here...&#10;&#10;Write your post in Markdown format."
                    required
                    rows="20"
                ></textarea>
              </div>

              <div
                  class="bg-background-dark/50 flex items-center gap-3 rounded-lg p-4"
              >
                <input
                    id="published"
                    v-model="formData.published"
                    class="border-border-light bg-background-dark text-button-primary focus:ring-button-primary/20 focus:ring-offset-background-light h-5 w-5 rounded transition-colors focus:ring-2 focus:ring-offset-2"
                    type="checkbox"
                />
                <label
                    class="text-text-primary flex-1 text-sm font-medium"
                    for="published"
                >
                  Publish this post immediately
                </label>
              </div>

              <div
                  class="border-border-light flex justify-end gap-3 border-t pt-5"
              >
                <button
                    class="border-border-light bg-background-dark text-text-secondary hover:border-text-secondary hover:text-text-primary rounded-lg border-2 px-6 py-2.5 text-sm font-semibold transition-all duration-200"
                    type="button"
                    @click="closeModal"
                >
                  Cancel
                </button>
                <button
                    class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light rounded-lg border-2 px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
                    type="submit"
                >
                  {{ editingPost ? "Update Post" : "Create Post" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NotificationContainer from "~/components/NotificationContainer.vue";
import {useNotification} from "~/composables/useNotification";
import {PlusIcon} from "@heroicons/vue/24/outline";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const {success, error, warning} = useNotification();

const posts = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const editingPost = ref<any>(null);
const modalReady = ref(false);
const formData = ref({
  title: "",
  slug: "",
  description: "",
  content: "",
  author: "Borys",
  date: new Date().toISOString().split("T")[0],
  published: false,
});

onMounted(async () => {
  await loadPosts();
});

const loadPosts = async () => {
  loading.value = true;
  try {
    posts.value = await $fetch("/api/cms/posts");
  } catch (e) {
    console.error("Failed to load posts:", e);
    error("Failed to load posts. Please try again.");
  } finally {
    loading.value = false;
  }
};

const editPost = (post: any) => {
  editingPost.value = post;
  modalReady.value = false;

  // Set form data immediately but without content
  formData.value = {
    title: post.title,
    slug: post.slug,
    description: post.description,
    content: "", // Empty initially
    author: post.author,
    date: post.date,
    published: post.published,
  };

  // Defer loading the heavy content until after modal renders
  nextTick(() => {
    setTimeout(() => {
      formData.value.content = post.content;
      modalReady.value = true;
    }, 100);
  });
};

const closeModal = () => {
  showCreateModal.value = false;
  editingPost.value = null;
  modalReady.value = false;
  formData.value = {
    title: "",
    slug: "",
    description: "",
    content: "",
    author: "Borys",
    date: new Date().toISOString().split("T")[0],
    published: false,
  };
};

const savePost = async () => {
  try {
    const wasPublished = editingPost.value?.published || false;
    const isNowPublished = formData.value.published;
    const isNewPost = !editingPost.value;

    if (editingPost.value) {
      await $fetch(`/api/cms/posts/${editingPost.value.slug}`, {
        method: "PUT",
        body: formData.value,
      });
      success(`Post "${formData.value.title}" updated successfully!`);
    } else {
      await $fetch("/api/cms/posts", {
        method: "POST",
        body: formData.value,
      });
      success(`Post "${formData.value.title}" created successfully!`);
    }

    // Notify subscribers if post is being published (new or newly published)
    if (isNowPublished && (!wasPublished || isNewPost)) {
      try {
        const response = await $fetch("/api/newsletter/notify", {
          method: "POST",
          body: {
            postSlug: formData.value.slug,
            postTitle: formData.value.title,
            postDescription: formData.value.description,
          },
        });

        if (response.sent > 0) {
          success(`Notified ${response.sent} subscribers about the new post!`);
        } else if (response.total === 0) {
          console.log("No subscribers to notify");
        } else {
          warning(
              `Post published but ${response.failed} email(s) failed to send`,
          );
        }
      } catch (notifyError: any) {
        console.error("Failed to notify subscribers:", notifyError);
        const errorMessage =
            notifyError.data?.message || "Failed to notify subscribers";
        warning(`Post saved but ${errorMessage}`);
      }
    }

    await loadPosts();
    closeModal();
  } catch (e: any) {
    error(e.data?.message || "Failed to save post. Please try again.");
  }
};

const deletePost = async (slug: string) => {
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    await $fetch(`/api/cms/posts/${slug}`, {
      method: "DELETE",
    });
    success("Post deleted successfully!");
    await loadPosts();
  } catch (e) {
    error("Failed to delete post. Please try again.");
  }
};

const formatDate = (date: string) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};
</script>

<style scoped>
.skeleton {
  position: relative;
  overflow: hidden;
  background: rgba(var(--color-text-primary-rgb, 255, 255, 255), 0.06);
  border-radius: 0.5rem;
  height: 1rem;
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

.skeleton-text {
  height: 1rem;
}

.skeleton-button {
  height: 2.5rem;
  border-radius: 0.75rem;
}

.skeleton-badge {
  height: 1.75rem;
  border-radius: 9999px;
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

<template>
  <div
      class="flex h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2
            class="text-text-primary mt-6 text-center text-3xl font-bold tracking-tight"
        >
          CMS Login
        </h2>
        <p class="text-text-secondary mt-2 text-center text-sm">
          Sign in to manage your blog posts
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="error" class="rounded-md bg-red-900/20 p-4">
          <p class="text-center text-sm text-red-400">{{ error }}</p>
        </div>
        <div class="-space-y-px rounded-md shadow-sm">
          <div>
            <label class="sr-only" for="username">Username</label>
            <input
                id="username"
                v-model="username"
                autocomplete="username"
                class="bg-background-light text-text-primary placeholder-text-secondary border-border-dark relative block w-full appearance-none rounded-none rounded-t-md border px-3 py-2 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                name="username"
                placeholder="Username"
                required
                type="text"
            />
          </div>
          <div>
            <label class="sr-only" for="password">Password</label>
            <input
                id="password"
                v-model="password"
                autocomplete="current-password"
                class="bg-background-light text-text-primary placeholder-text-secondary border-border-dark relative block w-full appearance-none rounded-none rounded-b-md border px-3 py-2 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
                name="password"
                placeholder="Password"
                required
                type="password"
            />
          </div>
        </div>

        <div class="flex items-center justify-center">
          <button
              :disabled="loading"
              class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light inline-block rounded-xl border-2 px-2 py-1 text-lg font-semibold transition-all duration-300 hover:shadow-lg"
              type="submit"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "admin",
});

const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        username: username.value,
        password: password.value,
      },
    });

    if (response.success) {
      // Redirect to CMS dashboard
      await navigateTo("/cms");
    }
  } catch (e: any) {
    error.value = e.data?.message || "Invalid credentials";
  } finally {
    loading.value = false;
  }
};
</script>

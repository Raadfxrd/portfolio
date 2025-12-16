<template>
  <nav
      class="border-border-light bg-background-dark/80 sticky top-0 z-50 border-b backdrop-blur-lg"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo / Brand -->
        <div class="flex items-center gap-3">
          <NuxtLink class="group flex items-center gap-2" to="/cms">
            <span class="text-text-primary text-lg font-bold"
            >CMS Dashboard</span
            >
          </NuxtLink>
        </div>

        <!-- Nav Links -->
        <div class="hidden items-center gap-1 md:flex">
          <NuxtLink
              class="text-text-secondary hover:text-text-primary hover:bg-background-light rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
              to="/"
          >
            <div class="flex items-center gap-2">
              <EyeIcon class="h-4 w-4"/>
              View Site
            </div>
          </NuxtLink>
        </div>

        <!-- Right Side: Theme Toggle & Logout -->
        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <button
              aria-label="Toggle theme"
              class="text-text-secondary hover:text-text-primary hover:bg-background-light rounded-lg p-2 transition-all duration-200"
              @click="toggleTheme"
          >
            <SunIcon v-if="colorMode.value === 'dark'" class="h-5 w-5"/>
            <MoonIcon v-else class="h-5 w-5"/>
          </button>

          <!-- Logout Button -->
          <button
              v-if="isAuthenticated"
              class="text-text-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-red-900/10 hover:text-red-400"
              @click="handleLogout"
          >
            <ArrowRightStartOnRectangleIcon class="h-5 w-5"/>
            <span class="hidden sm:inline">Logout</span>
          </button>

          <!-- Mobile Menu Button -->
          <button
              aria-label="Toggle menu"
              class="text-text-secondary hover:text-text-primary hover:bg-background-light rounded-lg p-2 transition-all duration-200 md:hidden"
              @click="showMobileMenu = !showMobileMenu"
          >
            <Bars3Icon v-if="!showMobileMenu" class="h-6 w-6"/>
            <XMarkIcon v-else class="h-6 w-6"/>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
      >
        <div
            v-if="showMobileMenu"
            class="border-border-light border-t py-4 md:hidden"
        >
          <div class="flex flex-col gap-2">
            <NuxtLink
                class="text-text-secondary hover:text-text-primary hover:bg-background-light flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
                to="/"
                @click="showMobileMenu = false"
            >
              <EyeIcon class="h-4 w-4"/>
              View Site
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  EyeIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const colorMode = useColorMode();
const showMobileMenu = ref(false);
const isAuthenticated = ref(false);
const route = useRoute();

// Check authentication status
const checkAuth = async () => {
  try {
    const response = await $fetch("/api/auth/me");
    isAuthenticated.value = response.authenticated || false;
  } catch (e) {
    isAuthenticated.value = false;
  }
};

// Check on mount
onMounted(() => {
  checkAuth();
});

// Watch for route changes to update auth state
watch(
    () => route.path,
    () => {
      checkAuth();
    },
);

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const handleLogout = async () => {
  try {
    await $fetch("/api/auth/logout", {
      method: "POST",
    });
    isAuthenticated.value = false;
    await navigateTo("/admin/login");
  } catch (e) {
    console.error("Logout failed:", e);
  }
};
</script>

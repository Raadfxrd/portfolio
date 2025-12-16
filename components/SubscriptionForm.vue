<template>
  <div
      class="bg-background-light border-border-light rounded-l border p-3 md:p-4"
  >
    <h2 class="gradient mb-2 w-fit text-xs font-bold md:mb-3 md:text-sm">
      Stay up to date
    </h2>
    <p
        class="text-text-secondary mb-3 w-fit text-justify text-xs leading-relaxed md:mb-4"
    >
      Get notified when I post something, unsubscribe at any moment.
    </p>

    <div class="relative">
      <AnimatePresence mode="wait">
        <Motion
            v-if="subscribed"
            key="success"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.95 }"
            :initial="{ opacity: 0, y: 10, scale: 0.95 }"
            :transition="{ duration: 0.3 }"
            class="flex items-center rounded-md bg-green-900/20 px-3 py-3 pb-3.5"
        >
          <p class="text-xs text-green-400">{{ message }}</p>
        </Motion>

        <Motion
            v-else
            key="form"
            :animate="{ opacity: 1, y: 0, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.95 }"
            :initial="{ opacity: 0, y: -10, scale: 0.95 }"
            :transition="{ duration: 0.3 }"
            class="rounded-md bg-transparent"
        >
          <form class="space-y-2" @submit.prevent="handleSubmit">
            <AnimatePresence>
              <Motion
                  v-if="error"
                  :animate="{ opacity: 1, y: 0, scale: 1 }"
                  :exit="{ opacity: 0, scale: 0.95 }"
                  :initial="{ opacity: 0, y: -5, scale: 0.95 }"
                  :transition="{ duration: 0.2 }"
                  class="flex items-center rounded-md bg-red-900/20 px-3 py-3 pb-3.5"
              >
                <p class="text-xs text-red-400">{{ error }}</p>
              </Motion>
            </AnimatePresence>
            <div class="flex flex-row gap-2">
              <input
                  id="email"
                  v-model="email"
                  :disabled="loading"
                  class="bg-background-light border-border-light focus:ring-button-primary flex-1 rounded-md border px-3 py-3 text-xs focus:ring-1 disabled:opacity-50"
                  placeholder="Enter your email"
                  required
                  type="email"
              />
              <button
                  :disabled="loading"
                  class="bg-button-primary text-text-secondary hover:bg-background-light-2 rounded-md px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-50"
                  type="submit"
              >
                {{ loading ? "Subscribing..." : "Subscribe" }}
              </button>
            </div>
          </form>
        </Motion>
      </AnimatePresence>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {AnimatePresence, Motion} from "motion-v";

const {subscribed, loading, error, message, subscribe} = useNewsletter();
const {executeRecaptcha} = useRecaptcha();
const email = ref("");

const handleSubmit = async () => {
  // Try to get reCAPTCHA v3 token
  let recaptchaToken = "";

  try {
    recaptchaToken = await executeRecaptcha("subscribe_newsletter");
  } catch (recaptchaError) {
    // Log the error but don't block submission in development
    console.warn("reCAPTCHA verification skipped:", recaptchaError);
    // The backend will handle missing tokens appropriately based on environment
  }

  const success = await subscribe(email.value, recaptchaToken);
  if (success) {
    email.value = "";
  }
};
</script>

<template>
  <section
      class="bg-background-light text-text-primary font-default flex min-h-screen items-center justify-center px-4 py-20"
  >
    <div class="mx-auto max-w-md text-center">
      <div v-if="loading" class="space-y-4">
        <div
            class="border-text-secondary border-t-text-primary mx-auto h-12 w-12 animate-spin rounded-full border-4"
        ></div>
        <p class="text-text-secondary text-lg">Checking your subscription...</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="mb-4 text-5xl text-red-400">❌</div>
        <h1 class="text-text-primary mb-4 text-2xl font-bold md:text-3xl">
          Oops!
        </h1>
        <p class="text-text-secondary mb-6 text-base md:text-lg">
          {{ error }}
        </p>
        <NuxtLink
            class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light inline-block rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
            to="/"
        >
          Go to Homepage
        </NuxtLink>
      </div>

      <!-- Confirmation step: nothing has changed yet at this point. -->
      <div v-else-if="!confirmed" class="space-y-4">
        <div class="mb-4 text-5xl">✉️</div>
        <h1 class="text-text-primary mb-4 text-2xl font-bold md:text-3xl">
          Unsubscribe?
        </h1>
        <p class="text-text-secondary mb-2 text-base md:text-lg">
          You're about to unsubscribe
          <span class="text-text-primary font-semibold">{{ email }}</span>
          from the newsletter.
        </p>
        <p class="text-text-secondary mb-6 text-sm">
          You won't receive any more emails from me. You can subscribe again at
          any time.
        </p>
        <div class="flex flex-col justify-center gap-3 sm:flex-row">
          <button
              :disabled="submitting"
              class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light inline-block rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              @click="confirmUnsubscribe"
          >
            {{ submitting ? "Unsubscribing..." : "Yes, unsubscribe me" }}
          </button>
          <NuxtLink
              class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light inline-block rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
              to="/"
          >
            Keep my subscription
          </NuxtLink>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="mb-4 text-5xl">{{ alreadyUnsubscribed ? "✅" : "👋" }}</div>
        <h1 class="text-text-primary mb-4 text-2xl font-bold md:text-3xl">
          {{
            alreadyUnsubscribed
                ? "Already Unsubscribed"
                : "You've been unsubscribed"
          }}
        </h1>
        <p class="text-text-secondary mb-2 text-base md:text-lg">
          {{
            alreadyUnsubscribed
                ? "You're already unsubscribed from the newsletter."
                : "You won't receive any more emails from me."
          }}
        </p>
        <p v-if="!alreadyUnsubscribed" class="text-text-secondary mb-4 text-sm">
          Sorry to see you go! If you change your mind, you can always subscribe
          again.
        </p>
        <p
            class="text-text-secondary border-border-light mb-6 border-t pt-4 text-xs"
        >
          If you're still receiving emails or need assistance, please
          <NuxtLink
              class="text-text-primary font-semibold hover:underline"
              to="/contact"
          >
            contact me through my email form
          </NuxtLink
          >
          .
        </p>
        <div class="flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink
              class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light inline-block rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
              to="/"
          >
            Go to Homepage
          </NuxtLink>
          <NuxtLink
              class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light inline-block rounded-xl border-2 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
              to="/contact"
          >
            Contact Me
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
const route = useRoute();

const loading = ref(true);
const submitting = ref(false);
const error = ref("");
const email = ref("");
const confirmed = ref(false);
const alreadyUnsubscribed = ref(false);

useSeoMeta({
  title: "Unsubscribe - borysbabas.dev",
  description: "Unsubscribe from the newsletter",
});

const token = computed(() => route.query.token as string | undefined);

/**
 * On load we only *look up* the subscription. Loading this page no longer
 * changes anything, so a link prefetcher or scanner opening the URL cannot
 * unsubscribe someone on their behalf.
 */
onMounted(async () => {
  if (!token.value) {
    error.value = "No unsubscribe token provided";
    loading.value = false;
    return;
  }

  try {
    const response = await $fetch("/api/newsletter/unsubscribe", {
      query: { token: token.value },
    });

    email.value = response.email;

    // Nothing left to confirm if they are already off the list.
    if (response.alreadyUnsubscribed) {
      alreadyUnsubscribed.value = true;
      confirmed.value = true;
    }
  } catch (e: any) {
    error.value =
        e.data?.message || "Failed to load your subscription. Please try again.";
  } finally {
    loading.value = false;
  }
});

const confirmUnsubscribe = async () => {
  if (!token.value || submitting.value) return;

  submitting.value = true;
  error.value = "";

  try {
    const response = await $fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      body: { token: token.value },
    });

    alreadyUnsubscribed.value = response.alreadyUnsubscribed;
    confirmed.value = true;
  } catch (e: any) {
    error.value = e.data?.message || "Failed to unsubscribe. Please try again.";
  } finally {
    submitting.value = false;
  }
};
</script>

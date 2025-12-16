<template>
  <div class="relative w-full overflow-hidden">
    <section
        class="flex min-h-screen w-full flex-col items-center justify-center px-4 pt-20 pb-12 md:pt-30 md:pb-20"
    >
      <div class="mx-auto w-full max-w-2xl">
        <!-- Header Section -->
        <div
            class="relative mb-8 flex flex-col items-center text-center md:mb-12"
        >
          <h1
              class="gradient relative z-10 mb-3 w-fit text-3xl font-bold md:mb-4 md:text-4xl lg:text-5xl"
          >
            Get in Touch
          </h1>
          <p
              class="text-text-secondary relative z-10 mx-auto max-w-xl text-sm md:text-base lg:text-lg"
          >
            Have a project in mind, want to collaborate, or just want to chat?
            Maybe some feedback? Drop me a message!
          </p>
        </div>

        <!-- Contact Form -->
        <div
            class="bg-background-light border-border-light rounded-lg border p-6 shadow-sm transition-all duration-300 hover:shadow-md md:p-8"
        >
          <!-- Success Message -->
          <Motion
              v-if="formState.submitted && !formState.error"
              :animate="{ opacity: 1, y: 0, scale: 1 }"
              :exit="{ opacity: 0, y: 10, scale: 0.98 }"
              :initial="{ opacity: 0, y: 10, scale: 0.98 }"
              class="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4"
          >
            <p class="text-sm text-green-600 md:text-base dark:text-green-400">
              ✓ Message sent successfully! I'll get back to you soon.
            </p>
          </Motion>

          <!-- Error Message -->
          <Motion
              v-if="formState.error"
              :animate="{ opacity: 1, y: 0, scale: 1 }"
              :exit="{ opacity: 0, y: 10, scale: 0.98 }"
              :initial="{ opacity: 0, y: 10, scale: 0.98 }"
              class="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4"
          >
            <p class="text-sm text-red-600 md:text-base dark:text-red-400">
              {{ formState.errorMessage }}
            </p>
          </Motion>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <div class="group">
              <label
                  class="text-text-secondary group-focus-within:text-text-primary mb-2 block text-sm font-medium transition-colors md:text-base"
                  for="name"
              >
                Name
              </label>
              <input
                  id="name"
                  v-model="formData.name"
                  :disabled="formState.submitting"
                  class="bg-background-light-2 text-text-primary focus:border-button-primary focus:ring-button-primary/20 mt-1 w-full rounded-lg border border-transparent p-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none md:text-base"
                  name="name"
                  placeholder="Your name"
                  required
                  type="text"
              />
            </div>

            <div class="group">
              <label
                  class="text-text-secondary group-focus-within:text-text-primary mb-2 block text-sm font-medium transition-colors md:text-base"
                  for="email"
              >
                Email
              </label>
              <input
                  id="email"
                  v-model="formData.email"
                  :disabled="formState.submitting"
                  class="bg-background-light-2 text-text-primary focus:border-button-primary focus:ring-button-primary/20 mt-1 w-full rounded-lg border border-transparent p-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none md:text-base"
                  name="email"
                  placeholder="your.email@example.com"
                  required
                  type="email"
              />
            </div>

            <div class="group">
              <label
                  class="text-text-secondary group-focus-within:text-text-primary mb-2 block text-sm font-medium transition-colors md:text-base"
                  for="message"
              >
                Message
              </label>
              <textarea
                  id="message"
                  v-model="formData.message"
                  :disabled="formState.submitting"
                  class="bg-background-light-2 text-text-primary focus:border-button-primary focus:ring-button-primary/20 mt-1 w-full resize-none rounded-lg border border-transparent p-3 text-sm transition-all duration-200 focus:ring-2 focus:outline-none md:text-base"
                  name="message"
                  placeholder="Tell me about your project or just say hi..."
                  required
                  rows="5"
              ></textarea>
            </div>

            <button
                :disabled="formState.submitting"
                class="bg-button-primary text-text-primary hover:bg-background-light-2 hover:border-button-primary group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-transparent py-3 text-sm font-semibold shadow-sm transition-all duration-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:py-4 md:text-base"
                type="submit"
            >
              <span v-if="!formState.submitting">Send Message</span>
              <span v-else>Sending...</span>
              <ArrowRightIcon
                  v-if="!formState.submitting"
                  class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </button>

            <!-- reCAPTCHA Badge Notice -->
            <p class="text-text-secondary mt-4 text-center text-xs">
              This site is protected by reCAPTCHA and the Google
              <a
                  class="social-link underline"
                  href="https://policies.google.com/privacy"
                  target="_blank"
              >Privacy Policy</a
              >
              and
              <a
                  class="social-link underline"
                  href="https://policies.google.com/terms"
                  target="_blank"
              >Terms of Service</a
              >
              apply.
            </p>
          </form>
        </div>

        <!-- Social Links -->
        <div class="mt-10 flex flex-col items-center text-center md:mt-12">
          <h2
              class="gradient mb-6 w-fit text-center text-xl font-bold md:mb-8 md:text-2xl"
          >
            Connect with me
          </h2>

          <div class="flex justify-center gap-6 md:gap-8">
            <!-- GitHub -->
            <a
                class="bg-background-light border-border-light hover:border-button-primary group flex min-w-[110px] flex-col items-center gap-3 rounded-lg border p-5 shadow-sm transition-all duration-200 hover:shadow-md md:min-w-[120px] md:p-6"
                href="https://github.com/raadfxrd"
                rel="noopener noreferrer"
                target="_blank"
            >
              <i
                  class="devicon-github-original text-text-secondary group-hover:text-text-primary text-4xl transition-colors md:text-5xl"
              ></i>
              <span
                  class="text-text-secondary group-hover:text-text-primary text-xs font-medium transition-colors md:text-sm"
              >GitHub</span
              >
            </a>

            <!-- LinkedIn -->
            <a
                class="bg-background-light border-border-light hover:border-button-primary group flex min-w-[110px] flex-col items-center gap-3 rounded-lg border p-5 shadow-sm transition-all duration-200 hover:shadow-md md:min-w-[120px] md:p-6"
                href="https://www.linkedin.com/in/borys-babas/"
                rel="noopener noreferrer"
                target="_blank"
            >
              <i
                  class="devicon-linkedin-plain text-text-secondary group-hover:text-text-primary text-4xl transition-colors md:text-5xl"
              ></i>
              <span
                  class="text-text-secondary group-hover:text-text-primary text-xs font-medium transition-colors md:text-sm"
              >LinkedIn</span
              >
            </a>

            <!-- Instagram -->
            <a
                class="bg-background-light border-border-light hover:border-button-primary group flex min-w-[110px] flex-col items-center gap-3 rounded-lg border p-5 shadow-sm transition-all duration-200 hover:shadow-md md:min-w-[120px] md:p-6"
                href="https://www.instagram.com/borysbabas/"
                rel="noopener noreferrer"
                target="_blank"
            >
              <svg
                  class="text-text-secondary group-hover:text-text-primary h-10 w-10 transition-colors md:h-12 md:w-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
              >
                <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
              <span
                  class="text-text-secondary group-hover:text-text-primary text-xs font-medium transition-colors md:text-sm"
              >Instagram</span
              >
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {Motion} from "motion-v";
import {ArrowRightIcon} from "@heroicons/vue/24/outline";

const formData = reactive({
  name: "",
  email: "",
  message: "",
});

const formState = reactive({
  submitting: false,
  submitted: false,
  error: false,
  errorMessage: "",
});

// Use the existing reCAPTCHA composable
const {executeRecaptcha} = useRecaptcha();

// Handle form submission
const handleSubmit = async () => {
  try {
    formState.submitting = true;
    formState.error = false;
    formState.errorMessage = "";

    // Try to get reCAPTCHA v3 token
    let recaptchaToken = "";

    try {
      recaptchaToken = await executeRecaptcha("submit_contact");
    } catch (recaptchaError) {
      // Log the error but don't block submission in development
      console.warn("reCAPTCHA verification skipped:", recaptchaError);
      // The backend will handle missing tokens appropriately based on environment
    }

    // Send form data to backend API
    await $fetch("/api/contact", {
      method: "POST",
      body: {
        ...formData,
        recaptchaToken,
      },
    });

    // Success
    formState.submitted = true;
    formData.name = "";
    formData.email = "";
    formData.message = "";

    // Reset success message after 5 seconds
    setTimeout(() => {
      formState.submitted = false;
    }, 5000);
  } catch (error: any) {
    console.error("Form submission error:", error);
    formState.error = true;
    formState.errorMessage =
        error.data?.message ||
        "Failed to send message. Please try again or contact me directly via email.";
  } finally {
    formState.submitting = false;
  }
};
</script>

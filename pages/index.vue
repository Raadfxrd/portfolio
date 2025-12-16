<template>
  <div class="relative w-full">
    <section
      class="flex min-h-screen w-full flex-col items-center justify-center"
    >
      <!-- Intro Overlay -->
      <div
        v-if="showIntro"
        class="bg-background-light animate-introFadeOut fixed inset-0 z-50 flex items-center justify-center"
      >
        <h1
          id="intro-title"
          class="text-text-primary animate-scaleIn text-lg font-bold md:text-2xl"
        >
          Borys Babas
        </h1>
      </div>

      <!-- Hero Section -->
      <FadeInSection
        v-if="showContent"
        :distance="36"
        :duration="1100"
        class="flex h-screen w-full flex-col items-center justify-center px-4"
      >
        <div
          class="flex w-full max-w-5xl flex-col items-center justify-center gap-8 px-4 md:flex-row md:gap-12 md:px-6"
        >
          <!-- Portrait -->
          <ExplodingImage
            :main-image="'/img/raadfxrd.jpeg'"
            :satellite-images="[
              '/img/satelite/borys.jpeg',
              '/img/satelite/lemur.jpeg',
              '/img/satelite/kitteh.jpeg',
              '/img/satelite/desk-setup.jpeg',
              '/img/satelite/living-room.jpeg',
            ]"
            alt="Portrait of Borys"
          />
          <!-- Text Section -->
          <div class="max-w-lg text-center md:text-left">
            <h1
              class="gradient mb-2 flex flex-wrap justify-center gap-2 text-xl font-bold sm:text-2xl md:justify-start md:text-3xl"
            >
              <span
                v-for="(word, wi) in greeting.split(' ')"
                :key="wi"
                class="inline-flex"
              >
                <span
                  v-for="(letter, li) in word.split('')"
                  :key="li"
                  :style="{ animationDelay: `${wi * 600 + li * 50}ms` }"
                  class="animate-letterReveal inline-block opacity-0"
                >
                  {{ letter }}
                </span>
                <span class="w-1.5"></span>
              </span>
            </h1>

            <h1
              class="gradient animate-textReveal mb-3 text-xl font-bold delay-150 sm:text-2xl md:text-3xl"
            >
              I'm Borys!
            </h1>

            <h3
              :class="{
                'animate-fadeOut': isFadingOut,
                'animate-fadeIn': !isFadingOut,
              }"
              class="text-text-secondary mx-auto mb-2 w-fit text-sm transition-transform duration-500 md:mx-0 md:text-sm"
            >
              {{ currentTitle }}
            </h3>

            <h3
              class="text-text-primary animate-textReveal mx-auto mb-4 w-fit text-sm md:mx-0 md:text-lg"
            >
              Innovating for success.
            </h3>

            <!-- Button -->
            <NuxtLink
              class="bg-button-primary text-text-primary hover:bg-background-light-2 group relative mx-auto flex w-fit items-center justify-center gap-4 overflow-hidden rounded-md px-4 py-2 text-xs font-medium shadow-sm transition-all duration-300 md:mx-0 md:text-sm"
              to="/projects"
            >
              <span>View my work</span>
              <ArrowRightIcon
                class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </NuxtLink>
          </div>
        </div>
        <TechStack v-if="showContent" />
      </FadeInSection>

      <!-- Content Section -->
      <FadeInSection
        v-if="showContent"
        :delay="200"
        :distance="32"
        class="container mx-auto mt-8 mb-8 max-w-5xl px-4 md:mt-12 md:mb-12 md:px-6"
      >
        <div
          class="relative flex flex-col items-start gap-6 md:gap-8 lg:flex-row"
        >
          <!-- Recent Posts Section -->
          <section class="w-full lg:w-3/5">
            <h1
              class="gradient bl-4 mb-4 ml-4 w-fit text-xl font-semibold md:text-2xl"
            >
              Recent Posts
            </h1>
            <div class="space-y-4">
              <FadeInSection
                v-for="(post, key) in posts?.slice(0, 6)"
                :key="post.path"
                :delay="key * 80"
                :distance="18"
              >
                <PostCard :is-big="!key" :post="post" />
              </FadeInSection>
            </div>
          </section>

          <!-- Sidebar Section -->
          <aside class="w-full lg:sticky lg:top-25 lg:max-h-screen lg:w-2/5">
            <div class="space-y-4">
              <FadeInSection :delay="120" :distance="18">
                <SubscriptionForm />
              </FadeInSection>
              <FadeInSection :delay="220" :distance="18">
                <WorkExperience :experiences="experiences" />
              </FadeInSection>
              <FadeInSection :delay="300" :distance="18">
                <EducationTrajectory :educations="educations" />
              </FadeInSection>
            </div>
          </aside>
        </div>
      </FadeInSection>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRightIcon } from "@heroicons/vue/24/outline";
import TechStack from "~/components/TechStack.vue";
import PostCard from "~/components/PostCard.vue";
import SubscriptionForm from "~/components/SubscriptionForm.vue";
import WorkExperience from "~/components/WorkExperience.vue";
import EducationTrajectory from "~/components/EducationTrajectory.vue";
import FadeInSection from "~/components/FadeInSection.vue";
import { useIntroSequence } from "~/composables/useIntroSequence";
import { useRotatingTitles } from "~/composables/useRotatingTitles";
import { useGreeting } from "~/composables/useGreeting";

const { greeting } = useGreeting();
const { currentTitle, isFadingOut } = useRotatingTitles();
const { showIntro, showContent } = useIntroSequence();

const { data: posts } = await useAsyncData(async () => {
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

const experiences = [
  {
    title: "Software Engineer",
    company: "IRP/WOSI",
    period: "February 2025 - Now",
    icon: "/img/companies/irp.png",
    description:
      "Working with my team on developing an innovative web platform that displays 3D models of houses on the market. The application allows users to explore properties in incredible detail and even visualize their own furniture in the space.",
    responsibilities: [
      "Collaborating with the development team on the 3D house visualization platform",
      "Implementing features for detailed 3D model viewing and interaction",
      "Developing furniture placement functionality for virtual staging",
      "Building responsive and performant web applications using modern frameworks",
      "Contributing to technical discussions and code reviews",
    ],
  },
  {
    title: "Sales Assistant",
    company: "Hifi Klubben",
    period: "March 2024 - Now",
    icon: "/img/companies/hfk.svg",
    description:
      "Sales advisor for audio equipment across all budget ranges, from entry-level systems to high-end audiophile setups. Focused on understanding client needs and delivering complete solutions for the best possible audio experience.",
    responsibilities: [
      "Advising customers on audio equipment across all price ranges",
      "Communicating extensively with clients to understand their needs and preferences",
      "Providing full solutions to audio-related problems and challenges",
      "Demonstrating products and explaining technical specifications clearly",
      "Building long-term relationships with audiophile community and clients",
    ],
  },
  {
    title: "AGF-assistant",
    company: "Albert Heijn",
    period: "September 2023 - March 2024",
    icon: "/img/companies/ah.png",
    description:
      "Worked in the fresh produce department ensuring quality and customer satisfaction.",
    responsibilities: [
      "Managing fresh produce inventory and displays",
      "Ensuring product quality and freshness standards",
      "Assisting customers with product selection",
      "Maintaining cleanliness and organization of department",
      "Supporting team operations during peak hours",
    ],
  },
  {
    title: "Sales Assistant",
    company: "Pull&Bear",
    period: "April 2023 - August 2023",
    icon: "/img/companies/pb.png",
    description:
      "Provided customer service and sales support in a fast-paced retail environment.",
    responsibilities: [
      "Assisting customers with fashion choices and sizing",
      "Processing transactions and handling cash operations",
      "Maintaining store presentation and visual merchandising",
      "Managing fitting rooms and inventory restocking",
      "Contributing to sales targets and customer satisfaction",
      "Keycarrier responsibilities including opening/closing the store and cash handling",
    ],
  },
];

const educations = [
  {
    degree: "Software Engineering",
    school: "Amsterdam University of Applied Sciences",
    period: "2022 - 2026",
    icon: "/img/schools/hva.png",
    description:
      "Pursuing a Bachelor's degree in Software Engineering, focusing on modern web technologies, software architecture, and user-centered design.",
    focusAreas: [
      "Full-stack web development with modern frameworks",
      "Software architecture and design patterns",
      "Database design and management",
      "Agile development methodologies",
      "User experience and interface design",
      "DevOps and continuous integration/deployment",
    ],
  },
  {
    degree: "Dark Tech",
    school: "Amsterdam University of Applied Sciences",
    period: "2024 - 2025",
    icon: "/img/schools/hva.png",
    description:
      "Specialized minor program exploring the intersection of technology, ethics, and societal impact of emerging technologies.",
    focusAreas: [
      "Ethical implications of emerging technologies",
      "Privacy and data security considerations",
      "AI and machine learning ethics",
      "Critical thinking about technology's role in society",
      "Responsible innovation and design",
      "Digital rights and surveillance",
    ],
  },
];
</script>

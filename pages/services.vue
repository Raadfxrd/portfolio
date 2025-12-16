<script lang="ts" setup>
import {CommandLineIcon, ComputerDesktopIcon,} from "@heroicons/vue/24/outline";
import {computed, ref} from "vue";

useSeoMeta({
  title: "Services - Borys",
  description:
      "Custom PC building & assembly and mechanical keyboard builds. Professional hardware solutions tailored to your needs.",
  ogTitle: "Services - Borys",
  ogDescription: "PC building and custom keyboard assembly services",
  ogImage: "/img/portfolio.png",
  twitterCard: "summary_large_image",
});

interface Service {
  title: string;
  icon: any;
  emoji: string;
  description: string;
  features: string[];
  perfectFor: string;
  pricing: {
    tiers: {
      name: string;
      price: string;
      description: string;
      includes: string[];
    }[];
    notes: string[];
  };
}

const services: Service[] = [
  {
    title: "PC Building & Assembly",
    icon: ComputerDesktopIcon,
    emoji: "🖥️",
    description:
        "Custom PC builds tailored to your exact needs. Whether you're a gamer, content creator, or developer, I'll help you pick the perfect components and assemble them professionally.",
    features: [
      "Component selection & compatibility consultation",
      "Budget optimization & best value recommendations",
      "Professional assembly with cable management",
      "BIOS setup, OS installation & driver updates",
      "Stress testing & performance optimization",
      "1-year post-build support & troubleshooting",
    ],
    perfectFor: "Gaming rigs, workstations, streaming setups, home servers",
    pricing: {
      tiers: [
        {
          name: "Consultation Only",
          price: "€40",
          description: "Perfect if you want to build it yourself",
          includes: [
            "1-hour video/in-person consultation",
            "Complete parts list with compatibility check",
            "Budget optimization recommendations",
            "Build guide with step-by-step instructions",
            "Email support for questions during your build",
          ],
        },
        {
          name: "Standard Build",
          price: "€125",
          description: "Complete assembly service",
          includes: [
            "Everything in Consultation",
            "Professional assembly with cable management",
            "BIOS configuration & OS installation",
            "Driver updates & essential software setup",
            "Stress testing & performance validation",
            "2 weeks post-build support",
          ],
        },
        {
          name: "Premium Build",
          price: "€200",
          description: "For high-end builds with extras",
          includes: [
            "Everything in Standard Build",
            "Advanced cable management & aesthetics",
            "RGB synchronization & custom lighting",
            "Performance tuning & optimization",
            "Custom BIOS profiles for gaming/workstation",
            "Delivery & setup at your location (Amsterdam area)",
            "1 month priority support",
          ],
        },
      ],
      notes: [
        "Parts cost separate - typical builds range €500-€2500",
        "Travel to customer is to be paid by the customer",
        "Payment: 50% before assembly, 50% on completion",
      ],
    },
  },
  {
    title: "Custom Keyboard Builds",
    icon: CommandLineIcon,
    emoji: "⌨️",
    description:
        "Elevate your typing experience with a custom mechanical keyboard. From switch selection to full assembly, I'll create a keyboard that's uniquely yours.",
    features: [
      "Switch type consultation (linear, tactile, clicky)",
      "PCB, case, and keycap selection guidance",
      "Professional soldering & assembly",
      "Switch lubing & stabilizer modding",
      "Firmware flashing & custom key mapping (QMK/VIA)",
      "Sound dampening & acoustic optimization",
    ],
    perfectFor:
        "Enthusiasts, programmers, writers, anyone who values typing quality",
    pricing: {
      tiers: [
        {
          name: "Consultation",
          price: "€25",
          description: "Get expert advice on your build",
          includes: [
            "30-45 minute consultation (video or in-person)",
            "Switch recommendations based on your typing style",
            "Complete parts list with vendor links",
            "Layout recommendations (60%, 65%, 75%, TKL, Full)",
            "Keycap & colorway suggestions",
          ],
        },
        {
          name: "Assembly & Modding",
          price: "€75",
          description: "I'll build and tune your keyboard",
          includes: [
            "Everything in Consultation",
            "Professional soldering (if needed)",
            "Switch lubing with quality lube",
            "Stabilizer tuning (clipping, lubing, band-aid mod)",
            "Firmware flashing (QMK/VIA)",
            "Sound dampening (foam/tape mods)",
            "Full testing & quality check",
          ],
        },
        {
          name: "Premium Custom",
          price: "€140",
          description: "Complete custom build from scratch",
          includes: [
            "Everything in Assembly & Modding",
            "Premium switch lubing with Krytox 205g0",
            "Advanced stabilizer modding (Holee, wire balancing)",
            "Case foam cutting & plate modifications",
            "Custom QMK programming with layers",
            "Acoustic tuning for optimal sound",
            "Spring swapping (if requested)",
            "Detailed build documentation",
          ],
        },
      ],
      notes: [
        "Parts cost separate - budget builds start at €120, premium €200-500+",
        "Hot-swap builds (no soldering) available - same pricing",
        "Bring your own parts or I can source them for you",
        "Turnaround time: 3-7 days depending on complexity",
      ],
    },
  },
];

const openModalIndex = ref<number | null>(null);

const currentService = computed(() => {
  if (openModalIndex.value !== null) {
    return services[openModalIndex.value];
  }
  return null;
});

const openModal = (index: number) => {
  openModalIndex.value = index;
};

const closeModal = () => {
  openModalIndex.value = null;
};
</script>

<template>
  <section class="bg-background-light min-h-screen w-full px-4 py-20 md:py-32">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-12 flex flex-col items-center text-center md:mb-16">
        <h1
            class="gradient mb-4 w-fit text-4xl font-bold md:text-5xl lg:text-6xl"
        >
          Services
        </h1>
        <p class="text-text-secondary mx-auto max-w-3xl text-lg md:text-xl">
          Building custom PCs and mechanical keyboards with precision and care.
          Professional hardware solutions tailored to your needs.
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
        <FadeInSection v-for="(service, index) in services" :key="index">
          <div
              class="group border-border-light bg-background-light-2 relative h-full cursor-pointer overflow-hidden rounded-2xl border p-6 shadow-lg transition-all duration-300 hover:shadow-2xl md:p-8"
              @click="openModal(index)"
          >
            <!-- Icon & Emoji -->
            <div class="mb-6">
              <div
                  class="border-border-light bg-background-light mb-4 inline-flex items-center justify-center rounded-xl border p-3"
              >
                <component
                    :is="service.icon"
                    class="text-text-primary h-12 w-12"
                />
              </div>
              <h2
                  class="gradient mb-3 w-fit text-2xl font-bold transition-colors md:text-3xl"
              >
                {{ service.title }}
              </h2>
            </div>

            <!-- Description -->
            <p
                class="text-text-secondary mb-6 w-fit text-justify leading-relaxed"
            >
              {{ service.description }}
            </p>

            <!-- Features List -->
            <div class="mb-6 space-y-3">
              <h3 class="text-text-primary w-fit text-lg font-semibold">
                What's Included:
              </h3>
              <ul class="text-text-secondary space-y-2 text-sm">
                <li
                    v-for="(feature, idx) in service.features.slice(0, 4)"
                    :key="idx"
                    class="flex w-fit items-start"
                >
                  <span class="text-accent mt-1 mr-2">✓</span>
                  <span>{{ feature }}</span>
                </li>
                <li class="text-accent flex w-fit items-start italic">
                  <span class="mt-1 mr-2">+</span>
                  <span
                  >{{ service.features.length - 4 }} more features...</span
                  >
                </li>
              </ul>
            </div>

            <!-- Perfect For -->
            <div class="border-border-light mb-4 border-t pt-4">
              <p class="text-text-secondary w-fit text-sm">
                <span class="text-text-primary font-semibold"
                >Perfect for:</span
                >
                {{ service.perfectFor }}
              </p>
            </div>

            <!-- Click Hint -->
            <p
                class="text-accent mt-auto w-fit pt-4 text-sm font-medium italic opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              Click to see pricing & details →
            </p>
          </div>
        </FadeInSection>
      </div>

      <!-- Modal for Pricing -->
      <Teleport to="body">
        <Transition name="modal">
          <div
              v-if="openModalIndex !== null && currentService !== null"
              class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              @click.self="closeModal"
          >
            <div
                class="modal-card border-border-light bg-background-light-2 relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border p-8 shadow-2xl"
                @click.stop
            >
              <!-- Close Button -->
              <button
                  aria-label="Close modal"
                  class="bg-background-light hover:bg-background-light-2 absolute top-4 right-4 rounded-lg p-2 transition-colors duration-200"
                  @click="closeModal"
              >
                <svg
                    class="text-text-primary h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                  />
                </svg>
              </button>

              <!-- Modal Content -->
              <div v-if="currentService" class="text-text-primary">
                <!-- Icon -->
                <div
                    class="border-border-light bg-background-light mb-6 inline-flex items-center justify-center rounded-xl border p-4"
                >
                  <component
                      :is="currentService.icon"
                      class="text-text-primary h-12 w-12"
                  />
                </div>

                <!-- Title -->
                <h3 class="gradient mb-6 w-fit text-3xl font-bold md:text-4xl">
                  {{ currentService.title }}
                </h3>

                <!-- Description -->
                <p
                    class="text-text-secondary border-border-light mb-6 w-fit border-b pb-6 text-justify text-base leading-relaxed"
                >
                  {{ currentService.description }}
                </p>

                <!-- All Features -->
                <div class="mb-8">
                  <h4 class="text-accent-2 mb-4 w-fit text-lg font-semibold">
                    All Features:
                  </h4>
                  <ul class="mb-4 space-y-3">
                    <li
                        v-for="(detail, idx) in currentService.features"
                        :key="idx"
                        class="text-text-secondary flex w-fit items-start space-x-3 text-base"
                    >
                      <span class="text-accent mt-1 text-lg font-bold">•</span>
                      <span class="flex-1 leading-relaxed">{{ detail }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Pricing Tiers -->
                <div class="space-y-6">
                  <h4 class="gradient mb-6 w-fit text-2xl font-bold">
                    Pricing Options
                  </h4>

                  <div class="space-y-4">
                    <div
                        v-for="(tier, idx) in currentService.pricing.tiers"
                        :key="idx"
                        class="border-border-light bg-background-light hover:border-accent rounded-xl border p-6 transition-colors duration-200"
                    >
                      <div class="mb-3 flex items-start justify-between">
                        <div>
                          <h5 class="text-text-primary w-fit text-xl font-bold">
                            {{ tier.name }}
                          </h5>
                          <p class="text-text-secondary mt-1 w-fit text-sm">
                            {{ tier.description }}
                          </p>
                        </div>
                        <div
                            class="text-accent ml-4 text-2xl font-bold whitespace-nowrap"
                        >
                          {{ tier.price }}
                        </div>
                      </div>

                      <ul class="mt-4 space-y-2">
                        <li
                            v-for="(item, itemIdx) in tier.includes"
                            :key="itemIdx"
                            class="text-text-secondary flex w-fit items-start text-sm"
                        >
                          <span class="text-accent mt-1 mr-2">✓</span>
                          <span>{{ item }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Pricing Notes -->
                  <div
                      class="border-border-light bg-background-light mt-6 rounded-xl border p-4"
                  >
                    <h5
                        class="text-text-primary mb-3 w-fit text-sm font-semibold"
                    >
                      Important Notes:
                    </h5>
                    <ul class="space-y-2">
                      <li
                          v-for="(note, noteIdx) in currentService.pricing.notes"
                          :key="noteIdx"
                          class="text-text-secondary flex w-fit items-start text-xs"
                      >
                        <span class="text-accent mt-1 mr-2">•</span>
                        <span>{{ note }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- CTA Section -->
      <FadeInSection>
        <div class="mt-16 text-center">
          <div
              class="border-border-light bg-background-light-2 mx-auto max-w-3xl rounded-2xl border p-8 shadow-lg md:p-12"
          >
            <h2
                class="gradient mx-auto mb-4 w-fit text-2xl font-bold md:text-3xl"
            >
              Ready to Start Your Project?
            </h2>
            <p class="text-text-secondary mb-8 text-lg">
              Let's discuss your needs and create something amazing together.
            </p>
            <NuxtLink
                class="border-text-primary bg-background-light text-text-primary hover:bg-text-primary hover:text-background-light inline-block rounded-xl border-2 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-lg"
                to="/contact"
            >
              Get in Touch
            </NuxtLink>
          </div>
        </div>
      </FadeInSection>
    </div>
  </section>
</template>

<style scoped>
/* Modal animations */
.modal-enter-active {
  transition: opacity 0.3s ease;
}

.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-card {
  animation: modalSpinIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal-card {
  animation: modalSpinOut 0.4s cubic-bezier(0.36, 0, 0.66, -0.56);
}

@keyframes modalSpinIn {
  0% {
    transform: scale(0.7) rotateY(-180deg) rotateX(20deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotateY(0deg) rotateX(0deg);
    opacity: 1;
  }
}

@keyframes modalSpinOut {
  0% {
    transform: scale(1) rotateY(0deg) rotateX(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.7) rotateY(180deg) rotateX(-20deg);
    opacity: 0;
  }
}
</style>

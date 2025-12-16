<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="$emit('close')"
      >
        <div
            class="modal-card relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-border-light bg-background-light-2 p-8 shadow-2xl"
            @click.stop
        >
          <!-- Close Button -->
          <button
              aria-label="Close modal"
              class="absolute top-4 right-4 p-2 rounded-lg hover:bg-background-light transition-colors duration-200"
              @click="$emit('close')"
          >
            <svg class="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
          </button>

          <!-- Modal Content -->
          <div class="text-text-primary">
            <!-- Logo -->
            <slot name="icon">
              <div v-if="icon"
                   class="mb-6 inline-flex items-center justify-center rounded-xl bg-white p-4 border border-border-light">
                <img :alt="title" :src="icon" class="w-16 h-16 object-contain"/>
              </div>
            </slot>

            <!-- Title -->
            <h3 class="gradient mb-6 text-3xl md:text-4xl font-bold w-fit">
              {{ title }}
            </h3>

            <!-- Metadata-->
            <div v-if="metaText || period" class="mb-6 flex flex-wrap gap-4 text-text-secondary">
              <span v-if="metaText" class="flex items-center gap-2">
                <component :is="metaIcon" class="w-5 h-5"/>
                {{ metaText }}
              </span>
              <span v-if="period" class="flex items-center gap-2">
                <CalendarIcon class="w-5 h-5"/>
                {{ period }}
              </span>
            </div>

            <!-- Description -->
            <p v-if="description"
               class="text-text-secondary text-justify leading-relaxed mb-6 pb-6 border-b border-border-light text-base w-fit">
              {{ description }}
            </p>

            <!-- Details List -->
            <div v-if="details && details.length > 0">
              <h4 class="text-lg font-semibold text-accent-2 mb-4 w-fit">{{ detailsTitle }}:</h4>
              <ul class="space-y-3 mb-4">
                <li
                    v-for="(detail, idx) in details"
                    :key="idx"
                    class="flex items-start space-x-3 text-text-secondary text-base w-fit"
                >
                  <span class="text-accent mt-1 text-lg font-bold">•</span>
                  <span class="leading-relaxed flex-1">{{ detail }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import {CalendarIcon} from "@heroicons/vue/24/outline";
import type {Component} from "vue";

defineProps<{
  isOpen: boolean;
  icon: string;
  title: string;
  metaIcon?: Component;
  metaText?: string;
  period?: string;
  description?: string;
  details?: string[];
  detailsTitle: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style>
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
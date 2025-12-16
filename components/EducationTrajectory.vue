<template>
  <div
    class="bg-background-light border-border-light rounded-lg border p-3 md:p-4"
  >
    <h2 class="gradient mb-3 w-fit text-xs font-bold md:mb-4 md:text-sm">
      Education
    </h2>
    <div class="space-y-3 md:space-y-4">
      <div
        v-for="(education, index) in educations"
        :key="education.degree"
        class="group hover:bg-background-light-2/90 hover-lift cursor-hover flex cursor-pointer items-start gap-2 rounded-lg p-1.5 transition-all duration-200 md:gap-3 md:p-2"
        @click="openModal(index)"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center md:h-10 md:w-10"
        >
          <img
            :alt="education.school"
            :src="education.icon"
            class="border-border-light h-full w-fit rounded-full border bg-white object-contain p-1"
          />
        </div>
        <div class="grow">
          <h3 class="w-fit text-xs font-medium md:text-sm">
            {{ education.degree }}
          </h3>
          <div
            class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-0"
          >
            <p class="text-text-secondary mt-0.5 max-w-5/10 text-xs">
              {{ education.school }}
            </p>

            <span class="text-text-secondary text-xs">{{
              education.period
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <DetailModal
      :description="currentEducation?.description"
      :details="currentEducation?.focusAreas"
      :icon="currentEducation?.icon || ''"
      :is-open="openModalIndex !== null && currentEducation !== null"
      :meta-icon="AcademicCapIcon"
      :meta-text="currentEducation?.school || ''"
      :period="currentEducation?.period || ''"
      :title="currentEducation?.degree || ''"
      details-title="Focus Areas"
      @close="closeModal"
    />
  </div>
</template>

<script lang="ts" setup>
import { AcademicCapIcon } from "@heroicons/vue/24/outline";
import { computed, ref } from "vue";

const props = defineProps<{
  educations: Array<{
    degree: string;
    school: string;
    period: string;
    icon: string;
    description?: string;
    focusAreas?: string[];
  }>;
}>();

const openModalIndex = ref<number | null>(null);

const currentEducation = computed(() => {
  if (openModalIndex.value !== null) {
    return props.educations[openModalIndex.value];
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

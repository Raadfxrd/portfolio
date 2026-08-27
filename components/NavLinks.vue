<template>
  <ul
      class="flex items-center gap-2 text-xs font-medium sm:gap-4 sm:text-sm md:gap-6"
  >
    <li v-for="link in links" :key="link.path">
      <NuxtLink :to="link.path" class="hover:text-text-secondary transition">
        {{ link.label }}
      </NuxtLink>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import {useNavigation} from "~/composables/useNavigation";

const {links} = useNavigation();
</script>

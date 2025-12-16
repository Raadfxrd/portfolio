<template>
  <NuxtLayout>
    <NuxtPage/>
    <Analytics/>
  </NuxtLayout>
</template>

<script setup>
import {Analytics} from "@vercel/analytics/nuxt";
import "@/assets/css/main.css";
import "@/assets/css/animations.css";
</script>

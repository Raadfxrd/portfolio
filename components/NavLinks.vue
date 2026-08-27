<template>
  <ul class="flex items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm font-medium">
    <li>
      <NuxtLink class="hover:text-text-secondary transition" to="/projects">
        Projects
      </NuxtLink>
    </li>
    <li class="hidden sm:block">
      <NuxtLink class="hover:text-text-secondary transition" to="/interests">
        Interests
      </NuxtLink>
    </li>
    <li class="hidden md:block">
      <NuxtLink class="hover:text-text-secondary transition" to="/services">
        Services
      </NuxtLink>
    </li>
    <li>
      <NuxtLink class="hover:text-text-secondary transition" to="/blog">
        Blog
      </NuxtLink>
    </li>
    <li>
      <NuxtLink class="hover:text-text-secondary transition" to="/contact">
        Contact
      </NuxtLink>
    </li>
  </ul>
</template>
<script lang="ts" setup></script>

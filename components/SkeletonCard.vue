<template>
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton skeleton-thumb"/>
    <div class="skeleton skeleton-title"/>
    <div class="skeleton skeleton-line"/>
    <div class="skeleton skeleton-line short"/>
    <div class="skeleton-chip-row">
      <span class="skeleton skeleton-chip"/>
      <span class="skeleton skeleton-chip"/>
    </div>
    <div class="skeleton skeleton-meta"/>
  </div>
</template>

<script lang="ts" setup>
/**
 * Placeholder for one card in a loading grid.
 *
 * The shape lived inline in pages/projects.vue, which is why the blog made do
 * with a line of "Loading posts..." text. The `.skeleton` base and its shimmer
 * come from main.css so every waiting surface reads the same.
 */
</script>

<style scoped>
.skeleton-card {
  background: var(--color-background-light);
  border: 1px solid var(--color-border-light);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.skeleton-thumb {
  height: 140px;
  border-radius: 0.65rem;
}

.skeleton-title {
  height: 18px;
  width: 70%;
}

.skeleton-line {
  height: 12px;
  width: 100%;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-chip-row {
  display: flex;
  gap: 0.5rem;
}

.skeleton-chip {
  height: 20px;
  width: 64px;
  border-radius: 9999px;
}

.skeleton-meta {
  height: 12px;
  width: 55%;
}
</style>

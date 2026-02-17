<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="container">
    <h1>PDF Tools</h1>

    <nav class="tabs">
      <RouterLink to="/" class="tab" active-class="tab--active">Markdown 変換</RouterLink>
      <RouterLink to="/split" class="tab" active-class="tab--active">PDF 分割</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
  background: #fafafa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab {
  padding: 0.6rem 1.2rem;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}

.tab:hover {
  color: #333;
}

.tab--active {
  color: #333;
  border-bottom-color: #333;
}
</style>

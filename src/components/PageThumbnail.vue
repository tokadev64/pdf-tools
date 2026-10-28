<script setup lang="ts">
import { computed } from "vue";

import type { PageInfo } from "../types/pdf.ts";

const props = defineProps<{
  page: PageInfo;
  fileName: string;
  selected?: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();

const truncatedName = computed(() => {
  const name = props.fileName;
  return name.length > 15 ? `${name.slice(0, 12)}...` : name;
});
</script>

<template>
  <button
    type="button"
    class="thumbnail-card"
    :class="{ 'thumbnail-card--selected': selected }"
    :aria-pressed="selected ? 'true' : 'false'"
    @click="emit('select')"
  >
    <span class="visually-hidden">プレビューを表示</span>
    <span class="thumbnail-image" :style="{ transform: `rotate(${page.rotation}deg)` }">
      <img v-if="page.thumbnailUrl" :src="page.thumbnailUrl" :alt="`ページ ${page.pageNumber}`" />
      <span v-else class="placeholder">
        <span>{{ page.pageNumber }}</span>
      </span>
    </span>
    <span class="thumbnail-info">
      <span class="file-name" :title="fileName">{{ truncatedName }}</span>
      <span class="page-number">{{ page.pageNumber }}</span>
    </span>
  </button>
</template>

<style scoped>
.thumbnail-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: center;
  cursor: pointer;
}

.thumbnail-image {
  display: block;
  width: 120px;
  height: 160px;
  border: 2px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (prefers-reduced-motion: no-preference) {
  .thumbnail-image {
    transition: transform 0.2s;
  }
}

.thumbnail-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  font-size: 1.5rem;
}

.thumbnail-info {
  text-align: center;
  font-size: 0.75rem;
  color: #666;
  max-width: 120px;
}

.file-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-number {
  color: #999;
}

.thumbnail-card--selected .thumbnail-image {
  border-color: #4a7cf7;
  box-shadow: 0 0 0 2px rgba(74, 124, 247, 0.3);
}
</style>

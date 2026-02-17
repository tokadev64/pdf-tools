<script setup lang="ts">
import { computed } from "vue";
import type { PageInfo } from "../types/pdf.ts";

const props = defineProps<{
  page: PageInfo;
  fileName: string;
}>();

const truncatedName = computed(() => {
  const name = props.fileName;
  return name.length > 15 ? `${name.slice(0, 12)}...` : name;
});
</script>

<template>
  <div class="thumbnail-card">
    <div class="thumbnail-image" :style="{ transform: `rotate(${page.rotation}deg)` }">
      <img v-if="page.thumbnailUrl" :src="page.thumbnailUrl" :alt="`ページ ${page.pageNumber}`" />
      <div v-else class="placeholder">
        <span>{{ page.pageNumber }}</span>
      </div>
    </div>
    <div class="thumbnail-info">
      <span class="file-name" :title="fileName">{{ truncatedName }}</span>
      <span class="page-number">{{ page.pageNumber }}</span>
    </div>
  </div>
</template>

<style scoped>
.thumbnail-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.thumbnail-image {
  width: 120px;
  height: 160px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
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
</style>

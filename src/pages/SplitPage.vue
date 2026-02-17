<script setup lang="ts">
import PageGrid from "../components/PageGrid.vue";
import PdfUploader from "../components/PdfUploader.vue";
import SplitToolbar from "../components/SplitToolbar.vue";
import { usePdfSplitter } from "../composables/usePdfSplitter.ts";

const {
  pages,
  splitPoints,
  fileName,
  isLoading,
  isSplitting,
  error,
  splitCount,
  canSplit,
  loadPdf,
  loadThumbnail,
  toggleSplit,
  rotateAllPages,
  executeSplit,
} = usePdfSplitter();
</script>

<template>
  <div>
    <template v-if="pages.length === 0">
      <PdfUploader @file-selected="loadPdf" />
      <div v-if="isLoading" class="status">読み込み中...</div>
    </template>

    <template v-else>
      <SplitToolbar
        :split-count="splitCount"
        :can-split="canSplit"
        @rotate-left="rotateAllPages(-90)"
        @rotate-right="rotateAllPages(90)"
        @execute="executeSplit"
      />

      <PageGrid
        :pages="pages"
        :split-points="splitPoints"
        :file-name="fileName"
        @toggle-split="toggleSplit"
        @request-thumbnail="loadThumbnail"
      />
    </template>

    <div v-if="isSplitting" class="status">分割中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<style scoped>
.status {
  text-align: center;
  padding: 1rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 1rem;
  color: #c00;
}
</style>

<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import PageGrid from "@/components/PageGrid.vue";
import PagePreview from "@/components/PagePreview.vue";
import PdfUploader from "@/components/PdfUploader.vue";
import SplitToolbar from "@/components/SplitToolbar.vue";

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
  selectedPage,
  previewUrl,
  isPreviewLoading,
  loadPdf,
  loadThumbnail,
  toggleSplit,
  rotateAllPages,
  selectPage,
  executeSplit,
} = usePdfSplitter();
</script>

<template>
  <div>
    <template v-if="pages.length === 0">
      <PdfUploader @file-selected="loadPdf" />
      <div v-if="isLoading" class="status">
        <LoadingSpinner label="PDF を読み込んでいます" />
        <span>読み込み中...</span>
      </div>
    </template>

    <template v-else>
      <SplitToolbar
        :split-count="splitCount"
        :can-split="canSplit"
        @rotate-left="rotateAllPages(-90)"
        @rotate-right="rotateAllPages(90)"
        @execute="executeSplit"
      />

      <div class="split-layout">
        <div class="split-layout__grid">
          <PageGrid
            :pages="pages"
            :split-points="splitPoints"
            :file-name="fileName"
            :selected-page="selectedPage"
            @toggle-split="toggleSplit"
            @request-thumbnail="loadThumbnail"
            @select-page="selectPage"
          />
        </div>

        <PagePreview
          v-if="selectedPage !== null"
          :preview-url="previewUrl"
          :page-number="selectedPage"
          :is-loading="isPreviewLoading"
          class="split-layout__preview"
        />
      </div>
    </template>

    <div v-if="isSplitting" class="status">
      <LoadingSpinner label="PDF を分割しています" />
      <span>分割中...</span>
    </div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.split-layout {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.split-layout__grid {
  flex: 1;
  min-width: 0;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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

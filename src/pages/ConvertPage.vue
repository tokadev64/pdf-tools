<script setup lang="ts">
import MarkdownPreview from "../components/MarkdownPreview.vue";
import PdfUploader from "../components/PdfUploader.vue";
import { usePdfConverter } from "../composables/usePdfConverter.ts";

const {
  fileName,
  merge,
  stripBreaks,
  isProcessing,
  error,
  markdown,
  processFile,
  downloadMarkdown,
} = usePdfConverter();
</script>

<template>
  <div>
    <PdfUploader @file-selected="processFile" />

    <div v-if="isProcessing" class="status">変換中...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <template v-if="markdown">
      <label class="merge-option">
        <input v-model="merge" type="checkbox" />
        ページ区切りなし（連続テキスト）
      </label>
      <label class="merge-option">
        <input v-model="stripBreaks" type="checkbox" />
        改行を除去（段落単位にまとめる）
      </label>

      <MarkdownPreview :markdown="markdown" :file-name="fileName" @download="downloadMarkdown" />
    </template>
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

.merge-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  cursor: pointer;
}
</style>

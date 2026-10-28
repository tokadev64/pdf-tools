<script setup lang="ts">
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import MarkdownPreview from "@/components/MarkdownPreview.vue";
import PdfUploader from "@/components/PdfUploader.vue";

import { usePdfConverter } from "../composables/usePdfConverter.ts";

const {
  fileName,
  merge,
  stripBreaks,
  ocrLang,
  isProcessing,
  status,
  error,
  markdown,
  processFile,
  downloadMarkdown,
} = usePdfConverter();
</script>

<template>
  <div>
    <label class="ocr-lang">
      OCR 言語
      <select v-model="ocrLang" :disabled="isProcessing">
        <option value="jpn+eng">日本語+英語</option>
        <option value="jpn">日本語</option>
        <option value="eng">英語</option>
      </select>
    </label>
    <p class="ocr-note">文字データが無いページは、この言語で OCR します。</p>

    <PdfUploader @file-selected="processFile" />

    <div v-if="isProcessing" class="status">
      <LoadingSpinner label="PDF を処理しています" />
      <span>{{ status }}</span>
    </div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

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
.ocr-lang {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.4rem;
}

.ocr-lang select {
  font: inherit;
  padding: 0.3rem 0.5rem;
}

.ocr-note {
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.9rem;
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

.merge-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  cursor: pointer;
}
</style>

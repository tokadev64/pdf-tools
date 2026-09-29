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
  ocr,
  progress,
  hasFile,
  reprocessFile,
  markdown,
  processFile,
  downloadMarkdown,
} = usePdfConverter();
</script>

<template>
  <div>
    <label class="merge-option">
      <input v-model="ocr" type="checkbox" :disabled="isProcessing" />
      画像ページを OCR で読み取る（日本語・英語）
    </label>
    <p v-if="ocr" class="ocr-note">
      文字を抽出できない画像ページだけを読み取ります。通常の変換より時間がかかり、誤字が含まれる場合があります。
      初回は認識データをダウンロードします。PDF は外部に送信しません。
    </p>
    <PdfUploader :disabled="isProcessing" @file-selected="processFile" />
    <button v-if="hasFile" :disabled="isProcessing" @click="reprocessFile">
      現在の設定で再変換
    </button>

    <div v-if="isProcessing" class="status" role="status">{{ progress }}</div>
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
.ocr-note {
  color: #666;
  font-size: 0.85rem;
}

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

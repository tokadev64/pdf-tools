<script setup lang="ts">
import { ref } from "vue";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const emit = defineEmits<{
  "file-selected": [file: File];
}>();

const error = ref("");
const dragDepth = ref(0);

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function validateAndEmit(file: File | undefined) {
  error.value = "";
  if (!file) return;
  if (!isPdf(file)) {
    error.value = "PDF ファイルを選択してください";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    error.value = "ファイルサイズが大きすぎます（上限 50MB）";
    return;
  }
  emit("file-selected", file);
}

function onDrop(event: DragEvent) {
  dragDepth.value = 0;
  validateAndEmit(event.dataTransfer?.files[0]);
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  validateAndEmit(input.files?.[0]);
  input.value = "";
}
</script>

<template>
  <div
    class="uploader"
    :class="{ 'uploader--dragover': dragDepth > 0 }"
    @drop.prevent="onDrop"
    @dragenter.prevent="dragDepth++"
    @dragover.prevent
    @dragleave="dragDepth = Math.max(0, dragDepth - 1)"
  >
    <p>PDF ファイルをドラッグ＆ドロップ</p>
    <p>または</p>
    <input class="file-input" type="file" accept="application/pdf,.pdf" @change="onFileChange" />
    <p v-if="error" class="uploader-error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.uploader {
  border: 2px dashed #888;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.uploader--dragover {
  border-color: #4a7cf7;
  background: #f0f4ff;
}

.file-input {
  font: inherit;
  color: inherit;
  max-width: 100%;
}

.file-input::file-selector-button {
  font: inherit;
  margin-right: 0.75rem;
  padding: 0.5rem 1.5rem;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.file-input::file-selector-button:hover {
  background: #555;
}

.uploader-error {
  margin: 0.75rem 0 0;
  color: #c00;
}
</style>

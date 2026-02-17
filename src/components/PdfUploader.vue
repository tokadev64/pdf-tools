<script setup lang="ts">
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const emit = defineEmits<{
  "file-selected": [file: File];
}>();

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function validateAndEmit(file: File | undefined) {
  if (!file || !isPdf(file)) return;
  if (file.size > MAX_FILE_SIZE) {
    alert("ファイルサイズが大きすぎます（上限 50MB）");
    return;
  }
  emit("file-selected", file);
}

function onDrop(event: DragEvent) {
  validateAndEmit(event.dataTransfer?.files[0]);
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  validateAndEmit(input.files?.[0]);
  input.value = "";
}
</script>

<template>
  <div class="uploader" @drop.prevent="onDrop" @dragover.prevent>
    <p>PDF ファイルをドラッグ＆ドロップ</p>
    <p>または</p>
    <label class="file-label">
      ファイルを選択
      <input type="file" accept=".pdf" hidden @change="onFileChange" />
    </label>
  </div>
</template>

<style scoped>
.uploader {
  border: 2px dashed #888;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.uploader:hover {
  border-color: #333;
}

.file-label {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: #333;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.file-label:hover {
  background: #555;
}
</style>

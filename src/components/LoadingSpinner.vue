<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<template>
  <progress class="loading-spinner" :aria-label="label" />
</template>

<style scoped>
@property --arc-start {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@property --arc-end {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@property --progress-dash-animation {
  syntax: "*";
  inherits: false;
  initial-value:
    ,
    progress-dash 3s ease-in-out infinite;
}

progress.loading-spinner:indeterminate::-webkit-progress-bar {
  display: none;
  background: none;
}

progress.loading-spinner:indeterminate::-webkit-progress-value {
  display: none;
  background: none;
}

progress.loading-spinner:indeterminate::-moz-progress-bar {
  display: none;
  background: none;
}

progress.loading-spinner:indeterminate::slider-fill {
  display: none;
  background: none;
}

progress.loading-spinner:indeterminate {
  --_from: calc(90deg + var(--arc-start, 0deg));
  --_to: calc(90deg + var(--arc-end, 158deg));
  --size: 40px;
  --thickness: 3px;
  --spinner-color: #4a7cf7;
  --track-color: #e2e5e7;
  --spinner-duration: 1.5s;
  --_used-spinner-duration: var(--spinner-duration);
  --spinner-timing: linear;

  position: relative;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  appearance: none;

  background: conic-gradient(
      from var(--_from),
      var(--spinner-color) calc(var(--_to) - var(--_from)),
      transparent 0
    )
    var(--track-color);

  @supports (background-clip: border-area) {
    background-clip: border-area;
    border: var(--thickness) solid transparent;
    background-origin: border-box;
  }

  animation: progress-spin var(--_used-spinner-duration) var(--spinner-timing) infinite
    var(--progress-dash-animation,);
}

@supports not (background-clip: border-area) {
  progress.loading-spinner:indeterminate {
    --clip-boundary: calc(100% - var(--thickness));
    mask-image: radial-gradient(
      farthest-side,
      transparent var(--clip-boundary),
      black var(--clip-boundary)
    );
    border: 0;
  }
}

@keyframes progress-spin {
  to {
    rotate: 1turn;
  }
}

@keyframes progress-dash {
  from {
    --arc-start: 0deg;
    --arc-end: 3deg;
  }
  50% {
    --arc-start: 100deg;
    --arc-end: 358deg;
  }
  to {
    --arc-start: 360deg;
    --arc-end: 363deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  progress.loading-spinner {
    --_used-spinner-duration: 6s;
  }
}
</style>

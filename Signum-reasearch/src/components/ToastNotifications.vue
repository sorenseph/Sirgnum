<script setup lang="ts">
import { useToastStore, type ToastType } from '@/stores/toast'

const toast = useToastStore()

const typeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-700 text-white',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm"
      aria-live="polite"
    >
      <div
        v-for="item in toast.toasts"
        :key="item.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg text-sm flex items-center justify-between gap-4 animate-[slideIn_0.25s_ease-out]',
          typeStyles[item.type],
        ]"
      >
        <span>{{ item.message }}</span>
        <button
          type="button"
          @click="toast.remove(item.id)"
          class="shrink-0 opacity-80 hover:opacity-100"
          aria-label="Cerrar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

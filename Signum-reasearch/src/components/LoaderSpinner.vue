<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  label?: string
  inline?: boolean
}>()
</script>

<template>
  <div :class="['flex items-center justify-center', inline ? 'gap-2' : 'flex-col gap-3']">
    <div
      :class="[
        'shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600',
        size === 'sm' && 'h-5 w-5 border',
        size === 'md' && 'h-8 w-8 border-2',
        (size === 'lg' || !size) && 'h-12 w-12 border-2',
      ]"
    />
    <span v-if="label" class="text-sm text-slate-500 dark:text-slate-400">{{ label }}</span>
  </div>
</template>

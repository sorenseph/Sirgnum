import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])
  let id = 0

  function show(message: string, type: ToastType = 'info') {
    const item: ToastItem = { id: ++id, message, type }
    toasts.value = [...toasts.value, item]
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== item.id)
    }, 4000)
  }

  function success(message: string) {
    show(message, 'success')
  }

  function error(message: string) {
    show(message, 'error')
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, success, error, remove }
})

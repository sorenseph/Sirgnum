<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchNoteById, getPreviewText, categoryLabels, canReadFullContent } from '@/services/notesService'
import type { Note } from '@/types/database'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const note = ref<Note | null>(null)
const loading = ref(true)
const PREVIEW_CHARS = 150

const canRead = computed(() =>
  canReadFullContent(
    auth.isAuthenticated,
    auth.profile?.can_read ?? false,
    auth.isEditor
  )
)

const displayContent = computed(() => {
  if (!note.value) return ''
  if (canRead.value) return note.value.content
  return getPreviewText(note.value.content, PREVIEW_CHARS)
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(async () => {
  const id = route.params.id as string
  const { data, error } = await fetchNoteById(id)
  if (error || !data) {
    router.replace('/reportes')
    return
  }
  note.value = data
  loading.value = false
})
</script>

<template>
  <div class="pt-24 pb-16 px-4 min-h-screen bg-gray-50 dark:bg-gray-900">
    <div v-if="loading" class="max-w-3xl mx-auto text-center py-16 text-gray-500">
      Cargando...
    </div>

    <article v-else-if="note" class="max-w-3xl mx-auto">
      <div class="mb-6">
        <router-link
          to="/reportes"
          class="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1"
        >
          ← Volver a reportes
        </router-link>
      </div>

      <header class="mb-8">
        <span
          class="inline-block px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full mb-4"
        >
          {{ categoryLabels[note.category] || note.category }}
        </span>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {{ note.title }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          {{ formatDate(note.created_at) }}
        </p>
      </header>

      <div v-if="note.header_image_url" class="mb-8 rounded-xl overflow-hidden">
        <img
          :src="note.header_image_url"
          :alt="note.title"
          class="w-full h-auto object-cover"
        />
      </div>

      <div
        class="prose prose-slate dark:prose-invert max-w-none"
        :class="{ 'relative': !canRead }"
      >
        <div
          class="text-gray-700 dark:text-gray-300 leading-relaxed prose-p:my-2"
          v-html="displayContent"
        />
        <div
          v-if="!canRead"
          class="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 pointer-events-none"
          style="bottom: 0; height: 200px"
        />
      </div>

      <!-- CTA para no autenticados -->
      <div
        v-if="!canRead"
        class="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-800 text-center"
      >
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Regístrate o inicia sesión para leer el reporte completo.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <router-link
            to="/login"
            class="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Iniciar sesión
          </router-link>
          <router-link
            to="/login"
            class="px-6 py-3 bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
          >
            Crear cuenta
          </router-link>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  fetchPublishedNotes,
  getPreviewText,
  stripHtml,
  categoryLabels,
  canReadFullContent,
} from '@/services/notesService'
import type { Note } from '@/types/database'

const auth = useAuthStore()
const router = useRouter()
const notes = ref<Note[]>([])
const loading = ref(true)
const activeCategory = ref('todos')

const sections = [
  { key: 'todos', label: 'Todos' },
  { key: 'equity', label: 'Equity' },
  { key: 'valuacion', label: 'Valuación' },
  { key: 'economicos', label: 'Análisis Económicos' },
  { key: 'fibras', label: 'Fibras' },
  { key: 'sectoriales', label: 'Sectoriales' },
  { key: 'especiales', label: 'Especiales' },
  { key: 'nota_tecnica', label: 'Nota Técnica' },
]

const PREVIEW_CHARS = 120

const filteredNotes = computed(() => {
  if (activeCategory.value === 'todos') return notes.value
  return notes.value.filter((n) => n.category === activeCategory.value)
})

function canRead(note: Note): boolean {
  return canReadFullContent(
    auth.isAuthenticated,
    auth.profile?.can_read ?? false,
    auth.isEditor
  )
}

function previewFor(note: Note): string {
  return getPreviewText(note.content, PREVIEW_CHARS)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function goToNote(id: string) {
  router.push(`/reportes/${id}`)
}

async function loadNotes() {
  loading.value = true
  const { data, error } = await fetchPublishedNotes()
  if (!error) notes.value = data
  loading.value = false
}

onMounted(loadNotes)
</script>

<template>
  <div class="pt-24 pb-16 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="max-w-screen-xl mx-auto">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">
        Reportes Integrales
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-center mb-10 max-w-2xl mx-auto">
        Análisis elaborados por nuestros expertos. Regístrate o inicia sesión para acceder al contenido completo.
      </p>

      <!-- Secciones / Filtro -->
      <div class="flex flex-wrap justify-center gap-2 mb-12">
        <button
          v-for="sec in sections"
          :key="sec.key"
          @click="activeCategory = sec.key"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
            activeCategory === sec.key
              ? 'bg-emerald-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
          ]"
        >
          {{ sec.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16 text-gray-500">
        Cargando reportes...
      </div>

      <!-- Grid de reportes -->
      <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="note in filteredNotes"
          :key="note.id"
          class="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700 group cursor-pointer"
          @click="goToNote(note.id)"
        >
          <div class="overflow-hidden h-48 relative">
            <img
              v-if="note.header_image_url"
              :src="note.header_image_url"
              :alt="note.title"
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center"
            >
              <span class="text-4xl text-white/80">📊</span>
            </div>
            <div
              class="absolute top-0 right-0 bg-emerald-600 text-white text-xs px-3 py-1 m-2 rounded-full"
            >
              {{ categoryLabels[note.category] || note.category }}
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <span class="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
              {{ formatDate(note.created_at) }}
            </span>
            <h2 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {{ note.title }}
            </h2>
            <p
              class="text-gray-500 dark:text-gray-400 text-sm flex-1"
              :class="{ 'line-clamp-3': !canRead(note) }"
            >
              <template v-if="canRead(note)">
                {{ stripHtml(note.content).slice(0, 200) }}{{ stripHtml(note.content).length > 200 ? '...' : '' }}
              </template>
              <template v-else>
                {{ previewFor(note) }}
                <span class="text-emerald-600 font-medium"> Inicia sesión para leer el reporte completo.</span>
              </template>
            </p>
            <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <span
                v-if="!canRead(note)"
                class="text-emerald-600 font-medium text-sm"
              >
                Registrarse para ver más →
              </span>
              <span v-else class="text-gray-400 text-sm">Leer reporte</span>
              <svg
                class="w-5 h-5 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </article>
      </div>

      <p v-if="!loading && !filteredNotes.length" class="text-center text-gray-500 py-16">
        No hay reportes en esta sección.
      </p>
    </div>
  </div>
</template>

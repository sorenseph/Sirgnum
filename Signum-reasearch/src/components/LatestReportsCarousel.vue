<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchLatestNotes, categoryLabels, stripHtml } from '@/services/notesService'
import type { Note } from '@/types/database'

const router = useRouter()
const reports = ref<Note[]>([])
const loading = ref(true)
const currentIndex = ref(0)
let intervalId: number | null = null

async function loadReports() {
  loading.value = true
  const { data } = await fetchLatestNotes(5)
  reports.value = data || []
  loading.value = false
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function goToReport(id: string) {
  router.push(`/reportes/${id}`)
}

const nextSlide = () => {
  if (!reports.value.length) return
  currentIndex.value = (currentIndex.value + 1) % reports.value.length
}

const prevSlide = () => {
  if (!reports.value.length) return
  currentIndex.value =
    (currentIndex.value - 1 + reports.value.length) % reports.value.length
}

const startAutoPlay = () => {
  if (reports.value.length > 1) {
    intervalId = window.setInterval(nextSlide, 5000)
  }
}

const stopAutoPlay = () => {
  if (intervalId) clearInterval(intervalId)
}

onMounted(() => {
  loadReports().then(() => startAutoPlay())
})

onUnmounted(stopAutoPlay)
</script>

<template>
  <section class="py-12 bg-gray-50 dark:bg-gray-900 overflow-hidden">
    <div class="max-w-screen-xl mx-auto px-4 relative">
      <div class="flex justify-between items-end mb-8">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
            Últimos Reportes
          </h2>
          <p class="text-gray-500 mt-2">
            Mantente informado con nuestros análisis más recientes.
          </p>
          <router-link
            to="/reportes"
            class="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Ver todos los reportes →
          </router-link>
        </div>
        <div v-if="reports.length > 1" class="flex space-x-2">
          <button
            @click="prevSlide"
            @mouseenter="stopAutoPlay"
            @mouseleave="startAutoPlay"
            class="p-2 rounded-full bg-white shadow-md text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all z-10"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            @click="nextSlide"
            @mouseenter="stopAutoPlay"
            @mouseleave="startAutoPlay"
            class="p-2 rounded-full bg-white shadow-md text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-600 transition-all z-10"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="h-[400px] flex items-center justify-center">
        <p class="text-gray-500">Cargando reportes...</p>
      </div>

      <div
        v-else-if="reports.length"
        class="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl group"
        @mouseenter="stopAutoPlay"
        @mouseleave="startAutoPlay"
      >
        <div
          class="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        >
          <div
            v-for="(report, idx) in reports"
            :key="report.id"
            class="min-w-full h-full relative cursor-pointer"
            @click="goToReport(report.id)"
          >
            <img
              v-if="report.header_image_url"
              :src="report.header_image_url"
              :alt="report.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center"
            >
              <span class="text-6xl text-white/80">📊</span>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent flex items-end p-8 md:p-16"
            >
              <div class="max-w-3xl transform transition-all duration-700">
                <span
                  class="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-white uppercase bg-emerald-600 rounded-full"
                >
                  {{ categoryLabels[report.category] || report.category }}
                </span>
                <h3 class="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  {{ report.title }}
                </h3>
                <p class="text-gray-300 text-lg mb-6 line-clamp-2">
                  {{ stripHtml(report.content).slice(0, 160) }}{{
                    stripHtml(report.content).length > 160 ? '...' : ''
                  }}
                </p>
                <div class="flex items-center text-gray-400 text-sm">
                  <svg
                    class="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {{ formatDate(report.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Indicators -->
        <div
          v-if="reports.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center space-x-2"
        >
          <button
            v-for="(_, index) in reports"
            :key="index"
            @click="currentIndex = index"
            class="w-3 h-3 rounded-full transition-colors duration-300"
            :class="
              currentIndex === index ? 'bg-emerald-500' : 'bg-white/50 hover:bg-white/80'
           "
          />
        </div>
      </div>

      <div
        v-else
        class="h-[300px] flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800"
      >
        <p class="text-gray-500">Aún no hay reportes publicados.</p>
      </div>
    </div>
  </section>
</template>

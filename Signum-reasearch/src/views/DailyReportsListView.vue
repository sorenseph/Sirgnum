<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { DailyReport } from '@/types/database'

const router = useRouter()
const reports = ref<DailyReport[]>([])
const loading = ref(true)

async function loadReports() {
  loading.value = true
  try {
    const res = await Promise.race([
      supabase
        .from('daily_reports')
        .select('*')
        .eq('is_published', true)
        .order('report_date', { ascending: false })
        .limit(50),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 15000)
      ),
    ])
    const { data } = res as { data: DailyReport[] }
    reports.value = (data || []) as DailyReport[]
  } catch (_) {
    reports.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function goTo(id: string) {
  router.push(`/reporte-diario/${id}`)
}

onMounted(loadReports)
</script>

<template>
  <div class="pt-24 pb-16 px-4 min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
        Reportes Diarios
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mb-10">
        Resumen bursátil diario: mercado doméstico, EE.UU., índices, renta fija,
        commodities, noticias financieras y más.
      </p>

      <div v-if="loading" class="text-center py-16 text-gray-500">
        Cargando reportes...
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="r in reports"
          :key="r.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
          @click="goTo(r.id)"
        >
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {{ r.title }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(r.report_date) }}
          </p>
          <div class="mt-3 flex items-center text-emerald-600 text-sm font-medium">
            Ver reporte
            <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </article>

        <p v-if="!loading && !reports.length" class="text-center py-16 text-gray-500">
          No hay reportes diarios publicados.
        </p>
      </div>
    </div>
  </div>
</template>

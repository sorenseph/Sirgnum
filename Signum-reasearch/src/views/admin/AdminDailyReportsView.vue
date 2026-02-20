<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import {
  SECTION_KEYS,
  SECTION_LABELS,
  type DailyReportSections,
} from '@/types/dailyReport'
import type { DailyReport, ReportClient } from '@/types/database'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const reports = ref<DailyReport[]>([])
const clients = ref<ReportClient[]>([])
const loading = ref(true)
const showForm = ref(false)
const generating = ref(false)
const generateError = ref<string | null>(null)
const activeSection = ref<string | null>(SECTION_KEYS[0] ?? null)
const editingId = ref<string | null>(null)

const defaultSections: DailyReportSections = {
  comentario_bursatil: '',
  mercado_domestico: '',
  mercado_eeuu: '',
  empresas_mayores_movimientos: '',
  indices_mercados_accionarios: '',
  renta_fija_domestica: '',
  renta_fija_internacional: '',
  mercado_cambiario: '',
  commodities: '',
  multiplos_diarios: '',
  resumen_mercado: '',
  noticias_nacionales: '',
  noticias_internacionales: '',
}

const formData = ref({
  title: '',
  report_date: new Date().toISOString().slice(0, 10),
  client_id: null as string | null,
  form_responses: { ...defaultSections } as DailyReportSections,
  is_published: true,
})

const FETCH_TIMEOUT = 15000

async function loadReports() {
  loading.value = true
  try {
    const res = await Promise.race([
      supabase.from('daily_reports').select('*').order('report_date', { ascending: false }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), FETCH_TIMEOUT)
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

async function loadClients() {
  try {
    const { data } = await supabase
      .from('report_clients')
      .select('*')
      .eq('is_active', true)
      .order('company_name')
    clients.value = (data || []) as ReportClient[]
  } catch (_) {
    clients.value = []
  }
}

function getSectionValue(key: keyof DailyReportSections): string {
  const v = formData.value.form_responses?.[key]
  return typeof v === 'string' ? v : ''
}

function setSectionValue(key: keyof DailyReportSections, value: string) {
  formData.value.form_responses = {
    ...formData.value.form_responses,
    [key]: value,
  }
}

function openCreate() {
  editingId.value = null
  formData.value = {
    title: `Reporte Diario - ${new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    report_date: new Date().toISOString().slice(0, 10),
    client_id: null,
    form_responses: { ...defaultSections },
    is_published: true,
  }
  activeSection.value = SECTION_KEYS[0] ?? null
  showForm.value = true
}

function openEdit(r: DailyReport) {
  editingId.value = r.id
  const responses =
    (r.form_responses as Partial<DailyReportSections>) || defaultSections
  formData.value = {
    title: r.title,
    report_date: r.report_date,
    client_id: r.client_id ?? null,
    form_responses: { ...defaultSections, ...responses },
    is_published: r.is_published,
  }
  activeSection.value = SECTION_KEYS[0] ?? null
  showForm.value = true
}

function openView(r: DailyReport) {
  router.push({ name: 'reporte-diario', params: { id: r.id }, query: { from: 'admin' } })
}

async function saveReport() {
  const basePayload = {
    title: formData.value.title,
    report_date: formData.value.report_date,
    form_responses: formData.value.form_responses,
    is_published: formData.value.is_published,
    author_id: auth.user?.id,
  }
  const payloadWithClient = { ...basePayload, client_id: formData.value.client_id } as Record<string, unknown>

  async function trySave(useClientId: boolean) {
    const p = useClientId ? payloadWithClient : basePayload
    if (editingId.value) {
      return supabase.from('daily_reports').update(p).eq('id', editingId.value)
    }
    return supabase.from('daily_reports').insert(p)
  }

  let { error } = await trySave(!!formData.value.client_id)
  if (error?.message?.includes('client_id')) {
    const res = await trySave(false)
    error = res.error
  }
  if (error) throw error
  showForm.value = false
  loadReports()
}

async function deleteReport(id: string) {
  if (!confirm('¿Eliminar este reporte?')) return
  await supabase.from('daily_reports').delete().eq('id', id)
  loadReports()
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function generateAutoReport() {
  generating.value = true
  generateError.value = null
  try {
    const session = await supabase.auth.getSession()
    if (!session.data.session) {
      generateError.value = 'Debe iniciar sesión para generar reportes automáticos.'
      return
    }
    const { data, error } = await supabase.functions.invoke('generate-daily-report', {
      method: 'POST',
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    toast.success('Reporte generado. Revise la lista y edite o publique si lo desea.')
    await new Promise((r) => setTimeout(r, 1200))
    await loadReports()
  } catch (e) {
    const msg = (e as Error).message
    // Mostrar mensaje más útil según el tipo de error
    if (msg.includes('Failed to send') || msg.includes('fetch')) {
      generateError.value =
        'No se pudo conectar con la Edge Function. Compruebe: 1) VITE_SUPABASE_URL apunta a fbjpmqjzaltprocobgwp, 2) La función está desplegada, 3) Hay conexión a internet.'
    } else if (msg.includes('401') || msg.includes('JWT') || msg.includes('unauthorized')) {
      generateError.value = 'Sesión expirada o no autorizada. Cierre sesión y vuelva a iniciar.'
    } else {
      generateError.value = msg
    }
  } finally {
    generating.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadReports(), loadClients()])
})
</script>

<template>
  <div>
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Reportes diarios</h2>
      <div class="flex gap-2">
        <button
          @click="generateAutoReport"
          :disabled="generating"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ generating ? 'Generando...' : 'Generar automático (APIs)' }}
        </button>
        <button
          @click="openCreate"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Nuevo reporte
        </button>
      </div>
    </div>
    <p v-if="generateError" class="mb-4 text-red-600 text-sm">
      {{ generateError }}
    </p>
    <p class="mb-4 text-slate-600 text-sm max-w-xl">
      Para datos reales (índices, Banxico, noticias), configura en Supabase Secrets:
      <strong>BANXICO_TOKEN</strong>, <strong>ALPHA_VANTAGE_KEY</strong>, <strong>NEWSAPI_KEY</strong>.
      Para noticias nacionales más fiables: <strong>GNEWS_API_KEY</strong> (gnews.io, plan gratuito).
      Ver <a href="https://supabase.com/dashboard/project/fbjpmqjzaltprocobgwp/settings/functions" target="_blank" rel="noopener" class="text-emerald-600 hover:underline">Secrets → Edge Functions</a>.
    </p>

    <div v-if="loading" class="text-slate-500">Cargando...</div>

    <!-- Formulario completo -->
    <div
      v-else-if="showForm"
      class="bg-white rounded-xl shadow p-6 mb-6 border border-slate-200"
    >
      <h3 class="text-lg font-semibold mb-4">
        {{ editingId ? 'Editar' : 'Nuevo' }} reporte diario
      </h3>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna izquierda: metadatos -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Título</label
            >
            <input
              v-model="formData.title"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
              placeholder="Reporte del día..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Fecha</label
            >
            <input
              v-model="formData.report_date"
              type="date"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Cliente (logo y colores)</label
            >
            <select
              v-model="formData.client_id"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option :value="null">Signum Research (por defecto)</option>
              <option
                v-for="c in clients"
                :key="c.id"
                :value="c.id"
              >
                {{ c.company_name }}
              </option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="formData.is_published"
              type="checkbox"
              id="published"
            />
            <label for="published">Publicado</label>
          </div>
        </div>

        <!-- Columna derecha: secciones con pestañas -->
        <div class="lg:col-span-2">
          <div class="flex flex-wrap gap-1 mb-4 border-b border-slate-200 pb-2">
            <button
              v-for="key in SECTION_KEYS"
              :key="key"
              @click="activeSection = key"
              :class="[
                'px-2 py-1 text-xs rounded',
                activeSection === key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ]"
            >
              {{ SECTION_LABELS[key].slice(0, 15) }}{{ SECTION_LABELS[key].length > 15 ? '...' : '' }}
            </button>
          </div>

          <div
            v-for="key in SECTION_KEYS"
            :key="key"
            v-show="activeSection === key"
            class="space-y-2"
          >
            <label class="block text-sm font-medium text-slate-700">
              {{ SECTION_LABELS[key] }}
            </label>
            <textarea
              :value="getSectionValue(key)"
              @input="setSectionValue(key, ($event.target as HTMLTextAreaElement).value)"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
              rows="8"
              :placeholder="`Pegar contenido de ${SECTION_LABELS[key]}...`"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-2 mt-6 pt-4 border-t border-slate-200">
        <button
          @click="saveReport"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Guardar reporte
        </button>
        <button
          @click="showForm = false"
          class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
        >
          Cancelar
        </button>
        <a
          v-if="editingId"
          :href="`/reporte-diario/${editingId}?from=admin`"
          target="_blank"
          class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
        >
          Ver reporte
        </a>
      </div>
    </div>

    <!-- Lista de reportes -->
    <div class="space-y-4">
      <div
        v-for="r in reports"
        :key="r.id"
        class="bg-white rounded-xl shadow p-4 flex justify-between items-center border border-slate-100"
      >
        <div>
          <h4 class="font-semibold text-slate-800">{{ r.title }}</h4>
          <p class="text-sm text-slate-500">{{ formatDate(r.report_date) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="text-xs px-2 py-1 rounded"
            :class="
              r.is_published
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-600'
            "
          >
            {{ r.is_published ? 'Publicado' : 'Borrador' }}
          </span>
          <button
            @click="openView(r)"
            class="px-2 py-1 text-sm bg-slate-100 rounded hover:bg-slate-200"
          >
            Ver
          </button>
          <button
            @click="openEdit(r)"
            class="px-2 py-1 text-sm bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
          >
            Editar
          </button>
          <button
            @click="deleteReport(r.id)"
            class="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Eliminar
          </button>
        </div>
      </div>
      <p v-if="!loading && !reports.length" class="text-slate-500">
        No hay reportes diarios.
      </p>
    </div>
  </div>
</template>

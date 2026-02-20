<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import {
  SECTION_KEYS,
  SECTION_LABELS,
  type DailyReportSections,
} from '@/types/dailyReport'
import type { DailyReport, ReportClient } from '@/types/database'

const route = useRoute()
const router = useRouter()
const report = ref<DailyReport | null>(null)
const client = ref<ReportClient | null>(null)
const loading = ref(true)

const brandStyle = computed(() => {
  const c = client.value
  if (!c) return { primary: '#0f766e', secondary: '#14b8a6' }
  return {
    primary: c.primary_color_hex || '#0f766e',
    secondary: c.secondary_color_hex || '#14b8a6',
  }
})

const sections = computed(() => {
  const r = report.value
  if (!r?.form_responses) return []
  const resp = r.form_responses as Partial<DailyReportSections>
  return SECTION_KEYS.filter((key) => {
    const v = resp[key]
    return typeof v === 'string' && v.trim().length > 0
  })
})

function getSectionContent(key: keyof DailyReportSections): string {
  const r = report.value
  if (!r?.form_responses) return ''
  const v = (r.form_responses as Partial<DailyReportSections>)[key]
  return typeof v === 'string' ? v : ''
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y) return dateStr
  const dte = new Date(y, (m || 1) - 1, d || 1)
  return dte.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Parsea líneas tipo "Label: 105.32 (+0.5 0.48%)" para tarjetas de datos */
function parseDataLines(text: string): Array<{ label: string; value: string; numeric?: number; positive?: boolean; isUnavailable?: boolean }> {
  const lines = text.split('\n').filter(Boolean)
  return lines
    .map((line) => {
      const colonIdx = line.indexOf(':')
      const label = colonIdx > 0 ? line.slice(0, colonIdx).trim() : line
      const rest = colonIdx > 0 ? line.slice(colonIdx + 1).trim() : ''
      if (label === 'Fuente' || rest === '') return null
      const hasPlus = /\(\+|\+\d|0\.\d+\)/.test(rest)
      const hasMinus = /\(-|-\d|-0\.\d+\)/.test(rest)
      let positive: boolean | undefined
      if (hasPlus && !hasMinus) positive = true
      else if (hasMinus && !hasPlus) positive = false
      const isUnavailable = rest === 'N/D' || rest.includes('API') || rest.includes('configurada')
      const numMatch = rest.match(/^([\d.,]+)/)
      const numeric = numMatch?.[1] != null ? parseFloat(numMatch[1].replace(',', '')) : undefined
      return { label, value: rest || '—', numeric: isUnavailable ? undefined : numeric, positive, isUnavailable }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
}

/** Tipos de gráfico que rotan por sección */
const CHART_TYPES: ('bar' | 'line' | 'pie')[] = ['bar', 'line', 'pie']
function getChartType(sectionKey: string): 'bar' | 'line' | 'pie' {
  const idx = SECTION_KEYS.indexOf(sectionKey as keyof DailyReportSections)
  return CHART_TYPES[idx >= 0 ? idx % 3 : 0] ?? 'bar'
}

/** Datos para gráficos: solo items con valor numérico */
function chartDataFromSection(content: string) {
  const items = parseDataLines(content).filter((x) => x.numeric != null && x.numeric > 0)
  if (items.length === 0) return []
  const max = Math.max(...items.map((x) => x.numeric!))
  return items.map((x) => ({ ...x, pct: max > 0 ? (x.numeric! / max) * 100 : 0 }))
}

/** Path SVG para una porción de pastel */
function pieSlicePath(items: Array<{ pct: number }>, index: number): string {
  const total = items.reduce((s, x) => s + x.pct, 0)
  if (total <= 0) return ''
  const it = items[index]
  if (!it) return ''
  let startAngle = 0
  for (let i = 0; i < index; i++) startAngle += (items[i]!.pct / total) * 360
  const sweep = (it.pct / total) * 360
  const r = 45
  const cx = 50
  const cy = 50
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy - r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(startAngle + sweep))
  const y2 = cy - r * Math.sin(toRad(startAngle + sweep))
  const large = sweep > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2} Z`
}

function goBack() {
  if (route.query.from === 'admin') {
    router.push({ name: 'admin-daily-reports' })
  } else {
    router.push({ name: 'reportes-diarios' })
  }
}

function isApiError(text: string): boolean {
  return (
    text.includes('API') &&
    text.includes('configurada') ||
    text.includes('N/D') ||
    text.includes('Requerido:')
  )
}

function printReport() {
  window.print()
}

let printStyleEl: HTMLStyleElement | null = null

onMounted(async () => {
  document.documentElement.classList.add('report-print-view')
  printStyleEl = document.createElement('style')
  printStyleEl.textContent = '@media print { @page { margin: 0; size: auto; } }'
  document.head.appendChild(printStyleEl)
  const id = route.params.id as string
  try {
    const res = await Promise.race([
      supabase.from('daily_reports').select('*').eq('id', id).single(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 15000)
      ),
    ])
    const { data: reportData, error } = res as { data: DailyReport | null; error: unknown }

    if (error || !reportData) {
      goBack()
      return
    }

    report.value = reportData as DailyReport

    if (report.value.client_id) {
      const { data: clientData } = await supabase
        .from('report_clients')
        .select('*')
        .eq('id', report.value.client_id)
        .single()
      client.value = clientData as ReportClient | null
    }
  } catch (_) {
    goBack()
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  document.documentElement.classList.remove('report-print-view')
  if (printStyleEl?.parentNode) printStyleEl.parentNode.removeChild(printStyleEl)
  printStyleEl = null
})
</script>

<template>
  <div
    class="min-h-screen bg-slate-50"
    :style="{
      '--brand-primary': brandStyle.primary,
      '--brand-secondary': brandStyle.secondary,
    }"
  >
    <!-- Barra de acciones (oculta al imprimir) -->
    <div class="print:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          @click="goBack"
          class="text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a reportes
        </button>
        <button
          @click="printReport"
          class="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 text-sm font-medium shadow-md"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Guardar PDF
        </button>
      </div>
    </div>

    <!-- Footer fijo en cada hoja: teléfonos + Reporte Diario (solo impresión/PDF) -->
    <div
      class="report-page-footer print:flex hidden fixed bottom-0 left-0 right-0 items-center gap-4 px-6 py-2 border-t bg-white"
      :style="{ borderColor: brandStyle.primary }"
    >
      <div class="flex items-center gap-3 shrink-0">
        <div
          class="flex items-center justify-center w-6 h-6 rounded-full"
          :style="{ backgroundColor: `${brandStyle.primary}20`, color: brandStyle.primary }"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </div>
        <div class="text-[9px] text-slate-500 leading-tight">
          <span>55 6237 • 0861</span>
          <span class="mx-1">/</span>
          <span>55 6237 • 0862</span>
        </div>
      </div>
      <div class="h-4 w-px shrink-0" :style="{ backgroundColor: brandStyle.primary }" />
      <div class="flex-1 min-w-0">
        <span class="text-[10px] font-semibold" :style="{ color: brandStyle.primary }">Reporte Diario</span>
        <div class="mt-0.5 h-px w-20" :style="{ backgroundColor: brandStyle.primary }" />
      </div>
    </div>

    <!-- Contenedor del reporte (formato carta/A4) -->
    <div
      id="report-content"
      class="report-content-pdf max-w-[210mm] mx-auto bg-white shadow-xl my-8 rounded-lg print:shadow-none print:my-0 print:rounded-none"
    >
      <!-- Membrete / Header profesional -->
      <header
        class="report-header px-8 py-8 print:py-6"
        :style="{
          borderBottomWidth: '3px',
          borderBottomStyle: 'solid',
          borderColor: brandStyle.primary,
          background: `linear-gradient(to right, ${brandStyle.primary}08, white 30%)`,
        }"
      >
        <div class="flex items-center justify-between flex-wrap gap-6">
          <div class="flex items-center gap-4">
            <img
              src="@/assets/logo-signumresearch.svg"
              alt="Signum Research"
              class="h-16 object-contain print:h-14"
            />
            <div class="border-l-2 pl-4" :style="{ borderColor: brandStyle.secondary }">
              <p class="text-xs uppercase tracking-widest text-slate-500 font-bold">Reporte Diario</p>
              <p class="text-sm font-semibold mt-0.5" :style="{ color: brandStyle.primary }">Análisis Bursátil</p>
            </div>
          </div>
          <div class="text-right shrink-0" style="break-inside: avoid;">
            <p class="text-xs text-slate-500">Info@signumresearch.com</p>
            <p class="text-xs text-slate-500 mt-1">Tel. 55 6237 0861 / 55 6237 0862</p>
          </div>
        </div>
      </header>

      <div v-if="loading" class="px-8 py-20 text-center text-slate-500">
        Cargando reporte...
      </div>

      <article v-else-if="report" class="px-8 py-10 report-article">
        <!-- Título y fecha (membretado) -->
        <div
          class="mb-10 pb-6 border-b-2"
          :style="{
            borderColor: brandStyle.secondary,
            borderBottomWidth: '2px',
          }"
        >
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
            Reporte Diario - {{ formatDate(report.report_date) }}
          </h1>
        </div>

        <!-- Secciones -->
        <section
          v-for="key in sections"
          :key="key"
          class="mb-10 break-inside-avoid"
          style="break-inside: avoid;"
        >
          <h3
            class="text-sm font-bold uppercase tracking-wider mb-4 pb-2 flex items-center gap-2 break-inside-avoid"
            :style="{ color: brandStyle.primary, breakInside: 'avoid', pageBreakAfter: 'avoid' }"
          >
            <span
              class="w-1 h-5 rounded-full"
              :style="{ backgroundColor: brandStyle.primary }"
            ></span>
            {{ SECTION_LABELS[key] }}
          </h3>

          <!-- Secciones con tarjetas de datos (índices, commodities, renta fija) -->
          <div
            v-if="['mercado_eeuu', 'indices_mercados_accionarios', 'commodities', 'renta_fija_domestica', 'renta_fija_internacional', 'mercado_cambiario'].includes(key)"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="(item, i) in parseDataLines(getSectionContent(key))"
                :key="i"
                class="rounded-lg border p-3"
                :class="{
                  'border-slate-200 bg-slate-50/50': item.positive === undefined && !item.isUnavailable,
                  'border-emerald-200 bg-emerald-50/30': item.positive === true,
                  'border-red-200 bg-red-50/30': item.positive === false,
                  'border-amber-200/60 bg-amber-50/30': item.isUnavailable,
                }"
              >
                <p class="text-xs font-medium text-slate-500 mb-0.5">{{ item.label }}</p>
                <p class="text-sm font-semibold" :class="{
                  'text-emerald-700': item.positive === true,
                  'text-red-700': item.positive === false,
                  'text-slate-700': item.positive === undefined,
                }">
                  {{ item.value }}
                  <span v-if="item.positive === true" class="text-emerald-600">↑</span>
                  <span v-else-if="item.positive === false" class="text-red-600">↓</span>
                </p>
              </div>
            </div>
            <!-- Gráficos SVG (barras, líneas, pastel) que se preservan en PDF -->
            <div
              v-if="['mercado_eeuu', 'indices_mercados_accionarios', 'renta_fija_domestica', 'commodities'].includes(key) && chartDataFromSection(getSectionContent(key)).length > 0"
              class="mt-6 rounded-lg border border-slate-200 bg-white p-4 print:break-inside-avoid chart-export"
              :style="{ borderColor: '#e2e8f0' }"
            >
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Resumen visual</p>
              <template v-if="getChartType(key) === 'bar'">
                <div
                  v-for="(item, i) in chartDataFromSection(getSectionContent(key))"
                  :key="i"
                  class="flex items-center gap-3 mb-3 last:mb-0"
                >
                  <span class="text-xs font-medium text-slate-600 w-24 shrink-0">{{ item.label }}</span>
                  <div class="flex-1 h-6 rounded overflow-hidden" style="background-color: #f1f5f9;">
                    <div
                      class="h-full rounded"
                      :style="{
                        width: `${item.pct}%`,
                        backgroundColor: item.positive === true ? '#10b981' : item.positive === false ? '#ef4444' : brandStyle.primary,
                      }"
                    />
                  </div>
                  <span class="text-xs font-semibold text-slate-700 w-20 text-right">{{ item.numeric }}</span>
                </div>
              </template>
              <template v-else-if="getChartType(key) === 'line'">
                <svg viewBox="0 0 400 120" class="w-full h-28" preserveAspectRatio="none meet">
                  <defs>
                    <linearGradient :id="`line-grad-${key}`" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" :stop-color="brandStyle.primary" stop-opacity="0.3" />
                      <stop offset="100%" :stop-color="brandStyle.primary" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    :points="chartDataFromSection(getSectionContent(key)).map((x, i) => `${(i / Math.max(1, chartDataFromSection(getSectionContent(key)).length - 1)) * 380 + 10},${110 - (x.pct / 100) * 100}`).join(' ')"
                    fill="none"
                    :stroke="brandStyle.primary"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <polygon
                    :points="`10,110 ${chartDataFromSection(getSectionContent(key)).map((x, i) => `${(i / Math.max(1, chartDataFromSection(getSectionContent(key)).length - 1)) * 380 + 10},${110 - (x.pct / 100) * 100}`).join(' ')} 390,110`"
                    :fill="`url(#line-grad-${key})`"
                  />
                </svg>
                <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                  <span v-for="(item, i) in chartDataFromSection(getSectionContent(key))" :key="i">
                    {{ item.label }}: {{ item.numeric }}
                  </span>
                </div>
              </template>
              <template v-else-if="getChartType(key) === 'pie'">
                <div class="flex items-start gap-6">
                  <svg viewBox="0 0 100 100" class="w-32 h-32 shrink-0">
                    <g v-for="(item, i) in chartDataFromSection(getSectionContent(key))" :key="i">
                      <path
                        :d="pieSlicePath(chartDataFromSection(getSectionContent(key)), i)"
                        :fill="item.positive === true ? '#10b981' : item.positive === false ? '#ef4444' : brandStyle.primary"
                      />
                    </g>
                  </svg>
                  <div class="flex-1 text-xs space-y-1">
                    <div
                      v-for="(item, i) in chartDataFromSection(getSectionContent(key))"
                      :key="i"
                      class="flex items-center gap-2"
                    >
                      <span
                        class="w-2 h-2 rounded-full shrink-0"
                        :style="{ backgroundColor: item.positive === true ? '#10b981' : item.positive === false ? '#ef4444' : brandStyle.primary }"
                      />
                      <span class="text-slate-600">{{ item.label }}:</span>
                      <span class="font-semibold text-slate-800">{{ item.numeric }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Comentario bursátil y secciones de texto narrativo -->
          <div
            v-else-if="['comentario_bursatil', 'mercado_domestico'].includes(key)"
            class="rounded-lg bg-slate-50/50 border border-slate-100 p-5"
          >
            <p
              v-for="(para, i) in formatParagraphs(getSectionContent(key))"
              :key="i"
              class="mb-3 text-slate-700 leading-relaxed last:mb-0"
              :class="{ 'text-amber-800/90 bg-amber-50/50 rounded px-2 py-1 -mx-2': isApiError(para) }"
            >
              {{ para }}
            </p>
          </div>

          <!-- Noticias (el texto ya trae • al inicio, no duplicar) -->
          <div
            v-else-if="['noticias_nacionales', 'noticias_internacionales'].includes(key)"
            class="space-y-3"
          >
            <div
              v-for="(para, i) in formatParagraphs(getSectionContent(key))"
              :key="i"
              class="py-2 border-b border-slate-100 last:border-0"
              :class="{ 'text-amber-800/90': isApiError(para) }"
            >
              <p class="text-slate-700 text-sm leading-relaxed">{{ para }}</p>
            </div>
          </div>

          <!-- Placeholder / contenido preformateado -->
          <div
            v-else
            class="rounded-lg border border-slate-100 p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap"
            :class="{ 'bg-amber-50/30 text-amber-900/80': isApiError(getSectionContent(key)) }"
          >
            {{ getSectionContent(key) }}
          </div>
        </section>

        <!-- Footer: solo aviso legal (el footer con teléfonos + Reporte Diario está fijo en cada hoja) -->
        <footer class="report-footer mt-14 pt-6 print:mt-12">
          <div
            class="pt-4 border-t text-[10px] text-slate-600 leading-relaxed"
            :style="{ borderColor: brandStyle.primary }"
          >
            <p>
              Este documento y la información, opiniones, pronósticos y recomendaciones expresadas en él, fue preparado
              por Signum Research como una referencia para sus clientes y en ningún momento deberá interpretarse como
              una oferta, invitación o petición de compra, venta o suscripción de ningún título o instrumento ni a tomar
              o abandonar inversión alguna. La información contenida en este documento está sujeta a cambios sin
              notificación previa. Signum Research no asume la responsabilidad de notificar sobre dichos cambios o
              cualquier otro tipo de actualización del contenido.
            </p>
            <p class="mt-3">
              Los contenidos de este reporte están basados en información pública, disponible a los participantes de los
              mercados financieros, que se ha obtenido de fuentes que se consideran fidedignas pero sin garantía alguna,
              ni expresan de manera explícita o implícita su exactitud o integridad.
            </p>
            <p class="mt-3">
              Signum Research no acepta responsabilidad por ningún tipo de pérdidas, directas o indirectas, que
              pudieran generarse por el uso de la información contenida en el presente documento.
            </p>
            <p class="mt-3">
              Los documentos referidos, así como todo el contenido de www.signumresearch.com no podrán ser reproducidos
              parcial o totalmente sin la autorización explícita de Signum Research S.A. de C.V.
            </p>
          </div>
        </footer>
      </article>

      <div v-else class="px-8 py-16 text-center">
        <p class="text-slate-500 mb-4">Reporte no encontrado.</p>
        <button
          @click="goBack"
          class="text-[var(--brand-primary)] hover:underline font-medium"
        >
          Volver a reportes diarios
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.report-content-pdf,
.report-article {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  overflow: visible;
}
.report-article p {
  overflow-wrap: break-word;
  word-break: break-word;
}
.report-header {
  overflow: visible;
}

@media print {
  body { background: white !important; }
  .print\:hidden { display: none !important; }
  .print\:shadow-none { box-shadow: none !important; }
  .print\:my-0 { margin-top: 0 !important; margin-bottom: 0 !important; }
  .print\:rounded-none { border-radius: 0 !important; }
  #report-content {
    box-shadow: none !important;
    max-width: 100% !important;
  }
  .report-header {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>

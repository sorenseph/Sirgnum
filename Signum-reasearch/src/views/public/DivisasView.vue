<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchForexRates } from '@/services/forexService'
import type { ForexRate } from '@/services/forexService'

const rates = ref<ForexRate | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const baseCurrency = ref<'MXN' | 'USD'>('MXN')

async function loadRates() {
  loading.value = true
  error.value = null
  try {
    rates.value = await fetchForexRates(baseCurrency.value)
  } catch (e) {
    error.value = 'No se pudieron cargar las cotizaciones. Intenta más tarde.'
  } finally {
    loading.value = false
  }
}

onMounted(loadRates)

const currencyLabels: Record<string, string> = {
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  GBP: 'Libra esterlina',
  JPY: 'Yen japonés',
  CAD: 'Dólar canadiense',
  CHF: 'Franco suizo',
  MXN: 'Peso mexicano',
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <nav class="text-sm text-gray-500 mb-6">
        <RouterLink to="/" class="hover:text-emerald-600">Inicio</RouterLink>
        <span class="mx-2">/</span>
        <RouterLink to="/mercados" class="hover:text-emerald-600">Mercados</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 dark:text-gray-300">Divisas</span>
      </nav>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Divisas</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Cotizaciones en tiempo real (tasas de referencia, actualización diaria).
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Base:</span>
          <select
            v-model="baseCurrency"
            @change="loadRates"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div v-if="loading" class="text-center py-12 text-gray-500">Cargando cotizaciones...</div>
        <div v-else-if="error" class="text-center py-12 text-red-600">{{ error }}</div>
        <div v-else-if="rates" class="space-y-4">
          <p class="text-sm text-gray-500">
            Tasas del {{ rates.date }} (referencia Banco Central Europeo vía
            <a href="https://www.frankfurter.app/" target="_blank" rel="noopener" class="text-emerald-600 hover:underline">Frankfurter</a>).
          </p>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="(rate, currency) in rates.rates"
              :key="currency"
              class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ baseCurrency }} / {{ currency }}
              </div>
              <div class="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {{ Number(rate).toLocaleString('es-MX', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) }}
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                {{ currencyLabels[currency] || currency }}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

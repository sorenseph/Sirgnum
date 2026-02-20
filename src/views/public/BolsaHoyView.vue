<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { stockService } from '@/services/StockService'
import type { Stock } from '@/services/StockService'

const stocks = ref<Stock[]>([])
let intervalId: number | null = null

onMounted(() => {
  stocks.value = stockService.getStocks()
  intervalId = window.setInterval(() => {
    stocks.value = stockService.updateMarket()
  }, 3000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <nav class="text-sm text-gray-500 mb-6">
        <RouterLink to="/" class="hover:text-emerald-600">Inicio</RouterLink>
        <span class="mx-2">/</span>
        <RouterLink to="/mercados" class="hover:text-emerald-600">Mercados</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 dark:text-gray-300">La Bolsa Hoy</span>
      </nav>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">La Bolsa Hoy</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Variaciones del día en principales índices y divisas.
      </p>

      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Renta Variable - BMV e Internacional</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="s in stocks"
            :key="s.symbol"
            class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ s.symbol }}</div>
            <div class="text-xl font-bold text-gray-900 dark:text-white">
              {{ s.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </div>
            <div
              :class="[
                'text-sm font-medium flex items-center gap-1 mt-1',
                s.up ? 'text-emerald-600' : 'text-red-600',
              ]"
            >
              <span>{{ s.change > 0 ? '+' : '' }}{{ s.change.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Divisas</h2>
        <p class="text-sm text-gray-500 mb-4">
          Consulta <RouterLink to="/mercados/divisas" class="text-emerald-600 hover:underline">Divisas en tiempo real</RouterLink>.
        </p>
      </section>
    </div>
  </main>
</template>

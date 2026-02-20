<script setup lang="ts">
import { RouterLink } from 'vue-router'

const stats = [
  { value: '1500+', label: 'Reportes anuales' },
  { value: '2100+', label: 'Clientes satisfechos' },
  { value: '3100+', label: 'Servicios de valuación' },
  { value: '250+', label: 'Conferencias' },
]
</script>

<template>
  <section class="py-16 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
    <div class="max-w-screen-xl mx-auto px-4">
      <div class="text-center max-w-3xl mx-auto mb-12">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Empresa independiente de análisis financiero y bursátil
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Ofreciendo soluciones para todos los clientes en todo el mundo. Nuestra empresa solo puede ser tan fuerte como nuestra gente; 
          nuestro equipo dirige negocios y diseña reportes innovadores.
        </p>
        <RouterLink
          to="/servicios"
          class="inline-flex items-center mt-6 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Ver servicios
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </RouterLink>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="s in stats" :key="s.label" class="text-center p-4">
          <div class="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">{{ s.value }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

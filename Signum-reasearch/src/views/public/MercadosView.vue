<script setup lang="ts">
const sections = [
  { title: 'La Bolsa Hoy', desc: 'Índices, alzas y bajas del día.', to: { name: 'bolsa-hoy' }, icon: '📊' },
  { title: 'Industrias y Empresas', desc: 'Emisoras y empresas por industria.', to: { name: 'industrias' }, icon: '🏭' },
  { title: 'Recomendaciones', desc: 'Precios objetivo y recomendaciones de analistas.', to: { name: 'recomendaciones' }, icon: '📈' },
  { title: 'Divisas', desc: 'Cotizaciones en tiempo real.', to: { name: 'divisas' }, icon: '💱' },
]
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <nav class="text-sm text-gray-500 mb-6">
        <RouterLink to="/" class="hover:text-emerald-600">Inicio</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 dark:text-gray-300">Mercados</span>
      </nav>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mercados</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Información de mercado: bolsa, industrias, recomendaciones y divisas.
      </p>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RouterLink
          v-for="s in sections"
          :key="s.to.name"
          :to="s.to"
          class="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 dark:border-gray-700"
        >
          <div class="text-3xl mb-3">{{ s.icon }}</div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ s.title }}</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ s.desc }}</p>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

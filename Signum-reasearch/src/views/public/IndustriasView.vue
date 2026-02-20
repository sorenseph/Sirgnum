<script setup lang="ts">
// Emisoras de ejemplo (similar a Signum)
const emisoras = [
  { symbol: 'AC', name: 'Arca Continental', pais: 'MX' },
  { symbol: 'ACTINVR', name: 'Actinver', pais: 'MX' },
  { symbol: 'AEROMEX', name: 'Aeroméxico', pais: 'MX' },
  { symbol: 'AGUA', name: 'Grupo Rotoplas', pais: 'MX' },
  { symbol: 'ALFA', name: 'Alfa', pais: 'MX' },
  { symbol: 'AMXL', name: 'América Móvil', pais: 'MX' },
  { symbol: 'ASURB', name: 'Asur', pais: 'MX' },
  { symbol: 'BIMBOA', name: 'Bimbo', pais: 'MX' },
  { symbol: 'CEMEXCPO', name: 'Cemex', pais: 'MX' },
  { symbol: 'GFNORTEO', name: 'Banorte', pais: 'MX' },
  { symbol: 'GMEXICOB', name: 'Grupo México', pais: 'MX' },
  { symbol: 'KOFUBL', name: 'Coca-Cola FEMSA', pais: 'MX' },
  { symbol: 'ORBIA', name: 'Orbia', pais: 'MX' },
  { symbol: 'PE&OLES', name: 'Peñoles', pais: 'MX' },
  { symbol: 'WALMEX', name: 'Walmart de México', pais: 'MX' },
]
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <nav class="text-sm text-gray-500 mb-6">
        <RouterLink to="/" class="hover:text-emerald-600">Inicio</RouterLink>
        <span class="mx-2">/</span>
        <RouterLink to="/mercados" class="hover:text-emerald-600">Mercados</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 dark:text-gray-300">Industrias y Empresas</span>
      </nav>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Industrias y Empresas</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Selecciona una emisora para ver más detalles.
      </p>

      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Emisora</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">País</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in emisoras"
                :key="e.symbol"
                class="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ e.symbol }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ e.name }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {{ e.pais }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="px-4 py-3 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-600">
          Actualizado al día. Datos de referencia.
        </p>
      </section>
    </div>
  </main>
</template>

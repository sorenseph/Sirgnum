<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

interface Recommendation {
  id: string
  emisora: string
  precio_objetivo: number | null
  fecha_objetivo: string | null
  precio_cierre: number | null
  rendimiento_esperado: string | null
  recomendacion: string | null
  analyst_display_name: string | null
}

const items = ref<Recommendation[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  const { data } = await supabase
    .from('recommendations')
    .select('id, emisora, precio_objetivo, fecha_objetivo, precio_cierre, rendimiento_esperado, recomendacion, analyst_display_name')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  items.value = (data || []) as Recommendation[]
  loading.value = false
}

onMounted(load)
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <nav class="text-sm text-gray-500 mb-6">
        <RouterLink to="/" class="hover:text-emerald-600">Inicio</RouterLink>
        <span class="mx-2">/</span>
        <RouterLink to="/mercados" class="hover:text-emerald-600">Mercados</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 dark:text-gray-300">Recomendaciones</span>
      </nav>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recomendaciones</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Recomendaciones de nuestros analistas. Actualizado periódicamente.
      </p>

      <section class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div v-if="loading" class="py-12 text-center text-gray-500">Cargando...</div>
        <div v-else-if="!items.length" class="py-12 text-center text-gray-500">
          No hay recomendaciones publicadas.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold">Emisora</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Precio Objetivo</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Fecha Objetivo</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Precio Cierre</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Rend. Esperado</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Recomendación</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Analista</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in items"
                :key="r.id"
                class="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="px-4 py-3 font-medium">{{ r.emisora }}</td>
                <td class="px-4 py-3">
                  {{ r.precio_objetivo != null ? `$${Number(r.precio_objetivo).toLocaleString()}` : 'N/D' }}
                </td>
                <td class="px-4 py-3">{{ r.fecha_objetivo ? new Date(r.fecha_objetivo).toLocaleDateString() : 'N/D' }}</td>
                <td class="px-4 py-3">
                  {{ r.precio_cierre != null ? `$${Number(r.precio_cierre).toLocaleString()}` : 'N/D' }}
                </td>
                <td class="px-4 py-3">{{ r.rendimiento_esperado || 'N/D' }}</td>
                <td class="px-4 py-3">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      r.recomendacion === 'Comprar' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40' : '',
                      r.recomendacion === 'Mantener' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40' : '',
                      r.recomendacion === 'Vender' ? 'bg-red-100 text-red-800 dark:bg-red-900/40' : '',
                      !['Comprar','Mantener','Vender'].includes(r.recomendacion || '') ? 'bg-slate-100 text-slate-700' : '',
                    ]"
                  >
                    {{ r.recomendacion || '-' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {{ r.analyst_display_name || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

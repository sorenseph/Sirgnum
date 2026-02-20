<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

interface Rec {
  id: string
  emisora: string
  precio_objetivo: number | null
  fecha_objetivo: string | null
  precio_cierre: number | null
  rendimiento_esperado: string | null
  recomendacion: string | null
  analyst_display_name: string | null
  is_active: boolean
}

const items = ref<Rec[]>([])
const loading = ref(true)
const showForm = ref(false)
const editing = ref<Rec | null>(null)
const form = ref({
  emisora: '',
  precio_objetivo: '',
  fecha_objetivo: '',
  precio_cierre: '',
  rendimiento_esperado: '',
  recomendacion: 'Comprar',
  analyst_display_name: '',
})

async function load() {
  loading.value = true
  const { data } = await supabase.from('recommendations').select('*').order('created_at', { ascending: false })
  items.value = (data || []) as Rec[]
  loading.value = false
}

function openCreate() {
  editing.value = null
  form.value = { emisora: '', precio_objetivo: '', fecha_objetivo: '', precio_cierre: '', rendimiento_esperado: '', recomendacion: 'Comprar', analyst_display_name: '' }
  showForm.value = true
}

function openEdit(r: Rec) {
  editing.value = r
  form.value = {
    emisora: r.emisora,
    precio_objetivo: r.precio_objetivo != null ? String(r.precio_objetivo) : '',
    fecha_objetivo: r.fecha_objetivo || '',
    precio_cierre: r.precio_cierre != null ? String(r.precio_cierre) : '',
    rendimiento_esperado: r.rendimiento_esperado || '',
    recomendacion: r.recomendacion || 'Comprar',
    analyst_display_name: r.analyst_display_name || '',
  }
  showForm.value = true
}

async function save() {
  const payload = {
    emisora: form.value.emisora,
    precio_objetivo: form.value.precio_objetivo ? parseFloat(form.value.precio_objetivo) : null,
    fecha_objetivo: form.value.fecha_objetivo || null,
    precio_cierre: form.value.precio_cierre ? parseFloat(form.value.precio_cierre) : null,
    rendimiento_esperado: form.value.rendimiento_esperado || null,
    recomendacion: form.value.recomendacion || null,
    analyst_display_name: form.value.analyst_display_name || null,
  }
  if (editing.value) {
    await supabase.from('recommendations').update(payload).eq('id', editing.value.id)
  } else {
    await supabase.from('recommendations').insert(payload)
  }
  showForm.value = false
  load()
}

async function toggleActive(r: Rec) {
  await supabase.from('recommendations').update({ is_active: !r.is_active }).eq('id', r.id)
  load()
}

async function remove(r: Rec) {
  if (!confirm('¿Eliminar esta recomendación?')) return
  await supabase.from('recommendations').delete().eq('id', r.id)
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Recomendaciones</h2>
      <button @click="openCreate" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">+ Nueva</button>
    </div>

    <div v-if="loading" class="text-slate-500">Cargando...</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow overflow-hidden">
        <thead class="bg-slate-100">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold">Emisora</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">P. Obj</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Recom.</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Analista</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Activo</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in items" :key="r.id" class="border-t border-slate-200 hover:bg-slate-50">
            <td class="px-4 py-3">{{ r.emisora }}</td>
            <td class="px-4 py-3">{{ r.precio_objetivo != null ? r.precio_objetivo : '-' }}</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded text-xs bg-slate-200">{{ r.recomendacion }}</span></td>
            <td class="px-4 py-3 text-sm">{{ r.analyst_display_name || '-' }}</td>
            <td class="px-4 py-3">
              <button
                @click="toggleActive(r)"
                :class="['px-2 py-1 rounded text-xs', r.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700']"
              >
                {{ r.is_active ? 'Sí' : 'No' }}
              </button>
            </td>
            <td class="px-4 py-3 flex gap-2">
              <button @click="openEdit(r)" class="text-sm text-emerald-600 hover:underline">Editar</button>
              <button @click="remove(r)" class="text-sm text-red-600 hover:underline">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showForm = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="font-semibold mb-4">{{ editing ? 'Editar' : 'Nueva' }} recomendación</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Emisora *</label>
            <input v-model="form.emisora" class="w-full px-3 py-2 border rounded-lg" placeholder="Ej. WALMEX" required />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-slate-600 mb-1">Precio objetivo</label>
              <input v-model="form.precio_objetivo" type="number" step="0.01" class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-1">Fecha objetivo</label>
              <input v-model="form.fecha_objetivo" type="date" class="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-slate-600 mb-1">Precio cierre</label>
              <input v-model="form.precio_cierre" type="number" step="0.01" class="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-1">Rend. esperado</label>
              <input v-model="form.rendimiento_esperado" class="w-full px-3 py-2 border rounded-lg" placeholder="Ej. 40.51 %" />
            </div>
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Recomendación</label>
            <select v-model="form.recomendacion" class="w-full px-3 py-2 border rounded-lg">
              <option value="Comprar">Comprar</option>
              <option value="Mantener">Mantener</option>
              <option value="Vender">Vender</option>
              <option value="En revisión">En revisión</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Nombre del analista</label>
            <input v-model="form.analyst_display_name" class="w-full px-3 py-2 border rounded-lg" placeholder="Ej. CRISTINA MORALES" />
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button @click="save" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Guardar</button>
          <button @click="showForm = false" class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

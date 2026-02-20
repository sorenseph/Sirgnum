<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

interface Analyst {
  id: string
  display_name: string
  title: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  linkedin_url: string | null
  display_order: number
  is_active: boolean
}

const items = ref<Analyst[]>([])
const loading = ref(true)
const showForm = ref(false)
const editing = ref<Analyst | null>(null)
const form = ref({
  display_name: '',
  title: '',
  bio: '',
  avatar_url: '',
  email: '',
  linkedin_url: '',
  display_order: 0,
})

async function load() {
  loading.value = true
  const { data } = await supabase.from('analysts').select('*').order('display_order')
  items.value = (data || []) as Analyst[]
  loading.value = false
}

function openCreate() {
  editing.value = null
  form.value = { display_name: '', title: '', bio: '', avatar_url: '', email: '', linkedin_url: '', display_order: 0 }
  showForm.value = true
}

function openEdit(a: Analyst) {
  editing.value = a
  form.value = {
    display_name: a.display_name,
    title: a.title || '',
    bio: a.bio || '',
    avatar_url: a.avatar_url || '',
    email: a.email || '',
    linkedin_url: a.linkedin_url || '',
    display_order: a.display_order ?? 0,
  }
  showForm.value = true
}

async function save() {
  const payload = {
    display_name: form.value.display_name,
    title: form.value.title || null,
    bio: form.value.bio || null,
    avatar_url: form.value.avatar_url || null,
    email: form.value.email || null,
    linkedin_url: form.value.linkedin_url || null,
    display_order: form.value.display_order ?? 0,
  }
  if (editing.value) {
    await supabase.from('analysts').update(payload).eq('id', editing.value.id)
  } else {
    await supabase.from('analysts').insert(payload)
  }
  showForm.value = false
  load()
}

async function toggleActive(a: Analyst) {
  await supabase.from('analysts').update({ is_active: !a.is_active }).eq('id', a.id)
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Analistas</h2>
      <button @click="openCreate" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">+ Nuevo</button>
    </div>

    <div v-if="loading" class="text-slate-500">Cargando...</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow overflow-hidden">
        <thead class="bg-slate-100">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Título</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Orden</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Activo</th>
            <th class="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id" class="border-t border-slate-200 hover:bg-slate-50">
            <td class="px-4 py-3 font-medium">{{ a.display_name }}</td>
            <td class="px-4 py-3 text-sm">{{ a.title || '-' }}</td>
            <td class="px-4 py-3">{{ a.display_order }}</td>
            <td class="px-4 py-3">
              <button
                @click="toggleActive(a)"
                :class="['px-2 py-1 rounded text-xs', a.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700']"
              >
                {{ a.is_active ? 'Sí' : 'No' }}
              </button>
            </td>
            <td class="px-4 py-3">
              <button @click="openEdit(a)" class="text-sm text-emerald-600 hover:underline">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showForm = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="font-semibold mb-4">{{ editing ? 'Editar' : 'Nuevo' }} analista</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Nombre *</label>
            <input v-model="form.display_name" class="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Título / Cargo</label>
            <input v-model="form.title" class="w-full px-3 py-2 border rounded-lg" placeholder="Ej. Analista Senior" />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Bio breve</label>
            <textarea v-model="form.bio" rows="3" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">URL avatar</label>
            <input v-model="form.avatar_url" class="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">LinkedIn</label>
            <input v-model="form.linkedin_url" class="w-full px-3 py-2 border rounded-lg" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Orden de visualización</label>
            <input v-model.number="form.display_order" type="number" class="w-full px-3 py-2 border rounded-lg" />
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

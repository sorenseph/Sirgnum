<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { ReportClient } from '@/types/database'

const clients = ref<ReportClient[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  company_name: '',
  logo_url: '',
  primary_color_hex: '#004d40',
  secondary_color_hex: '#00cca0',
  is_active: true,
})

async function loadClients() {
  loading.value = true
  const { data } = await supabase
    .from('report_clients')
    .select('*')
    .order('company_name')
  clients.value = (data || []) as ReportClient[]
  loading.value = false
}

function openCreate() {
  editingId.value = null
  form.value = {
    company_name: '',
    logo_url: '',
    primary_color_hex: '#004d40',
    secondary_color_hex: '#00cca0',
    is_active: true,
  }
  showForm.value = true
}

function openEdit(c: ReportClient) {
  editingId.value = c.id
  form.value = {
    company_name: c.company_name,
    logo_url: c.logo_url || '',
    primary_color_hex: c.primary_color_hex,
    secondary_color_hex: c.secondary_color_hex,
    is_active: c.is_active,
  }
  showForm.value = true
}

async function saveClient() {
  const payload = {
    ...form.value,
    logo_url: form.value.logo_url || null,
  }
  if (editingId.value) {
    await supabase.from('report_clients').update(payload).eq('id', editingId.value)
  } else {
    await supabase.from('report_clients').insert(payload)
  }
  showForm.value = false
  loadClients()
}

async function deleteClient(id: string) {
  if (!confirm('¿Eliminar este cliente?')) return
  await supabase.from('report_clients').delete().eq('id', id)
  loadClients()
}

onMounted(loadClients)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Clientes para reportes</h2>
      <button
        @click="openCreate"
        class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
      >
        Agregar cliente
      </button>
    </div>

    <div v-if="loading" class="text-slate-500">Cargando...</div>

    <div v-else-if="showForm" class="bg-white rounded-xl shadow p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Editar' : 'Agregar' }} cliente</h3>
      <form @submit.prevent="saveClient" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Nombre de la empresa</label>
          <input
            v-model="form.company_name"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">URL del logo</label>
          <input
            v-model="form.logo_url"
            type="url"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="https://..."
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Color primario (hex)</label>
            <div class="flex gap-2">
              <input
                v-model="form.primary_color_hex"
                type="color"
                class="w-12 h-10 rounded cursor-pointer"
              />
              <input
                v-model="form.primary_color_hex"
                class="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="#004d40"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Color secundario (hex)</label>
            <div class="flex gap-2">
              <input
                v-model="form.secondary_color_hex"
                type="color"
                class="w-12 h-10 rounded cursor-pointer"
              />
              <input
                v-model="form.secondary_color_hex"
                class="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="#00cca0"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="form.is_active" type="checkbox" id="active" />
          <label for="active">Cliente activo</label>
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Guardar
          </button>
          <button
            type="button"
            @click="showForm = false"
            class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="c in clients"
        :key="c.id"
        class="bg-white rounded-xl shadow p-4 border-l-4"
        :style="{ borderLeftColor: c.primary_color_hex }"
      >
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-semibold text-slate-800">{{ c.company_name }}</h4>
            <img
              v-if="c.logo_url"
              :src="c.logo_url"
              :alt="c.company_name"
              class="h-10 mt-2 object-contain"
            />
            <div class="flex gap-2 mt-2">
              <span
                class="w-6 h-6 rounded border border-slate-300"
                :style="{ backgroundColor: c.primary_color_hex }"
                :title="c.primary_color_hex"
              />
              <span
                class="w-6 h-6 rounded border border-slate-300"
                :style="{ backgroundColor: c.secondary_color_hex }"
                :title="c.secondary_color_hex"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEdit(c)"
              class="px-2 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300"
            >
              Editar
            </button>
            <button
              @click="deleteClient(c.id)"
              class="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
        <span
          class="text-xs mt-2 inline-block px-2 py-0.5 rounded"
          :class="c.is_active ? 'bg-emerald-100' : 'bg-slate-200'"
        >
          {{ c.is_active ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </div>
    <p v-if="!loading && !clients.length" class="text-slate-500">No hay clientes.</p>
  </div>
</template>

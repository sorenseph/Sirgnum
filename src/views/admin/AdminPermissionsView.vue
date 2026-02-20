<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Profile } from '@/types/database'

const auth = useAuthStore()
const users = ref<Profile[]>([])
const loading = ref(true)
const updatingId = ref<string | null>(null)

const roles: { value: Profile['role']; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'reader', label: 'Lector' },
]

async function loadUsers() {
  loading.value = true
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('email')
  users.value = (data || []) as Profile[]
  loading.value = false
}

async function updateRole(userId: string, newRole: Profile['role']) {
  if (userId === auth.user?.id && newRole !== 'super_admin') {
    alert('No puedes cambiar tu propio rol de super admin.')
    return
  }
  updatingId.value = userId
  await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
  updatingId.value = null
  loadUsers()
}

onMounted(loadUsers)
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Permisos de usuarios</h2>
      <p class="text-slate-600 mt-1">
        Asigna roles a los usuarios. Solo Super Admin y Admin pueden gestionar permisos.
      </p>
    </div>

    <div v-if="loading" class="text-slate-500">Cargando...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow overflow-hidden">
        <thead class="bg-slate-100">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nombre</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Rol actual</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Cambiar rol</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in users"
            :key="u.id"
            class="border-t border-slate-200 hover:bg-slate-50"
          >
            <td class="px-4 py-3 text-slate-800">{{ u.email }}</td>
            <td class="px-4 py-3 text-slate-600">{{ u.full_name || '-' }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 rounded text-xs font-medium bg-slate-200">
                {{ roles.find(r => r.value === u.role)?.label || u.role }}
              </span>
            </td>
            <td class="px-4 py-3">
              <select
                :value="u.role"
                :disabled="u.id === auth.user?.id && u.role === 'super_admin'"
                @change="updateRole(u.id, ($event.target as HTMLSelectElement).value as Profile['role'])"
                class="px-3 py-1 border rounded text-sm"
              >
                <option v-for="r in roles" :key="r.value" :value="r.value">
                  {{ r.label }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

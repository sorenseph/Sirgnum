<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Profile } from '@/types/database'

const auth = useAuthStore()
const showCreateModal = ref(false)
const createEmail = ref('')
const createPassword = ref('')
const createName = ref('')
const createLoading = ref(false)
const createError = ref('')
const users = ref<Profile[]>([])
const loading = ref(true)
const filterRole = ref<string>('')
const updatingRoleId = ref<string | null>(null)

const roles = [
  { value: 'reader', label: 'Lector' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
] as const

async function loadUsers() {
  loading.value = true
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (filterRole.value) {
    query = query.eq('role', filterRole.value)
  }
  const { data } = await query
  users.value = (data || []) as Profile[]
  loading.value = false
}

async function updateRole(profile: Profile, newRole: Profile['role']) {
  if (profile.id === auth.user?.id && newRole !== 'super_admin') {
    alert('No puedes cambiar tu propio rol de super admin.')
    return
  }
  updatingRoleId.value = profile.id
  await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id)
  updatingRoleId.value = null
  loadUsers()
}

async function toggleActive(profile: Profile) {
  await supabase
    .from('profiles')
    .update({ is_active: !profile.is_active })
    .eq('id', profile.id)
  loadUsers()
}

async function toggleCanRead(profile: Profile) {
  await supabase
    .from('profiles')
    .update({ can_read: !profile.can_read })
    .eq('id', profile.id)
  loadUsers()
}

async function createUser() {
  if (!createEmail.value.trim()) {
    createError.value = 'El correo es obligatorio.'
    return
  }
  createLoading.value = true
  createError.value = ''
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Sesión no válida')
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email: createEmail.value.trim(),
        password: createPassword.value || undefined,
        full_name: createName.value.trim() || undefined,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Error al crear usuario')
    showCreateModal.value = false
    createEmail.value = ''
    createPassword.value = ''
    createName.value = ''
    loadUsers()
    alert('Usuario creado. Revisa el correo si no agregaste contraseña.')
  } catch (e) {
    createError.value = (e as Error).message
  } finally {
    createLoading.value = false
  }
}

async function sendPasswordReset(profile: Profile) {
  if (!profile.email) {
    alert('El usuario no tiene email.')
    return
  }
  try {
    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/confirmacion`,
    })
    alert('Se envió un correo de recuperación de contraseña a ' + profile.email)
  } catch (e) {
    alert('Error al enviar: ' + (e as Error).message)
  }
}

function roleLabel(role: string) {
  return roles.find((r) => r.value === role)?.label || role
}

onMounted(loadUsers)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h2 class="text-2xl font-bold text-slate-800">Usuarios</h2>
      <div class="flex gap-2">
        <button
          v-if="auth.profile?.role === 'super_admin'"
          @click="showCreateModal = true; createError = ''"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          + Crear usuario
        </button>
        <select
          v-model="filterRole"
          @change="loadUsers"
          class="px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="">Todos los roles</option>
          <option value="reader">Lectores</option>
          <option value="editor">Editores</option>
          <option value="admin">Admins</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 class="font-semibold text-slate-800 mb-4">Crear usuario</h3>
        <p class="text-sm text-slate-500 mb-4">Solo Super Admin puede crear usuarios. Si dejas la contraseña vacía, se enviará un correo de invitación.</p>
        <div v-if="createError" class="mb-3 text-sm text-red-600">{{ createError }}</div>
        <div class="space-y-3">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Correo *</label>
            <input v-model="createEmail" type="email" class="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Nombre completo</label>
            <input v-model="createName" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Contraseña (opcional)</label>
            <input v-model="createPassword" type="password" class="w-full px-3 py-2 border rounded-lg" placeholder="Vacío = enviar invitación" />
          </div>
        </div>
        <div class="flex gap-2 mt-6">
          <button @click="createUser" :disabled="createLoading" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
            {{ createLoading ? 'Creando...' : 'Crear' }}
          </button>
          <button @click="showCreateModal = false" class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-slate-500">Cargando...</div>

    <div v-else class="overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow overflow-hidden">
        <thead class="bg-slate-100">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nombre</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Rol</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Cambiar rol</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Activo</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Puede leer</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-slate-700">Acciones</th>
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
                {{ roleLabel(u.role) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <select
                :value="u.role"
                :disabled="(u.id === auth.user?.id && u.role === 'super_admin') || updatingRoleId === u.id"
                @change="updateRole(u, ($event.target as HTMLSelectElement).value as Profile['role'])"
                class="px-2 py-1 border border-slate-300 rounded text-sm"
              >
                <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <button
                @click="toggleActive(u)"
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                ]"
              >
                {{ u.is_active ? 'Activo' : 'Inactivo' }}
              </button>
            </td>
            <td class="px-4 py-3">
              <button
                v-if="u.role === 'reader'"
                @click="toggleCanRead(u)"
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  u.can_read ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600',
                ]"
              >
                {{ u.can_read ? 'Sí' : 'No' }}
              </button>
              <span v-else class="text-slate-400">-</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-slate-500">
                  {{ u.subscription_expires_at ? `Exp: ${new Date(u.subscription_expires_at).toLocaleDateString()}` : '-' }}
                </span>
                <button
                  v-if="auth.profile?.role === 'super_admin' || auth.profile?.role === 'admin'"
                  @click="sendPasswordReset(u)"
                  class="text-xs text-emerald-600 hover:underline text-left"
                >
                  Enviar recuperar contraseña
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!loading && !users.length" class="text-slate-500 mt-4">No hay usuarios.</p>
  </div>
</template>

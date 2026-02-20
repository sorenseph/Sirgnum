<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(true)
const showChangePassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Las contraseñas no coinciden.'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Mínimo 6 caracteres.'
    return
  }
  try {
    await auth.updatePassword(newPassword.value)
    passwordSuccess.value = 'Contraseña actualizada.'
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => { showChangePassword.value = false; passwordSuccess.value = '' }, 2000)
  } catch (e: unknown) {
    passwordError.value = (e as { message?: string }).message || 'Error'
  }
}

const navItems = computed(() => {
  const items: { to: { name: string }; label: string; icon: string }[] = [
    { to: { name: 'admin-notes' }, label: 'Notas', icon: '📝' },
    { to: { name: 'admin-daily-reports' }, label: 'Reportes Diarios', icon: '📊' },
    { to: { name: 'admin-report-clients' }, label: 'Clientes Reporte', icon: '🏢' },
    { to: { name: 'admin-recommendations' }, label: 'Recomendaciones', icon: '📈' },
    { to: { name: 'admin-analysts' }, label: 'Analistas', icon: '👤' },
  ]
  if (auth.canManageUsers) {
    items.push({ to: { name: 'admin-users' }, label: 'Usuarios', icon: '👥' })
  }
  return items
})

async function handleLogout() {
  await auth.signOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex">
    <aside
      :class="[
        'bg-slate-800 text-white transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div class="p-4 flex items-center justify-between border-b border-slate-700">
        <RouterLink v-if="sidebarOpen" to="/admin" class="font-bold text-emerald-400">
          Signum Admin
        </RouterLink>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 rounded hover:bg-slate-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <nav class="flex-1 py-4 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.to.name"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
            route.name === item.to.name
              ? 'bg-emerald-600 text-white'
              : 'hover:bg-slate-700 text-slate-200',
          ]"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="p-4 border-t border-slate-700 space-y-2">
        <div v-if="sidebarOpen" class="text-sm text-slate-400 truncate">
          {{ auth.profile?.email }}
        </div>
        <div v-if="sidebarOpen" class="text-xs text-emerald-400">
          {{ auth.profile?.role }}
        </div>
        <button
          v-if="sidebarOpen"
          @click="showChangePassword = true"
          class="w-full py-1.5 px-3 rounded text-xs bg-slate-700 hover:bg-slate-600"
        >
          Cambiar contraseña
        </button>
        <button
          @click="handleLogout"
          class="w-full py-2 px-4 rounded-lg bg-slate-700 hover:bg-red-600 transition-colors text-sm"
        >
          Salir
        </button>
      </div>

      <!-- Modal Cambiar contraseña -->
      <div
        v-if="showChangePassword"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showChangePassword = false"
      >
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
          <h3 class="font-semibold text-slate-800 mb-4">Cambiar contraseña</h3>
          <div v-if="passwordError" class="mb-2 text-sm text-red-600">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="mb-2 text-sm text-emerald-600">{{ passwordSuccess }}</div>
          <input
            v-model="newPassword"
            type="password"
            placeholder="Nueva contraseña"
            class="w-full px-3 py-2 border rounded-lg mb-2"
          />
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmar"
            class="w-full px-3 py-2 border rounded-lg mb-4"
          />
          <div class="flex gap-2">
            <button
              @click="handleChangePassword"
              class="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Actualizar
            </button>
            <button
              @click="showChangePassword = false"
              class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </aside>
    <main class="flex-1 overflow-auto">
      <header class="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <h1 class="text-xl font-semibold text-slate-800">
          {{ (route.meta.title as string) || 'Panel de administración' }}
        </h1>
      </header>
      <div class="p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  // Esperar a que Supabase procese el hash (#access_token=...) si viene del link de confirmación
  await new Promise((r) => setTimeout(r, 800))
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    await auth.fetchProfile(session.user.id)
  }
  loading.value = false
})

function irInicio() {
  router.push('/')
}

function irAdmin() {
  router.push('/admin')
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
    <div v-if="loading" class="text-slate-500">Verificando...</div>
    <div
      v-else
      class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
    >
      <div
        class="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"
      >
        <svg
          class="w-8 h-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">
        Correo confirmado
      </h1>
      <p class="text-slate-600 mb-6">
        Tu cuenta está lista. Ya puedes usar la plataforma.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="irInicio"
          class="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
        >
          Ir al inicio
        </button>
        <button
          v-if="auth.canAccessAdmin"
          @click="irAdmin"
          class="px-6 py-2.5 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-medium"
        >
          Panel Admin
        </button>
      </div>
    </div>
  </main>
</template>

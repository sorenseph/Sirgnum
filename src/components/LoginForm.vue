<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoaderSpinner from '@/components/LoaderSpinner.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const fullName = ref('')
const isRegister = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')
const showForgotPassword = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    const timeoutMs = 45000
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('La conexión tardó demasiado. Comprueba tu red e inténtalo de nuevo.')), timeoutMs)
    )
    if (isRegister.value) {
      await Promise.race([
        auth.signUpWithEmail(email.value, password.value, fullName.value),
        timeoutPromise,
      ])
      success.value = 'Cuenta creada. Revisa tu correo para verificar.'
    } else {
      await Promise.race([
        auth.signInWithEmail(email.value, password.value),
        timeoutPromise,
      ])
      await nextTick()
      let redirect = (route.query.redirect as string) || '/admin'
      const reportMatch = redirect.match(/^\/reporte-diario\/?(.*)$/)
      if (reportMatch && !reportMatch[1]) {
        redirect = '/admin'
      }
      await router.push(redirect)
    }
  } catch (e: unknown) {
    const err = e as { message?: string }
    if (err.message?.includes('already registered') || err.message?.toLowerCase().includes('already')) {
      error.value = 'Este correo ya está registrado. Inicia sesión o usa otro correo.'
    } else {
      error.value = err.message || 'Error al iniciar sesión o registrar.'
    }
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  error.value = ''
  loading.value = true
  try {
    const result = await auth.signInWithGoogle()
    if (result?.url) window.location.href = result.url
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Error con Google'
  } finally {
    loading.value = false
  }
}

async function handleFacebookLogin() {
  error.value = ''
  loading.value = true
  try {
    const result = await auth.signInWithFacebook()
    if (result?.url) window.location.href = result.url
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Error con Facebook'
  } finally {
    loading.value = false
  }
}

async function handleForgotPassword() {
  error.value = ''
  success.value = ''
  if (!email.value) {
    error.value = 'Ingresa tu correo electrónico.'
    return
  }
  loading.value = true
  try {
    await auth.resetPasswordEmail(email.value)
    success.value = 'Revisa tu correo para el enlace de recuperación.'
    showForgotPassword.value = false
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message || 'Error al enviar el enlace'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
    <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
      {{ isRegister ? 'Crear una cuenta' : 'Iniciar Sesión' }}
    </h2>

    <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
      {{ error }}
    </div>
    <div v-if="success" class="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
      {{ success }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-if="isRegister">
        <label for="fullName" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Nombre completo
        </label>
        <input
          v-model="fullName"
          type="text"
          id="fullName"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Tu nombre"
        />
      </div>
      <div>
        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Correo electrónico
        </label>
        <input
          v-model="email"
          type="email"
          id="email"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="nombre@empresa.com"
          required
        />
      </div>
      <div>
        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Contraseña
        </label>
        <input
          v-model="password"
          type="password"
          id="password"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="••••••••"
          :required="!showForgotPassword"
        />
      </div>

      <div class="flex items-start" v-if="!isRegister && !showForgotPassword">
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="remember"
              type="checkbox"
              class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-emerald-300 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <label for="remember" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Recuérdame
          </label>
        </div>
        <button
          type="button"
          @click="showForgotPassword = true"
          class="ml-auto text-sm text-emerald-700 hover:underline dark:text-emerald-500"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div v-if="showForgotPassword" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
        <h4 class="font-medium text-gray-900 dark:text-white">Recuperar contraseña</h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <input
          v-model="email"
          type="email"
          placeholder="Tu correo electrónico"
          class="w-full px-3 py-2 border rounded-lg"
        />
        <div class="flex gap-2">
          <button
            type="button"
            @click="handleForgotPassword"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Enviar enlace
          </button>
          <button
            type="button"
            @click="showForgotPassword = false"
            class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>

      <button
        v-if="!showForgotPassword"
        type="submit"
        :disabled="loading"
        class="w-full flex items-center justify-center gap-2 text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LoaderSpinner v-if="loading" size="sm" :inline="true" />
        <span>{{ loading ? 'Conectando...' : (isRegister ? 'Registrarse' : 'Ingresar') }}</span>
      </button>

      <div class="relative my-4">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">O continúa con</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          @click="handleGoogleLogin"
          :disabled="loading"
          class="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-400 dark:hover:bg-gray-200 disabled:opacity-50 text-gray-800"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          @click="handleFacebookLogin"
          :disabled="loading"
          class="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-400 dark:hover:bg-gray-200 disabled:opacity-50 text-gray-800"
        >
          <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
          </svg>
          Facebook
        </button>
      </div>

      <div class="text-sm font-medium text-gray-500 dark:text-gray-300 text-center pt-2">
        {{ isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
        <button
          type="button"
          @click="isRegister = !isRegister; error = ''; success = ''"
          class="text-emerald-700 hover:underline dark:text-emerald-500 ml-1"
        >
          {{ isRegister ? 'Inicia sesión' : 'Regístrate' }}
        </button>
      </div>
    </form>
  </div>
</template>

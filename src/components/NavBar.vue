<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isLoginPage = computed(() => route.path === '/login')

async function logout() {
  await auth.signOut()
  router.push('/')
}
const isMenuOpen = ref(false)
const mercadosOpen = ref(false)
const mercadosOpenMobile = ref(false)
const canAccessAdmin = computed(() => auth.canAccessAdmin)

const mercadosLinks = [
  { to: { name: 'mercados' }, label: 'Mercados' },
  { to: { name: 'bolsa-hoy' }, label: 'La Bolsa Hoy' },
  { to: { name: 'industrias' }, label: 'Industrias y Empresas' },
  { to: { name: 'recomendaciones' }, label: 'Recomendaciones' },
  { to: { name: 'divisas' }, label: 'Divisas' },
]
</script>

<template>
  <nav class="no-print bg-white shadow-md fixed w-full z-[100] top-0 start-0 border-b border-gray-200">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <RouterLink to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <img src="@/assets/logo-signumresearch.svg" class="h-10" alt="Signum Research Logo" />
      </RouterLink>
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse items-center gap-2">
        <template v-if="auth.isAuthenticated && !isLoginPage">
          <span class="text-slate-700 font-medium text-sm hidden sm:inline">
            {{ auth.profile?.full_name || auth.user?.email?.split('@')[0] || 'Usuario' }}
          </span>
          <RouterLink
            v-if="canAccessAdmin"
            to="/admin"
            class="text-white bg-emerald-600 hover:bg-emerald-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Panel Admin
          </RouterLink>
          <button
            @click="logout"
            class="text-slate-600 hover:text-slate-800 font-medium text-sm px-3 py-2"
          >
            Salir
          </button>
        </template>
        <RouterLink
          v-else
          to="/login"
          class="text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors duration-300"
        >
          Iniciar Sesión
        </RouterLink>
        <button @click="isMenuOpen = !isMenuOpen" data-collapse-toggle="navbar-sticky" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" aria-controls="navbar-sticky" :aria-expanded="isMenuOpen">
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>
      </div>
      <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
        <ul class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-2 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
          <li>
            <RouterLink to="/" class="block py-2 px-3 text-white bg-emerald-700 rounded md:bg-transparent md:text-emerald-700 md:p-0" aria-current="page">Inicio</RouterLink>
          </li>
          <li class="relative" @mouseenter="mercadosOpen = true" @mouseleave="mercadosOpen = false">
            <button class="flex items-center py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-emerald-700 md:p-0 transition-colors">
              Mercados
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div v-show="mercadosOpen" class="absolute left-0 top-full mt-0 py-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
              <RouterLink v-for="l in mercadosLinks" :key="l.to.name" :to="l.to" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-700" @click="mercadosOpen = false">
                {{ l.label }}
              </RouterLink>
            </div>
          </li>
          <li>
            <RouterLink to="/servicios" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-emerald-700 md:p-0 transition-colors">Servicios</RouterLink>
          </li>
          <li class="relative group">
            <button class="flex items-center py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-emerald-700 md:p-0 transition-colors">
              Reportes
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="absolute left-0 top-full mt-0 py-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <RouterLink to="/reportes" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-700">Reportes Integrales</RouterLink>
              <RouterLink to="/reportes-diarios" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-700">Reportes Diarios</RouterLink>
            </div>
          </li>
          <li>
            <RouterLink to="/analistas" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-emerald-700 md:p-0 transition-colors">Nuestro equipo</RouterLink>
          </li>
          <li>
            <RouterLink to="/contacto" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-emerald-700 md:p-0 transition-colors">Contacto</RouterLink>
          </li>
        </ul>
      </div>
    
      <!-- Mobile Menu -->
      <div v-if="isMenuOpen" class="items-center justify-between w-full md:hidden md:w-auto md:order-1" id="navbar-mobile">
        <div v-if="auth.isAuthenticated" class="px-4 py-2 text-sm text-slate-600 border-b border-gray-100">
          {{ auth.profile?.full_name || auth.user?.email?.split('@')[0] || 'Usuario' }}
        </div>
        <ul class="flex flex-col p-4 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50">
          <li>
            <RouterLink to="/" class="block py-2 px-3 text-white bg-emerald-700 rounded" aria-current="page">Inicio</RouterLink>
          </li>
          <li>
            <button @click="mercadosOpenMobile = !mercadosOpenMobile" class="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100">
              Mercados
              <svg class="w-4 h-4" :class="mercadosOpenMobile ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div v-if="mercadosOpenMobile" class="pl-4 py-2 space-y-1">
              <RouterLink v-for="l in mercadosLinks" :key="l.to.name" :to="l.to" class="block py-1.5 text-sm text-gray-700 hover:text-emerald-700" @click="isMenuOpen = false; mercadosOpenMobile = false">
                {{ l.label }}
              </RouterLink>
            </div>
          </li>
          <li>
            <RouterLink to="/servicios" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Servicios</RouterLink>
          </li>
          <li>
            <RouterLink to="/reportes" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Reportes Integrales</RouterLink>
          </li>
          <li>
            <RouterLink to="/reportes-diarios" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Reportes Diarios</RouterLink>
          </li>
          <li>
            <RouterLink to="/analistas" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Nuestro equipo</RouterLink>
          </li>
          <li>
            <RouterLink to="/contacto" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100">Contacto</RouterLink>
          </li>
          <li v-if="auth.isAuthenticated && canAccessAdmin">
            <RouterLink to="/admin" class="block py-2 px-3 text-emerald-700 font-semibold rounded">Panel Admin</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

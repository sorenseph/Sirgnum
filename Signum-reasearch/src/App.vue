<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import ToastNotifications from './components/ToastNotifications.vue'
import LoaderSpinner from './components/LoaderSpinner.vue'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const auth = useAuthStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div
    v-if="auth.loading"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-sm"
  >
    <LoaderSpinner size="lg" label="Conectando..." />
  </div>
  <template v-else>
  <NavBar v-if="!isAdminRoute" />
  <div :class="{ 'pt-16': !isAdminRoute }" class="flex flex-col min-h-screen">
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer v-if="!isAdminRoute" />
  </div>
  <ToastNotifications />
  </template>
</template>

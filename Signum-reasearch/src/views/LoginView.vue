<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue';
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
          <div class="text-center">
              <h1 class="text-4xl font-extrabold text-emerald-900 tracking-tight">Signum Research</h1>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Accede a la plataforma líder de análisis financiero.
              </p>
          </div>
          <LoginForm />
      </div>
  </main>
</template>

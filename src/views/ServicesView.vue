<script setup lang="ts">
import ServicesSection from '../components/ServicesSection.vue';

// We can reuse the ServicesSection component but maybe wrap it with more content or a different header
</script>

<template>
  <div class="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div class="text-center py-12 bg-white dark:bg-gray-800 shadow-sm mb-8">
          <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Nuestros Servicios</h1>
          <p class="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Ofrecemos una gama completa de soluciones financieras y de análisis para potenciar tus decisiones de inversión.
          </p>
      </div>
      
      <!-- Reusing the Services Section Component for consistency, but in a dedicated page context -->
      <ServicesSection />

      <!-- Additional Detailed List or Features could go here -->
      <div class="max-w-screen-xl mx-auto px-4 py-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">¿Por qué elegir Signum Research?</h2>
          <div class="grid md:grid-cols-3 gap-8 text-center">
              <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2 dark:text-white">Independencia</h3>
                  <p class="text-gray-600 dark:text-gray-400">Análisis objetivo y sin conflictos de interés.</p>
              </div>
              <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                   <div class="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2 dark:text-white">Innovación</h3>
                  <p class="text-gray-600 dark:text-gray-400">Herramientas tecnológicas de vanguardia.</p>
              </div>
              <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                   <div class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <h3 class="text-xl font-semibold mb-2 dark:text-white">Experiencia</h3>
                  <p class="text-gray-600 dark:text-gray-400">Equipo de analistas con trayectoria probada.</p>
              </div>
          </div>
      </div>
  </div>
</template>

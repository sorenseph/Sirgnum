<script setup lang="ts">
import { RouterLink } from 'vue-router'

const socialLinks = [
  { href: 'https://www.linkedin.com/company/signum-research', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://twitter.com/signumresearch', label: 'Twitter/X', icon: 'twitter' },
  { href: 'https://www.facebook.com/signumresearch', label: 'Facebook', icon: 'facebook' },
]

const reportLinks = [
  { to: { name: 'reportes' }, label: 'Reportes Integrales' },
  { to: { name: 'reportes-diarios' }, label: 'Reportes Diarios' },
]

const marketLinks = [
  { to: { name: 'mercados' }, label: 'Mercados' },
  { to: { name: 'bolsa-hoy' }, label: 'La Bolsa Hoy' },
  { to: { name: 'recomendaciones' }, label: 'Recomendaciones' },
  { to: { name: 'divisas' }, label: 'Divisas' },
]
</script>

<template>
  <footer class="no-print bg-gray-900 text-gray-300">
    <div class="max-w-screen-xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="md:col-span-2">
          <RouterLink to="/" class="inline-block mb-4">
            <img src="@/assets/logo-white.svg" class="h-10 opacity-90" alt="Signum Research" />
          </RouterLink>
          <p class="text-sm max-w-md mb-4">
            Empresa independiente de análisis financiero y bursátil. Ofrecemos reportes de Equity, Fibras, 
            Económicos, Sectoriales, Valuación y servicios especializados.
          </p>
          <div class="flex gap-4">
            <a
              v-for="s in socialLinks"
              :key="s.icon"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
              :title="s.label"
            >
              <svg v-if="s.icon === 'linkedin'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <svg v-else-if="s.icon === 'twitter'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <svg v-else-if="s.icon === 'facebook'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Reportes</h4>
          <ul class="space-y-2">
            <li v-for="l in reportLinks" :key="l.to.name">
              <RouterLink :to="l.to" class="hover:text-emerald-400 transition-colors">{{ l.label }}</RouterLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-white mb-4">Mercados</h4>
          <ul class="space-y-2">
            <li v-for="l in marketLinks" :key="l.to.name">
              <RouterLink :to="l.to" class="hover:text-emerald-400 transition-colors">{{ l.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-sm text-gray-500">© {{ new Date().getFullYear() }} Signum Research</p>
        <div class="flex gap-6 text-sm">
          <a href="#" class="hover:text-emerald-400 transition-colors">Términos y condiciones</a>
          <a href="#" class="hover:text-emerald-400 transition-colors">Política de privacidad</a>
          <RouterLink to="/login" class="hover:text-emerald-400 transition-colors">Inicio de sesión</RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

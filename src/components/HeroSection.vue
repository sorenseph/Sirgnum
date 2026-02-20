<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="relative min-h-[700px] flex items-center overflow-hidden bg-gray-900">
    <!-- Animated Background -->
    <div class="absolute inset-0 z-0">
        <img 
            src="@/assets/Home-landing-bg-responsive.webp" 
            alt="Financial Background" 
            class="w-full h-full object-cover opacity-40"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-emerald-900/30"></div>
        <!-- Decorative blobs -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
        <div class="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse-slow delay-1000"></div>
    </div>

    <div class="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 relative z-10 w-full">
      <div class="mr-auto place-self-center lg:col-span-7 animate-fade-in-up">
        <div class="inline-flex items-center px-3 py-1 mb-6 text-sm font-semibold text-emerald-400 bg-emerald-900/50 rounded-full border border-emerald-500/30 backdrop-blur-sm">
            <span>Innovación Financiera</span>
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
        </div>
        <h1 class="max-w-2xl mb-6 text-5xl font-extrabold tracking-tight leading-none md:text-6xl xl:text-7xl text-white">
          El futuro del <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Análisis Bursátil</span>
        </h1>
        <p class="max-w-2xl mb-8 font-light text-gray-300 lg:mb-10 md:text-lg lg:text-xl leading-relaxed">
          Potenciamos tus decisiones de inversión con inteligencia de mercado de primer nivel, tecnología avanzada y expertise financiero incomparable.
        </p>
        <div class="flex flex-col space-y-4 sm:flex-row sm:justify-start sm:space-y-0 sm:space-x-4">
            <RouterLink :to="{ path: '/', hash: '#services' }" class="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-center text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-800 transition-all hover:scale-105 shadow-xl shadow-emerald-900/50">
            Explorar Servicios
            <svg class="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            </RouterLink>
            <RouterLink to="/contacto" class="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-center text-white border border-gray-600 rounded-lg hover:bg-white/10 focus:ring-4 focus:ring-gray-700 transition-all hover:scale-105 backdrop-blur-sm">
            Contactar Experto
            </RouterLink>
        </div>
        
        <div class="mt-8 pt-8 border-t border-gray-800 flex items-center space-x-6 text-gray-400 text-sm">
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Datos en tiempo real
            </div>
             <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Análisis experto
            </div>
        </div>
      </div>
      
      <!-- Animated Visual Element -->
      <div class="hidden lg:mt-0 lg:col-span-5 lg:flex justify-center items-center relative perspective-1000">
        <div class="relative w-full max-w-sm animate-float-slow">
            <!-- Glassmorphism Card -->
            <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-blue-500/30 rounded-2xl blur-xl transform rotate-6 scale-105 opacity-70"></div>
            <div class="relative bg-gray-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <!-- Header -->
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <div class="h-3 w-24 bg-gray-600 rounded mb-2"></div>
                        <div class="h-2 w-16 bg-gray-700 rounded"></div>
                    </div>
                    <div class="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </div>
                </div>
                
                <!-- Chart Area -->
                <div class="h-40 w-full mb-6 relative overflow-hidden rounded-lg bg-gray-900/50 border border-white/5">
                    <svg viewBox="0 0 100 40" class="w-full h-full" preserveAspectRatio="none">
                        <path d="M0,40 L0,30 C20,30 20,10 40,10 C60,10 60,25 80,25 C90,25 90,5 100,5 L100,40 Z" fill="url(#gradient-hero)" class="opacity-50" />
                        <path d="M0,30 C20,30 20,10 40,10 C60,10 60,25 80,25 C90,25 90,5 100,5" fill="none" stroke="#34D399" stroke-width="0.5" />
                        <defs>
                            <linearGradient id="gradient-hero" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stop-color="#34D399" stop-opacity="0.3"/>
                                <stop offset="100%" stop-color="#34D399" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <!-- Animated Dot -->
                    <div class="absolute top-[12.5%] right-0 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>
                </div>
                
                <!-- Stats -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/5 rounded-lg p-3">
                        <div class="text-xs text-gray-400 mb-1">Rendimiento</div>
                        <div class="text-lg font-bold text-white">+24.5%</div>
                    </div>
                    <div class="bg-white/5 rounded-lg p-3">
                        <div class="text-xs text-gray-400 mb-1">Volumen</div>
                        <div class="text-lg font-bold text-white">1.2M</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

@keyframes floatDelayed {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes pulseSlow {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(1.1); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-float-slow {
    animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
    animation: floatDelayed 5s ease-in-out infinite 2s;
}

.animate-pulse-slow {
    animation: pulseSlow 8s ease-in-out infinite;
}

.perspective-1000 {
    perspective: 1000px;
}
</style>

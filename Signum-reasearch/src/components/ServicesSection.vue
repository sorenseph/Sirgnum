<script setup lang="ts">
import equityImg from '@/assets/equity.jpg';
import fibrasImg from '@/assets/4.jpg';
import valuationImg from '@/assets/images/valuation-chart.jpg';
import marketImg from '@/assets/images/market-abstract.jpg';

const services = [
  {
    title: 'Reportes Equity',
    description: 'Análisis detallado de emisoras, precios objetivos y recomendaciones de inversión.',
    image: equityImg,
    link: '#',
    color: 'emerald'
  },
  {
    title: 'Valuación',
    description: 'Valuación de empresas, proyectos de inversión y derivados financieros.',
    image: valuationImg,
    link: '#',
    color: 'teal'
  },
  {
    title: 'Análisis Económico',
    description: 'Perspectivas macroeconómicas, tipos de cambio y política monetaria.',
    image: marketImg,
    link: '#',
    color: 'blue'
  },
  {
    title: 'Fibras',
    description: 'Cobertura especializada en Fideicomisos de Infraestructura y Bienes Raíces.',
    image: fibrasImg,
    link: '#',
    color: 'cyan'
  }
];
</script>

<template>
  <section id="services" class="bg-gray-50 dark:bg-gray-900 py-16 scroll-mt-[120px]">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
      <div class="max-w-screen-md mb-8 lg:mb-16 text-center mx-auto">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Servicios especializados</h2>
        <p class="text-gray-500 sm:text-xl dark:text-gray-400">Soluciones innovadoras que funcionan para tu organización. Desde análisis bursátil hasta consultoría financiera a la medida.</p>
      </div>
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:space-y-0">
        <div v-for="service in services" :key="service.title" class="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 dark:bg-gray-800 h-full flex flex-col">
            <!-- Image Header -->
            <div class="h-48 overflow-hidden relative">
                <div class="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/10 transition-colors z-10"></div>
                <img :src="service.image" :alt="service.title" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700">
            </div>
            
            <!-- Content -->
            <div class="p-6 flex-1 flex flex-col">
                <h3 class="mb-3 text-xl font-bold dark:text-white group-hover:text-emerald-600 transition-colors">{{ service.title }}</h3>
                <p class="mb-4 text-gray-500 dark:text-gray-400 text-sm flex-1">{{ service.description }}</p>
                <a :href="service.link" class="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors mt-auto">
                    Leer más
                    <svg class="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                </a>
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

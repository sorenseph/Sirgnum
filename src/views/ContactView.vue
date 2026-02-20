<script setup lang="ts">
import { ref } from 'vue';

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const submitted = ref(false);

const submitForm = () => {
    console.log('Form submitted:', form.value);
    submitted.value = true;
    setTimeout(() => {
        form.value = { name: '', email: '', subject: '', message: '' };
        submitted.value = false;
    }, 5000);
};
</script>

<template>
  <div class="pt-24 pb-16 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Contact Info -->
        <div class="animate-fade-in-up">
            <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Contáctanos</h1>
            <p class="mb-8 font-light text-gray-500 dark:text-gray-400 md:text-lg">
                ¿Tienes preguntas sobre nuestros reportes o servicios de valuación? Estamos aquí para ayudarte.
            </p>
            
            <div class="space-y-6">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                             <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Nuestras Oficinas</h3>
                        <p class="mt-1 text-gray-500 dark:text-gray-400">Av. Paseo de las Palmas 781, Lomas de Chapultepec, CDMX, México.</p>
                    </div>
                </div>

                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Correo Electrónico</h3>
                        <p class="mt-1 text-gray-500 dark:text-gray-400">contacto@signumresearch.com</p>
                        <p class="text-gray-500 dark:text-gray-400">analisis@signumresearch.com</p>
                    </div>
                </div>

                 <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Teléfono</h3>
                        <p class="mt-1 text-gray-500 dark:text-gray-400">+52 (55) 5555 5555</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Form -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 animate-fade-in-right">
             <form @submit.prevent="submitForm" class="space-y-6">
                 <div>
                     <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Nombre completo</label>
                     <input v-model="form.name" type="text" id="name" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500" placeholder="Juan Pérez" required>
                 </div>
                 <div>
                     <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Correo electrónico</label>
                     <input v-model="form.email" type="email" id="email" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500" placeholder="juan@ejemplo.com" required>
                 </div>
                 <div>
                     <label for="subject" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Asunto</label>
                     <input v-model="form.subject" type="text" id="subject" class="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500" placeholder="¿Cómo podemos ayudarte?" required>
                 </div>
                 <div class="sm:col-span-2">
                     <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Mensaje</label>
                     <textarea v-model="form.message" id="message" rows="6" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500" placeholder="Escribe tu mensaje aquí..."></textarea>
                 </div>
                 <button type="submit" class="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-emerald-700 sm:w-fit hover:bg-emerald-800 focus:ring-4 focus:outline-none focus:ring-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800 transition-colors w-full">Enviar mensaje</button>
                 
                 <div v-if="submitted" class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
                    <span class="font-medium">¡Mensaje enviado!</span> Nos pondremos en contacto contigo pronto.
                 </div>
             </form>
        </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
.animate-fade-in-right {
  animation: fadeInRight 0.8s ease-out 0.2s forwards;
  opacity: 0;
}
</style>

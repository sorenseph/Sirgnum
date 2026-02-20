<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { RouterLink } from 'vue-router'

interface Analyst {
  id: string
  display_name: string
  title: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  linkedin_url: string | null
}

const analysts = ref<Analyst[]>([])
const loading = ref(true)

async function load() {
  const { data } = await supabase
    .from('analysts')
    .select('id, display_name, title, bio, avatar_url, email, linkedin_url')
    .eq('is_active', true)
    .order('display_order')
  analysts.value = (data || []) as Analyst[]
  loading.value = false
}

onMounted(load)
</script>

<template>
  <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-screen-xl mx-auto px-4 py-8">
      <nav class="text-sm text-gray-500 mb-6">
        <RouterLink to="/" class="hover:text-emerald-600">Inicio</RouterLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 dark:text-gray-300">Nuestro equipo</span>
      </nav>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Nuestro equipo</h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Conoce a los analistas de Signum Research.
      </p>

      <div v-if="loading" class="text-center py-12 text-gray-500">Cargando...</div>
      <div v-else-if="!analysts.length" class="text-center py-12 text-gray-500">
        No hay analistas publicados.
      </div>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="a in analysts"
          :key="a.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div class="flex items-start gap-4">
            <img
              v-if="a.avatar_url"
              :src="a.avatar_url"
              :alt="a.display_name"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div v-else class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {{ a.display_name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="font-semibold text-gray-900 dark:text-white">{{ a.display_name }}</h2>
              <p v-if="a.title" class="text-sm text-emerald-600 dark:text-emerald-400">{{ a.title }}</p>
              <p v-if="a.bio" class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{{ a.bio }}</p>
              <div class="mt-2 flex gap-2">
                <a v-if="a.email" :href="`mailto:${a.email}`" class="text-xs text-emerald-600 hover:underline">Email</a>
                <a v-if="a.linkedin_url" :href="a.linkedin_url" target="_blank" rel="noopener" class="text-xs text-emerald-600 hover:underline">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

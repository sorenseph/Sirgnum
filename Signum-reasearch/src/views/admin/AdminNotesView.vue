<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import RichTextEditor from '@/components/admin/RichTextEditor.vue'
import type { Note } from '@/types/database'

const auth = useAuthStore()
const notes = ref<Note[]>([])
const loading = ref(true)
const showForm = ref(false)
const showPreview = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const saveError = ref('')

const editorRef = ref<InstanceType<typeof RichTextEditor> | null>(null)

const form = ref({
  title: '',
  content: '',
  header_image_url: '',
  category: 'equity' as Note['category'],
  is_published: false,
})

const categories = [
  { value: 'equity', label: 'Equity' },
  { value: 'valuacion', label: 'Valuación' },
  { value: 'fibras', label: 'Fibras' },
  { value: 'economicos', label: 'Económicos' },
  { value: 'sectoriales', label: 'Sectoriales' },
  { value: 'especiales', label: 'Especiales' },
  { value: 'nota_tecnica', label: 'Nota Técnica' },
]

const FETCH_TIMEOUT = 15000

async function loadNotes() {
  loading.value = true
  try {
    const res = await Promise.race([
      supabase.from('notes').select('*').order('created_at', { ascending: false }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), FETCH_TIMEOUT)
      ),
    ])
    const { data, error } = res as { data: Note[]; error: unknown }
    if (!error) notes.value = (data || []) as Note[]
  } catch (_) {
    notes.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  saveError.value = ''
  form.value = {
    title: '',
    content: '',
    header_image_url: '',
    category: 'equity',
    is_published: false,
  }
  showForm.value = true
  showPreview.value = false
}

function openEdit(note: Note) {
  editingId.value = note.id
  saveError.value = ''
  form.value = {
    title: note.title,
    content: note.content,
    header_image_url: note.header_image_url || '',
    category: note.category,
    is_published: note.is_published,
  }
  showForm.value = true
  showPreview.value = false
}

async function saveNote(publish = false) {
  saveError.value = ''
  saving.value = true
  const content = showPreview.value
    ? form.value.content
    : (editorRef.value?.getHTML?.() ?? form.value.content)
  const payload = {
    title: form.value.title,
    content: content || '<p></p>',
    header_image_url: form.value.header_image_url || null,
    category: form.value.category,
    is_published: publish || form.value.is_published,
    author_id: auth.user?.id,
  }
  try {
    if (editingId.value) {
      const { error } = await supabase
        .from('notes')
        .update(payload)
        .eq('id', editingId.value)
      if (error) throw error
    } else {
      const { error } = await supabase.from('notes').insert(payload)
      if (error) throw error
    }
    showForm.value = false
    showPreview.value = false
    loadNotes()
  } catch (e: unknown) {
    saveError.value = (e as { message?: string }).message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

function goPreview() {
  form.value.content = editorRef.value?.getHTML?.() ?? form.value.content
  showPreview.value = true
}

function backFromPreview() {
  showPreview.value = false
}

async function publishFromPreview() {
  await saveNote(true)
}

async function deleteNote(id: string) {
  if (!confirm('¿Eliminar esta nota?')) return
  await supabase.from('notes').delete().eq('id', id)
  loadNotes()
}

onMounted(loadNotes)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">Notas</h2>
      <button
        @click="openCreate"
        class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
      >
        Nueva nota
      </button>
    </div>

    <div v-if="loading" class="text-slate-500">Cargando...</div>

    <!-- Vista previa -->
    <div v-else-if="showForm && showPreview" class="bg-white rounded-xl shadow p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">Vista previa</h3>
      <article class="prose prose-slate max-w-none">
        <h1 class="text-2xl font-bold mb-4">{{ form.title }}</h1>
        <p class="text-sm text-slate-500 mb-4">
          {{ categories.find((c) => c.value === form.category)?.label }} |
          {{ form.is_published ? 'Publicado' : 'Borrador' }}
        </p>
        <img
          v-if="form.header_image_url"
          :src="form.header_image_url"
          :alt="form.title"
          class="w-full h-48 object-cover rounded-lg mb-6"
        />
        <div class="prose-p:my-2" v-html="form.content" />
      </article>
      <div class="flex flex-wrap gap-3 mt-6 pt-6 border-t">
        <button
          @click="backFromPreview"
          class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
        >
          ← Regresar a editar
        </button>
        <button
          @click="() => saveNote(false)"
          :disabled="saving"
          class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Guardar borrador' }}
        </button>
        <button
          @click="publishFromPreview"
          :disabled="saving"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {{ saving ? 'Guardando...' : 'Publicar' }}
        </button>
      </div>
    </div>

    <!-- Formulario de edición -->
    <div v-else-if="showForm" class="bg-white rounded-xl shadow p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Editar' : 'Nueva' }} nota</h3>
      <form @submit.prevent="() => saveNote(false)" class="space-y-4">
        <div v-if="saveError" class="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ saveError }}
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            v-model="form.title"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            v-model="form.category"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option v-for="c in categories" :key="c.value" :value="c.value">
              {{ c.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">URL imagen encabezado</label>
          <input
            v-model="form.header_image_url"
            type="url"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            placeholder="https://..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Contenido</label>
          <RichTextEditor
            ref="editorRef"
            v-model="form.content"
            placeholder="Escribe el contenido de la nota..."
          />
        </div>
        <div class="flex items-center gap-2">
          <input
            v-model="form.is_published"
            type="checkbox"
            id="published"
          />
          <label for="published">Publicar ahora</label>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
          <button
            type="button"
            @click="goPreview"
            class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
          >
            Vista previa
          </button>
          <button
            type="button"
            @click="showForm = false"
            class="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <div class="space-y-4">
      <div
        v-for="note in notes"
        :key="note.id"
        class="bg-white rounded-xl shadow p-4 flex justify-between items-start"
      >
        <div>
          <h4 class="font-semibold text-slate-800">{{ note.title }}</h4>
          <span class="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600">
            {{ categories.find((c) => c.value === note.category)?.label || note.category }}
          </span>
          <p class="text-sm text-slate-500 mt-1">
            {{ note.is_published ? 'Publicado' : 'Borrador' }}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            @click="openEdit(note)"
            class="px-3 py-1 text-sm bg-slate-200 rounded hover:bg-slate-300"
          >
            Editar
          </button>
          <button
            @click="deleteNote(note.id)"
            class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Eliminar
          </button>
        </div>
      </div>
      <p v-if="!loading && !notes.length" class="text-slate-500">No hay notas.</p>
    </div>
  </div>
</template>

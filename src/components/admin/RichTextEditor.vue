<script setup lang="ts">
import { watch, onBeforeUnmount, ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      // Asegurar que listas se preserven al pegar HTML
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    Underline,
    TextStyle,
    Color,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Image.configure({ inline: false, allowBase64: true }),
    Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener' } }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Escribe el contenido de la nota...',
    }),
  ],
  editorProps: {
    attributes: {
      class:
        'prose prose-slate max-w-none min-h-[240px] px-4 py-3 focus:outline-none',
    },
    handlePaste: (view, event) => {
      const text = event.clipboardData?.getData('text/plain')
      const html = event.clipboardData?.getData('text/html')
      if (text && /^[\s]*[\-\*•]\s+/m.test(text) && !html?.includes('<ul')) {
        const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
        const items = lines.map((l) => l.replace(/^[\s\-\*•]+\s*/, '').trim()).filter(Boolean)
        if (items.length > 0) {
          const listHtml = '<ul>' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul>'
          const ed = editor.value
          if (ed) {
            ed.chain().focus().insertContent(listHtml).run()
            return true
          }
        }
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

const showImageModal = ref(false)
const imageUrl = ref('')
const colorPicker = ref('#000000')

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && val !== editor.value.getHTML()) {
      editor.value.commands.setContent(val, { emitUpdate: false })
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setBold() {
  editor.value?.chain().focus().toggleBold().run()
}
function setItalic() {
  editor.value?.chain().focus().toggleItalic().run()
}
function setUnderline() {
  editor.value?.chain().focus().toggleUnderline().run()
}
function setStrike() {
  editor.value?.chain().focus().toggleStrike().run()
}
function setAlign(align: 'left' | 'center' | 'right' | 'justify') {
  editor.value?.chain().focus().setTextAlign(align).run()
}
function setColor() {
  editor.value?.chain().focus().setColor(colorPicker.value).run()
}
function addImage() {
  if (imageUrl.value) {
    editor.value?.chain().focus().setImage({ src: imageUrl.value }).run()
    imageUrl.value = ''
    showImageModal.value = false
  }
}
function setUnsetLink() {
  if (editor.value?.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
    return
  }
  const url = prompt('URL del enlace (selecciona texto antes si quieres enlazarlo):')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

defineExpose({
  getHTML: () => editor.value?.getHTML() ?? '',
})
</script>

<template>
  <div class="border border-slate-300 rounded-lg overflow-hidden bg-white">
    <!-- Toolbar -->
    <div
      class="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50"
    >
      <!-- Formato texto -->
      <button type="button" @click="setBold" class="p-2 rounded hover:bg-slate-200 font-bold" title="Negrita">B</button>
      <button type="button" @click="setItalic" class="p-2 rounded hover:bg-slate-200 italic" title="Cursiva">I</button>
      <button type="button" @click="setUnderline" class="p-2 rounded hover:bg-slate-200 underline" title="Subrayado">U</button>
      <button type="button" @click="setStrike" class="p-2 rounded hover:bg-slate-200 line-through" title="Tachado">S</button>

      <!-- Color -->
      <div class="flex items-center gap-1">
        <input v-model="colorPicker" type="color" class="w-8 h-8 rounded cursor-pointer border border-slate-300" title="Color de texto" />
        <button type="button" @click="setColor" class="p-1.5 rounded hover:bg-slate-200 text-sm" title="Aplicar color">A</button>
      </div>

      <span class="w-px h-6 bg-slate-300 mx-1" />

      <!-- Títulos -->
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" class="p-2 rounded hover:bg-slate-200 text-sm font-bold" title="Título 1">H1</button>
      <button type="button" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" class="p-2 rounded hover:bg-slate-200 text-sm font-bold" title="Título 2">H2</button>
      <button type="button" @click="editor?.chain().focus().setParagraph().run()" class="p-2 rounded hover:bg-slate-200 text-sm" title="Párrafo">P</button>

      <span class="w-px h-6 bg-slate-300 mx-1" />

      <!-- Alineación -->
      <button type="button" @click="setAlign('left')" class="p-2 rounded hover:bg-slate-200 text-sm" title="Alinear izquierda">⬅</button>
      <button type="button" @click="setAlign('center')" class="p-2 rounded hover:bg-slate-200 text-sm" title="Centrar">↔</button>
      <button type="button" @click="setAlign('right')" class="p-2 rounded hover:bg-slate-200 text-sm" title="Alinear derecha">➡</button>
      <button type="button" @click="setAlign('justify')" class="p-2 rounded hover:bg-slate-200 text-sm" title="Justificar">▣</button>

      <span class="w-px h-6 bg-slate-300 mx-1" />

      <!-- Listas -->
      <button type="button" @click="editor?.chain().focus().toggleBulletList().run()" class="p-2 rounded hover:bg-slate-200" title="Viñetas">•</button>
      <button type="button" @click="editor?.chain().focus().toggleOrderedList().run()" class="p-2 rounded hover:bg-slate-200" title="Numeración">1.</button>
      <button type="button" @click="editor?.chain().focus().toggleBlockquote().run()" class="p-2 rounded hover:bg-slate-200" title="Cita">"</button>

      <span class="w-px h-6 bg-slate-300 mx-1" />

      <!-- Enlace e imagen -->
      <button type="button" @click="setUnsetLink" class="p-2 rounded hover:bg-slate-200" title="Insertar enlace (selecciona texto)">🔗</button>
      <button type="button" @click="showImageModal = true" class="p-2 rounded hover:bg-slate-200" title="Insertar imagen">🖼</button>
    </div>

    <div class="tiptap">
      <EditorContent :editor="editor" />
    </div>

    <!-- Modal imagen -->
    <div v-if="showImageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showImageModal = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h4 class="font-semibold mb-4">Insertar imagen</h4>
        <input v-model="imageUrl" type="url" placeholder="https://..." class="w-full px-3 py-2 border rounded-lg mb-4" @keyup.enter="addImage" />
        <div class="flex gap-2">
          <button @click="addImage" class="px-4 py-2 bg-emerald-600 text-white rounded-lg">Insertar</button>
          <button @click="showImageModal = false; imageUrl = ''" class="px-4 py-2 bg-slate-200 rounded-lg">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
.tiptap p.is-editor-empty:first-child::before {
  color: #94a3b8;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.tiptap h1 { font-size: 1.75rem; font-weight: 700; }
.tiptap h2 { font-size: 1.5rem; font-weight: 600; }
.tiptap img { max-width: 100%; height: auto; }
.tiptap p[style*="text-align: center"] { text-align: center; }
.tiptap p[style*="text-align: right"] { text-align: right; }
.tiptap p[style*="text-align: justify"] { text-align: justify; }
</style>

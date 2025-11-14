<template>
  <!-- Overlay (backdrop escurecido) -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
        @click="handleClose"
      ></div>
    </Transition>

    <!-- Modal -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
        @click.self="handleClose"
      >
        <div
          class="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden"
          @click.stop
        >
          <!-- Header com Toolbar Integrada -->
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
            <!-- Esquerda: Ícone + Título + Status -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <svg class="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>

              <div class="flex-1 min-w-0">
                <!-- Matéria (primary) -->
                <div class="text-xs font-medium text-primary-600 dark:text-primary-400 truncate">
                  {{ localNotebook.subject?.name || 'Sem matéria' }}
                </div>
                <!-- Capítulo (editável) -->
                <input
                  v-if="editingTitle"
                  v-model="localNotebook.name"
                  @blur="saveTitle"
                  @keyup.enter="saveTitle"
                  @keyup.esc="cancelEditTitle"
                  class="text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-b border-primary-500 focus:outline-none w-full"
                  autofocus
                />
                <h2
                  v-else
                  @dblclick="startEditTitle"
                  class="text-sm font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  :title="localNotebook.name + ' (duplo clique para editar)'"
                >
                  {{ localNotebook.name }}
                </h2>
              </div>

              <!-- Status de Salvamento -->
              <div v-if="saveStatus !== 'idle'" class="flex items-center flex-shrink-0">
                <svg v-if="saveStatus === 'typing'" class="w-3.5 h-3.5 animate-pulse text-gray-400" fill="currentColor" viewBox="0 0 20 20" title="Editando...">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"/>
                </svg>
                <svg v-if="saveStatus === 'saving'" class="w-3.5 h-3.5 animate-spin text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Salvando...">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <svg v-if="saveStatus === 'saved'" class="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20" title="Salvo">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <svg v-if="saveStatus === 'error'" class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20" title="Erro ao salvar">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <!-- Direita: Toolbar + Fechar -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Buscar -->
              <button
                @click="openSearch"
                class="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                title="Buscar (Ctrl+F)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>

              <!-- PDF -->
              <button
                @click="exportPDF"
                class="p-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                title="Exportar PDF"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd"/>
                </svg>
              </button>

              <!-- Separador -->
              <div class="h-5 w-px bg-gray-300 dark:bg-dark-600"></div>

              <!-- Fechar -->
              <button
                @click="handleClose"
                class="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
                title="Fechar (Esc)"
              >
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Content Area MAXIMIZADA -->
          <div class="flex-1 overflow-y-auto px-4 py-3">
            <RichContentEditor
              v-if="localNotebook.id"
              :content="editorContent"
              @update="handleContentUpdate"
              @force-save="forceSave"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface Notebook {
  id: string
  name: string
  subject_id: string | null
  subject?: {
    name: string
    color: string
  }
  content?: string
  created_at?: string
  updated_at?: string
}

interface Props {
  show: boolean
  notebook: Notebook | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [notebook: Notebook]
  update: [notebook: Notebook]
  openSearch: []
}>()

// Local state
const localNotebook = ref<Notebook>({ ...props.notebook } as Notebook)
const editorContent = ref('')
const editingTitle = ref(false)
const originalTitle = ref('')
const saveStatus = ref<'idle' | 'typing' | 'saving' | 'saved' | 'error'>('idle')
let saveStatusTimeout: NodeJS.Timeout | null = null

// Watchers
watch(() => props.notebook, (newNotebook) => {
  if (newNotebook) {
    localNotebook.value = { ...newNotebook }
    editorContent.value = newNotebook.content || ''
  }
}, { immediate: true, deep: true })

// Title editing
const startEditTitle = () => {
  originalTitle.value = localNotebook.value.name
  editingTitle.value = true
}

const saveTitle = async () => {
  editingTitle.value = false
  if (localNotebook.value.name !== originalTitle.value) {
    await saveNotebook()
  }
}

const cancelEditTitle = () => {
  localNotebook.value.name = originalTitle.value
  editingTitle.value = false
}

// Search functionality - Abre busca externa
const openSearch = () => {
  emit('openSearch')
}

// Content handling com auto-save
const handleContentUpdate = (content: string) => {
  editorContent.value = content
  saveStatus.value = 'typing'

  // Limpar timeout anterior
  if (saveStatusTimeout) {
    clearTimeout(saveStatusTimeout)
  }

  debouncedSave()
}

// Save functionality
const debouncedSave = useDebounceFn(async () => {
  await saveNotebook()
}, 2000)

const saveNotebook = async () => {
  try {
    saveStatus.value = 'saving'

    const updatedNotebook = {
      ...localNotebook.value,
      content: editorContent.value,
      updated_at: new Date().toISOString()
    }

    emit('update', updatedNotebook)
    emit('save', updatedNotebook)

    saveStatus.value = 'saved'

    // Limpar timeout anterior se existir
    if (saveStatusTimeout) {
      clearTimeout(saveStatusTimeout)
    }

    // Auto-reset para idle após 2 segundos
    saveStatusTimeout = setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
      }
    }, 2000)
  } catch (error) {
    console.error('Erro ao salvar caderno:', error)
    saveStatus.value = 'error'
    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
}

const forceSave = async () => {
  if (debouncedSave.cancel) {
    debouncedSave.cancel()
  }
  await saveNotebook()
}

// PDF Export
const exportPDF = async () => {
  try {
    const element = document.querySelector('.ql-editor') as HTMLElement
    if (!element) {
      console.error('Editor não encontrado')
      return
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= 297

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297
    }

    pdf.save(`${localNotebook.value.name}.pdf`)
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
  }
}

// Close modal com auto-save
const handleClose = async () => {
  // Se estiver editando ou salvando, aguarda salvar antes de fechar
  if (saveStatus.value === 'typing' || saveStatus.value === 'saving') {
    if (debouncedSave.cancel) {
      debouncedSave.cancel()
    }
    await saveNotebook()
  }
  emit('close')
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  // ESC to close
  if (e.key === 'Escape' && props.show) {
    handleClose()
  }

  // Ctrl+F to search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f' && props.show) {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-dark-900;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-dark-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-dark-500;
}
</style>

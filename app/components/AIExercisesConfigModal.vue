<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-dark-700">
          <!-- Header -->
          <div class="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">Gerar Exercícios com IA</h2>
                <p class="text-sm text-gray-400">Configure os exercícios para gerar</p>
              </div>
            </div>
            <button
              @click="close"
              class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Configuration -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-900">
            <!-- Subject Selection -->
            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Selecione uma Matéria <span class="text-red-400">*</span>
              </label>
              <select
                v-model="selectedSubjectId"
                class="w-full px-4 py-3 bg-dark-800 border border-dark-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @change="onSubjectChange"
              >
                <option value="">Escolha uma matéria...</option>
                <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
              <p v-if="loadingSubjects" class="text-xs text-gray-400 mt-1">Carregando matérias...</p>
            </div>

            <!-- Chapter Selection (only if subject selected) -->
            <div v-if="selectedSubjectId">
              <label class="block text-sm font-semibold text-white mb-2">
                Capítulo <span class="text-red-400">*</span>
              </label>
              <select
                v-model="selectedSectionId"
                class="w-full px-4 py-3 bg-dark-800 border border-dark-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :disabled="sections.length === 0"
              >
                <option value="">Escolha um capítulo...</option>
                <option value="all">📚 Todos os capítulos</option>
                <option v-for="section in sections" :key="section.id" :value="section.id">
                  {{ section.title }}
                </option>
              </select>
              <p v-if="loadingSections" class="text-xs text-gray-400 mt-1">Carregando capítulos...</p>
              <div v-else-if="sections.length === 0 && !loadingSections" class="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p class="text-xs text-yellow-400 flex items-start gap-2">
                  <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span>
                    <strong>Nenhum capítulo encontrado</strong><br/>
                    Adicione capítulos/seções ao caderno em <NuxtLink to="/notebook" class="underline hover:text-yellow-300">/notebook</NuxtLink> antes de gerar exercícios.
                  </span>
                </p>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-sm font-semibold text-white mb-2">Quantidade de questões</label>
              <div class="flex items-center space-x-4">
                <input
                  v-model.number="config.quantity"
                  type="range"
                  min="1"
                  max="20"
                  class="flex-1 h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer"
                />
                <span class="text-2xl font-bold text-primary-400 w-12 text-center">{{ config.quantity }}</span>
              </div>
            </div>

            <!-- Difficulty -->
            <div>
              <label class="block text-sm font-semibold text-white mb-3">Nível de dificuldade</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="level in difficultyLevels"
                  :key="level.value"
                  @click="config.difficulty = level.value"
                  class="px-4 py-3 rounded-lg border-2 transition-all"
                  :class="config.difficulty === level.value
                    ? 'border-primary-500 bg-primary-500/10 shadow-md'
                    : 'border-dark-600 hover:border-primary-500'"
                >
                  <div class="text-sm font-semibold text-white">{{ level.label }}</div>
                </button>
              </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
              <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="text-center py-4">
              <div class="flex items-center justify-center space-x-2 text-gray-400">
                <svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm">Carregando conteúdo...</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-dark-700 bg-dark-800 px-6 py-4 flex justify-end space-x-3">
            <button
              @click="close"
              class="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="generate"
              :disabled="!canGenerate || loading"
              class="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Gerar Exercícios</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  generate: [config: {
    subjectId: string
    subjectName: string
    content: string
    quantity: number
    difficulty: string
  }]
}>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const subjects = ref<any[]>([])
const sections = ref<any[]>([])

const selectedSubjectId = ref('')
const selectedSectionId = ref('')

const config = ref({
  quantity: 5,
  difficulty: 'medium' as 'easy' | 'medium' | 'hard'
})

const difficultyLevels = [
  { value: 'easy' as const, label: 'Fácil' },
  { value: 'medium' as const, label: 'Médio' },
  { value: 'hard' as const, label: 'Difícil' }
]

const loading = ref(false)
const loadingSubjects = ref(false)
const loadingSections = ref(false)
const error = ref('')

const canGenerate = computed(() => {
  // REQUIRED: Subject AND Chapter
  return selectedSubjectId.value !== '' &&
         selectedSectionId.value !== ''
})

// Load subjects on mount
const loadSubjects = async () => {
  loadingSubjects.value = true
  error.value = ''

  console.log('[AIExercisesConfigModal] ===== INÍCIO: loadSubjects =====')
  console.log('[AIExercisesConfigModal] user.value:', user.value?.id || 'undefined')

  try {
    // ✅ CORREÇÃO: Buscar user_id da sessão ao invés de user.value
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    console.log('[AIExercisesConfigModal] Session:', session?.user?.id || 'undefined')

    if (sessionError || !session?.user?.id) {
      console.error('[AIExercisesConfigModal] Sessão não encontrada:', sessionError)
      error.value = 'Erro: Usuário não autenticado. Por favor, faça login novamente.'
      loadingSubjects.value = false
      return
    }

    const userId = session.user.id
    console.log('[AIExercisesConfigModal] ✅ user_id da sessão:', userId)
    console.log('[AIExercisesConfigModal] Buscando matérias...')

    const { data, error: err } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (err) {
      console.error('[AIExercisesConfigModal] ❌ Erro ao carregar matérias:', err)
      error.value = 'Erro ao carregar matérias: ' + err.message
    } else {
      console.log('[AIExercisesConfigModal] ✅ Matérias carregadas:', data?.length || 0)
      console.log('[AIExercisesConfigModal] Matérias:', data)
      subjects.value = data || []

      if (data && data.length === 0) {
        error.value = 'Nenhuma matéria cadastrada. Cadastre matérias em "Matérias" antes de gerar exercícios.'
      }
    }
  } catch (err: any) {
    console.error('[AIExercisesConfigModal] ❌ Exception loading subjects:', err)
    error.value = 'Erro ao carregar matérias: ' + (err.message || 'Erro desconhecido')
  } finally {
    loadingSubjects.value = false
    console.log('[AIExercisesConfigModal] ===== FIM: loadSubjects =====')
  }
}

// Load chapters when subject changes
const onSubjectChange = async () => {
  selectedSectionId.value = ''
  sections.value = []

  if (!selectedSubjectId.value) return

  loadingSections.value = true
  console.log('[AIExercisesConfigModal] ===== Loading chapters for subject:', selectedSubjectId.value, '=====')

  try {
    // ✅ CORREÇÃO: Buscar capítulos DIRETAMENTE da tabela 'chapters' usando subject_id
    const { data, error: err } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', selectedSubjectId.value)
      .order('order_index')

    if (err) {
      console.error('[AIExercisesConfigModal] ❌ Error loading chapters:', err)
      error.value = 'Erro ao carregar capítulos: ' + err.message
    } else {
      console.log('[AIExercisesConfigModal] ✅ Chapters loaded:', data?.length || 0)
      console.log('[AIExercisesConfigModal] Chapters data:', data)
      sections.value = data || []

      if (!data || data.length === 0) {
        console.warn('[AIExercisesConfigModal] ⚠️ No chapters found for this subject')
        error.value = ''
      }
    }
  } catch (err: any) {
    console.error('[AIExercisesConfigModal] ❌ Exception loading chapters:', err)
    error.value = 'Erro ao carregar capítulos'
  } finally {
    loadingSections.value = false
    console.log('[AIExercisesConfigModal] ===== Finished loading chapters =====')
  }
}

// Generate exercises
const generate = async () => {
  error.value = ''

  if (!canGenerate.value) {
    error.value = 'Por favor, selecione uma matéria e capítulo'
    return
  }

  loading.value = true

  try {
    // Get subject name
    const subject = subjects.value.find(s => s.id === selectedSubjectId.value)
    if (!subject) throw new Error('Matéria não encontrada')

    console.log('[AIExercisesConfigModal] Coletando conteúdo...')
    console.log('[AIExercisesConfigModal] Subject:', subject.name)
    console.log('[AIExercisesConfigModal] Section/Chapter ID:', selectedSectionId.value)

    // Collect content from pages based on selection
    let content = ''
    let chapterInfo = ''
    let sectionIdsToQuery: string[] = []

    if (selectedSectionId.value === 'all') {
      // ALL CHAPTERS selected - get all chapters from this subject
      console.log('[AIExercisesConfigModal] Modo: TODOS OS CAPÍTULOS')

      // Get all chapters from the chapters table
      const { data: allChapters } = await supabase
        .from('chapters')
        .select('id, title')
        .eq('subject_id', selectedSubjectId.value)
        .order('order_index')

      if (allChapters && allChapters.length > 0) {
        sectionIdsToQuery = allChapters.map(c => c.id)
        chapterInfo = `Todos os capítulos: ${allChapters.map(c => c.title).join(', ')}`
        console.log('[AIExercisesConfigModal] Capítulos encontrados:', allChapters.length)
      }
    } else if (selectedSectionId.value) {
      // SPECIFIC CHAPTER selected
      const selectedSection = sections.value.find(s => s.id === selectedSectionId.value)
      console.log('[AIExercisesConfigModal] Modo: CAPÍTULO ESPECÍFICO -', selectedSection?.title)

      sectionIdsToQuery = [selectedSectionId.value]
      chapterInfo = `Capítulo: ${selectedSection?.title || 'Selecionado'}`
    }

    // Get content from selected chapters
    if (sectionIdsToQuery.length > 0) {
      console.log('[AIExercisesConfigModal] Buscando conteúdo de', sectionIdsToQuery.length, 'capítulo(s)...')

      // Buscar notas capturadas dos capítulos (captured_notes)
      const { data: capturedNotes } = await supabase
        .from('captured_notes')
        .select('content, user_notes, metadata')
        .in('chapter_id', sectionIdsToQuery)
        .order('created_at')

      console.log('[AIExercisesConfigModal] Notas capturadas encontradas:', capturedNotes?.length || 0)

      // Buscar também páginas de notebooks relacionados (fallback)
      const { data: notebooks } = await supabase
        .from('notebooks')
        .select('id')
        .eq('subject_id', selectedSubjectId.value)

      let notebookPages: any[] = []
      if (notebooks && notebooks.length > 0) {
        const notebookIds = notebooks.map(n => n.id)

        const { data: sections } = await supabase
          .from('notebook_sections')
          .select('id')
          .in('notebook_id', notebookIds)

        if (sections && sections.length > 0) {
          const sectionIds = sections.map(s => s.id)

          const { data: pages } = await supabase
            .from('notebook_pages')
            .select('title, content')
            .in('section_id', sectionIds)
            .order('order_index')

          notebookPages = pages || []
          console.log('[AIExercisesConfigModal] Páginas de notebook encontradas:', notebookPages.length)
        }
      }

      // Build content
      let contentParts: string[] = []

      // Add chapter titles as context
      contentParts.push(`# Contexto: ${chapterInfo}\n\n`)

      // Add captured notes content
      if (capturedNotes && capturedNotes.length > 0) {
        contentParts.push('## Notas Capturadas:\n\n')
        capturedNotes.forEach((note, i) => {
          const contentJson = typeof note.content === 'string' ? JSON.parse(note.content) : note.content
          const questionText = contentJson.question_text || contentJson.raw_html || ''
          const userNotes = note.user_notes || ''

          if (questionText || userNotes) {
            contentParts.push(`### Nota ${i + 1}\n${questionText}\n${userNotes}\n\n`)
          }
        })
      }

      // Add notebook pages content
      if (notebookPages.length > 0) {
        contentParts.push('## Conteúdo do Caderno:\n\n')
        notebookPages.forEach(p => {
          const title = p.title ? `### ${p.title}\n\n` : ''
          contentParts.push(title + (p.content || '') + '\n\n---\n\n')
        })
      }

      content = contentParts.join('')
    }

    // Get existing questions/exercises from subject to use as context
    console.log('[AIExercisesConfigModal] Buscando questões existentes da matéria...')
    const { data: existingQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('question_text, option_a, option_b, option_c, option_d, option_e, correct_answer, explanation, difficulty')
      .eq('subject_id', selectedSubjectId.value)
      .limit(10)

    if (questionsError) {
      console.error('[AIExercisesConfigModal] Erro ao buscar questões:', questionsError)
    }

    let exercisesContext = ''
    if (existingQuestions && existingQuestions.length > 0) {
      console.log('[AIExercisesConfigModal] Questões existentes encontradas:', existingQuestions.length)

      exercisesContext = '\n\n## EXERCÍCIOS E QUESTÕES JÁ EXISTENTES (use como referência de formato e estilo):\n\n'
      existingQuestions.forEach((q, index) => {
        exercisesContext += `### Questão ${index + 1} (${q.difficulty || 'Não especificado'})\n`
        exercisesContext += `${q.question_text}\n\n`

        // Add options if they exist
        if (q.option_a) exercisesContext += `A) ${q.option_a}\n`
        if (q.option_b) exercisesContext += `B) ${q.option_b}\n`
        if (q.option_c) exercisesContext += `C) ${q.option_c}\n`
        if (q.option_d) exercisesContext += `D) ${q.option_d}\n`
        if (q.option_e) exercisesContext += `E) ${q.option_e}\n`

        if (q.correct_answer) {
          exercisesContext += `\n**Resposta Correta:** ${q.correct_answer}\n`
        }
        if (q.explanation) {
          exercisesContext += `**Explicação:** ${q.explanation}\n`
        }
        exercisesContext += '\n---\n\n'
      })
    } else {
      console.log('[AIExercisesConfigModal] Nenhuma questão existente encontrada')
    }

    // Strip HTML tags from content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const plainTextContent = tempDiv.textContent || tempDiv.innerText || ''

    // Combine content with exercises context
    const fullContext = plainTextContent + exercisesContext

    console.log('[AIExercisesConfigModal] Tamanho do conteúdo:', plainTextContent.length, 'caracteres')
    console.log('[AIExercisesConfigModal] Tamanho do contexto de exercícios:', exercisesContext.length, 'caracteres')
    console.log('[AIExercisesConfigModal] Tamanho total:', fullContext.length, 'caracteres')

    if (!fullContext || fullContext.trim().length < 50) {
      throw new Error('Não há conteúdo suficiente para gerar exercícios. Adicione mais anotações no caderno.')
    }

    // Emit config to parent
    emit('generate', {
      subjectId: selectedSubjectId.value,
      subjectName: `${subject.name} - ${chapterInfo}`,
      content: fullContext,
      quantity: config.value.quantity,
      difficulty: config.value.difficulty
    })

    console.log('[AIExercisesConfigModal] Configuração enviada para geração!')
    close()
  } catch (err: any) {
    console.error('[AIExercisesConfigModal] Erro ao coletar conteúdo:', err)
    error.value = err.message || 'Erro ao coletar conteúdo'
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
  // Reset state
  setTimeout(() => {
    selectedSubjectId.value = ''
    selectedSectionId.value = ''
    sections.value = []
    config.value = { quantity: 5, difficulty: 'medium' }
    error.value = ''
  }, 300)
}

// Watch for modal open
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadSubjects()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

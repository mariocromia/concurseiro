<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">Tutor de IA</h2>
                <p v-if="contextInfo" class="text-sm text-gray-400">{{ contextInfo }}</p>
                <p v-else class="text-sm text-gray-400">Configure o contexto da conversa</p>
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

          <!-- Context Configuration (shown first) -->
          <div v-if="!chatStarted" class="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-900">
            <div class="text-center mb-6">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Configure o Contexto</h3>
              <p class="text-gray-400">Escolha uma matéria e um capítulo para obter respostas mais precisas</p>
            </div>

            <!-- Subject Selection -->
            <div>
              <label class="block text-sm font-semibold text-white mb-2">
                Matéria <span class="text-red-400">*</span>
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
              <p v-if="subjects.length === 0 && !loadingSubjects" class="text-sm text-yellow-400 mt-2">
                ⚠️ Nenhuma matéria encontrada. Cadastre matérias primeiro.
              </p>
            </div>

            <!-- Chapter Selection -->
            <div v-if="selectedSubjectId">
              <label class="block text-sm font-semibold text-white mb-2">
                Capítulo <span class="text-red-400">*</span>
              </label>
              <select
                v-model="selectedChapterId"
                class="w-full px-4 py-3 bg-dark-800 border border-dark-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :disabled="loadingChapters"
              >
                <option value="">Escolha um capítulo...</option>
                <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                  {{ chapter.title }}
                </option>
              </select>
              <p v-if="loadingChapters" class="text-sm text-gray-400 mt-2">Carregando capítulos...</p>
              <p v-if="chapters.length === 0 && !loadingChapters && selectedSubjectId" class="text-sm text-yellow-400 mt-2">
                ⚠️ Nenhum capítulo encontrado para esta matéria. Crie capítulos no caderno virtual.
              </p>
            </div>

            <!-- Info box -->
            <div class="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-blue-400">
                <strong class="block mb-1">💡 Dica:</strong>
                O tutor de IA terá como contexto a matéria e o capítulo selecionados, permitindo respostas mais precisas e focadas no conteúdo estudado.
              </div>
            </div>

            <!-- Error -->
            <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
              <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>
          </div>

          <!-- Chat Area -->
          <div v-else class="flex-1 overflow-y-auto p-6 space-y-4 bg-dark-900">
            <!-- Context Header -->
            <div class="bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/30 rounded-lg p-4 mb-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm text-primary-300 font-medium">{{ contextInfo }}</span>
                </div>
                <button
                  @click="changeContext"
                  class="text-xs text-primary-400 hover:text-primary-300 underline"
                >
                  Trocar contexto
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="flex items-start space-x-3"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                v-if="message.role === 'assistant'"
                class="bg-dark-700 rounded-lg p-4 shadow-sm border border-dark-600 max-w-[80%]"
              >
                <div class="flex items-start space-x-3">
                  <div class="w-7 h-7 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div class="prose prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
                    {{ message.content }}
                  </div>
                </div>
              </div>
              <div
                v-else
                class="bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg p-4 shadow-sm max-w-[80%]"
              >
                <p class="text-white whitespace-pre-wrap">{{ message.content }}</p>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center space-x-2 text-gray-400">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-sm">IA pensando...</span>
            </div>

            <div ref="messagesEndRef"></div>
          </div>

          <!-- Footer -->
          <div class="border-t border-dark-600 bg-dark-800 px-6 py-4">
            <!-- Start Chat Button -->
            <button
              v-if="!chatStarted"
              @click="startChat"
              :disabled="!selectedSubjectId || !selectedChapterId || loadingContext"
              class="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center space-x-2"
            >
              <svg v-if="!loadingContext" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <svg v-else class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loadingContext ? 'Carregando contexto...' : 'Iniciar Conversa' }}</span>
            </button>

            <!-- Input Area -->
            <form v-else @submit.prevent="sendMessage" class="flex items-end space-x-3">
              <div class="flex-1">
                <textarea
                  v-model="inputMessage"
                  placeholder="Digite sua pergunta..."
                  rows="2"
                  class="w-full px-4 py-3 bg-dark-900 border border-dark-600 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact="inputMessage += '\n'"
                  :disabled="loading"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">Enter para enviar, Shift+Enter para nova linha</p>
              </div>
              <button
                type="submit"
                :disabled="!inputMessage.trim() || loading"
                class="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { sendMessage: sendAIMessage } = useGemini()

const subjects = ref<any[]>([])
const chapters = ref<any[]>([])

const selectedSubjectId = ref('')
const selectedChapterId = ref('')

const chatStarted = ref(false)
const contextInfo = ref('')
const contextContent = ref('')

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const loadingContext = ref(false)
const loadingSubjects = ref(false)
const loadingChapters = ref(false)
const error = ref('')

const messagesEndRef = ref<HTMLElement | null>(null)

// Load subjects
const loadSubjects = async () => {
  loadingSubjects.value = true
  error.value = ''

  try {
    // Get user ID from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user?.id) {
      console.error('[AITutorModal] No user session:', sessionError)
      error.value = 'Usuário não autenticado'
      return
    }

    const userId = session.user.id
    console.log('[AITutorModal] Loading subjects for user:', userId)

    const { data, error: err } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (err) {
      console.error('[AITutorModal] Error loading subjects:', err)
      error.value = 'Erro ao carregar matérias: ' + err.message
    } else {
      console.log('[AITutorModal] Subjects loaded:', data?.length || 0, data)
      subjects.value = data || []

      if (data && data.length === 0) {
        error.value = 'Nenhuma matéria encontrada. Cadastre matérias primeiro.'
      }
    }
  } catch (err: any) {
    console.error('[AITutorModal] Exception loading subjects:', err)
    error.value = 'Erro ao carregar matérias'
  } finally {
    loadingSubjects.value = false
  }
}

// Load chapters when subject changes
const onSubjectChange = async () => {
  selectedChapterId.value = ''
  chapters.value = []

  if (!selectedSubjectId.value) return

  loadingChapters.value = true
  console.log('[AITutorModal] Loading chapters for subject:', selectedSubjectId.value)

  try {
    const { data, error: err } = await supabase
      .from('chapters')
      .select('*')
      .eq('subject_id', selectedSubjectId.value)
      .order('order_index')

    if (err) {
      console.error('[AITutorModal] Error loading chapters:', err)
      error.value = 'Erro ao carregar capítulos: ' + err.message
    } else {
      console.log('[AITutorModal] Chapters loaded:', data?.length || 0)
      chapters.value = data || []
    }
  } catch (err: any) {
    console.error('[AITutorModal] Exception loading chapters:', err)
    error.value = 'Erro ao carregar capítulos'
  } finally {
    loadingChapters.value = false
  }
}

// Start chat with context
const startChat = async () => {
  error.value = ''

  if (!selectedSubjectId.value || !selectedChapterId.value) {
    error.value = 'Por favor, selecione uma matéria e um capítulo'
    return
  }

  loadingContext.value = true

  try {
    const subject = subjects.value.find(s => s.id === selectedSubjectId.value)
    const chapter = chapters.value.find(c => c.id === selectedChapterId.value)

    if (!subject) throw new Error('Matéria não encontrada')
    if (!chapter) throw new Error('Capítulo não encontrado')

    // Build context info
    const info = `${subject.name} - ${chapter.title}`
    let content = ''

    // Get pages content from the selected chapter
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('content, title')
      .eq('chapter_id', selectedChapterId.value)
      .order('order_index')

    if (pagesError) {
      console.error('[AITutorModal] Error loading pages:', pagesError)
    } else if (pages && pages.length > 0) {
      // Join all page contents
      content = pages.map(p => `${p.title}\n${p.content}`).join('\n\n')

      // Strip HTML tags
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      content = tempDiv.textContent || tempDiv.innerText || ''
    }

    contextInfo.value = info
    contextContent.value = content

    console.log('[AITutorModal] Context loaded:', {
      subject: subject.name,
      chapter: chapter.title,
      pagesCount: pages?.length || 0,
      contentLength: content.length
    })

    chatStarted.value = true
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar contexto'
  } finally {
    loadingContext.value = false
  }
}

// Send message
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = inputMessage.value.trim()
  console.log('[AITutorModal] Sending message:', userMessage)

  messages.value.push({ role: 'user', content: userMessage })
  inputMessage.value = ''

  scrollToBottom()
  loading.value = true

  try {
    // Build context prompt
    let contextPrompt = `Você é um tutor educacional brasileiro especializado em concursos e vestibulares, focado em ${contextInfo.value}.

Responda de forma clara, didática e em português do Brasil. Use exemplos práticos e seja encorajador.`

    if (contextContent.value) {
      contextPrompt += `\n\nContexto do conteúdo estudado pelo aluno:\n${contextContent.value.substring(0, 2000)}`
    }

    contextPrompt += `\n\nIMPORTANTE: Você pode usar TODO o seu conhecimento sobre ${contextInfo.value} para responder. Não se limite apenas ao que está no contexto acima - use-o como referência, mas complemente com toda a sua expertise sobre o assunto.`

    console.log('[AITutorModal] Context prompt length:', contextPrompt.length)
    console.log('[AITutorModal] Calling sendAIMessage...')

    const response = await sendAIMessage(userMessage, contextPrompt)

    console.log('[AITutorModal] Response received:', response?.substring(0, 100))
    messages.value.push({ role: 'assistant', content: response })
    scrollToBottom()
  } catch (err: any) {
    console.error('[AITutorModal] ❌ Error sending message:', err)
    console.error('[AITutorModal] Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    })

    messages.value.push({
      role: 'assistant',
      content: `Desculpe, ocorreu um erro ao processar sua mensagem: ${err.message || 'Erro desconhecido'}`
    })
  } finally {
    loading.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

const changeContext = () => {
  chatStarted.value = false
  messages.value = []
  contextInfo.value = ''
  contextContent.value = ''
}

const close = () => {
  emit('close')
  // Reset
  setTimeout(() => {
    chatStarted.value = false
    messages.value = []
    inputMessage.value = ''
    selectedSubjectId.value = ''
    selectedChapterId.value = ''
    contextInfo.value = ''
    contextContent.value = ''
    chapters.value = []
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

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 0.5em;
}
</style>

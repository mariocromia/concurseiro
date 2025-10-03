<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-3xl">✨</span>
              <div>
                <h2 class="text-xl font-bold text-white">{{ title }}</h2>
                <p class="text-sm text-blue-100">{{ subtitle }}</p>
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

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            <!-- Initial Content / Summary -->
            <div v-if="initialContent" class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div class="flex items-start space-x-3">
                <span class="text-2xl">🤖</span>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-900 mb-2">Resposta da IA</div>
                  <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{{ initialContent }}</div>
                </div>
              </div>
            </div>

            <!-- Chat Messages -->
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="flex items-start space-x-3"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                v-if="message.role === 'assistant'"
                class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 max-w-[80%]"
              >
                <div class="flex items-start space-x-2">
                  <span class="text-xl">🤖</span>
                  <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {{ message.content }}
                  </div>
                </div>
              </div>
              <div
                v-else
                class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-sm max-w-[80%]"
              >
                <p class="text-white whitespace-pre-wrap">{{ message.content }}</p>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center space-x-2 text-gray-500">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-sm">IA pensando...</span>
            </div>

            <div ref="messagesEndRef"></div>
          </div>

          <!-- Input Area -->
          <div class="border-t border-gray-200 bg-white px-6 py-4">
            <form @submit.prevent="sendMessage" class="flex items-end space-x-3">
              <div class="flex-1">
                <textarea
                  v-model="inputMessage"
                  :placeholder="placeholder"
                  rows="2"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact="inputMessage += '\n'"
                  :disabled="loading"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">Enter para enviar, Shift+Enter para nova linha</p>
              </div>
              <button
                type="submit"
                :disabled="!inputMessage.trim() || loading"
                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
  title?: string
  subtitle?: string
  initialContent?: string
  context?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Chat com IA',
  subtitle: 'Converse com o assistente inteligente',
  placeholder: 'Digite sua pergunta...'
})

const emit = defineEmits<{
  close: []
  message: [message: string, messages: Message[]]
}>()

const { chat } = useGemini()

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesEndRef = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage = inputMessage.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  inputMessage.value = ''

  scrollToBottom()

  loading.value = true

  try {
    const response = await chat([...messages.value], props.context)
    messages.value.push({ role: 'assistant', content: response })
    emit('message', userMessage, [...messages.value])
    scrollToBottom()
  } catch (error) {
    console.error('Erro no chat:', error)
    messages.value.push({
      role: 'assistant',
      content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.'
    })
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}

// Limpar mensagens ao fechar
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    messages.value = []
    inputMessage.value = ''
  } else {
    scrollToBottom()
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

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 0.5em;
}

.prose ul,
.prose ol {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>

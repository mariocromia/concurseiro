<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-3xl">🎴</span>
              <div>
                <h2 class="text-xl font-bold text-white">Flashcards Inteligentes</h2>
                <p class="text-sm text-purple-100">
                  {{ flashcards.length > 0 ? `${currentIndex + 1} de ${flashcards.length}` : 'Configure seus flashcards' }}
                </p>
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
          <div v-if="!generated" class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Quantidade de flashcards</label>
              <div class="flex items-center space-x-4">
                <input
                  v-model.number="config.quantity"
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span class="text-2xl font-bold text-purple-600 w-12 text-center">{{ config.quantity }}</span>
              </div>
            </div>

            <button
              @click="generateFlashcards"
              :disabled="loading"
              class="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center space-x-2"
            >
              <svg v-if="!loading" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <svg v-else class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Gerando flashcards...' : 'Gerar Flashcards' }}</span>
            </button>

            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <!-- Flashcard Display -->
          <div v-else class="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div class="w-full max-w-2xl">
              <!-- Card -->
              <div
                class="relative w-full h-96 cursor-pointer perspective-1000"
                @click="flipCard"
              >
                <div
                  class="absolute inset-0 transition-transform duration-500 transform-style-preserve-3d"
                  :class="{ 'rotate-y-180': flipped }"
                >
                  <!-- Front (Question) -->
                  <div class="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-2xl border-4 border-purple-500 p-8 flex flex-col items-center justify-center">
                    <div class="text-sm font-semibold text-purple-600 mb-4 uppercase tracking-wide">Pergunta</div>
                    <p class="text-2xl font-bold text-gray-900 text-center leading-relaxed">
                      {{ currentFlashcard?.question }}
                    </p>
                    <div class="absolute bottom-8 text-sm text-gray-500">
                      Clique para ver a resposta
                    </div>
                  </div>

                  <!-- Back (Answer) -->
                  <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl border-4 border-purple-700 p-8 flex flex-col items-center justify-center rotate-y-180">
                    <div class="text-sm font-semibold text-purple-100 mb-4 uppercase tracking-wide">Resposta</div>
                    <p class="text-xl text-white text-center leading-relaxed">
                      {{ currentFlashcard?.answer }}
                    </p>
                    <div class="absolute bottom-8 text-sm text-purple-200">
                      Clique para voltar
                    </div>
                  </div>
                </div>
              </div>

              <!-- Difficulty Buttons (only show when flipped) -->
              <Transition name="fade">
                <div v-if="flipped" class="mt-8 grid grid-cols-3 gap-4">
                  <button
                    @click.stop="rateCard('easy')"
                    class="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all hover:shadow-lg font-semibold"
                  >
                    <div class="text-2xl mb-1">😊</div>
                    <div class="text-sm">Fácil</div>
                  </button>
                  <button
                    @click.stop="rateCard('medium')"
                    class="px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-all hover:shadow-lg font-semibold"
                  >
                    <div class="text-2xl mb-1">🤔</div>
                    <div class="text-sm">Médio</div>
                  </button>
                  <button
                    @click.stop="rateCard('hard')"
                    class="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all hover:shadow-lg font-semibold"
                  >
                    <div class="text-2xl mb-1">😓</div>
                    <div class="text-sm">Difícil</div>
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Navigation -->
          <div v-if="generated" class="border-t border-gray-200 bg-white px-6 py-4">
            <div class="flex items-center justify-between">
              <button
                @click="previousCard"
                :disabled="currentIndex === 0"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← Anterior
              </button>

              <!-- Progress dots -->
              <div class="flex items-center space-x-1">
                <div
                  v-for="(card, index) in flashcards"
                  :key="index"
                  class="w-2 h-2 rounded-full transition-all"
                  :class="index === currentIndex ? 'bg-purple-600 w-8' : ratings[index] ? 'bg-green-500' : 'bg-gray-300'"
                ></div>
              </div>

              <button
                v-if="currentIndex < flashcards.length - 1"
                @click="nextCard"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Próximo →
              </button>
              <button
                v-else
                @click="close"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Flashcard {
  question: string
  answer: string
}

interface Props {
  isOpen: boolean
  content: string
  chapterTitle?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const { generateFlashcards: generateFlashcardsAPI } = useGemini()

const config = ref({
  quantity: 10
})

const loading = ref(false)
const error = ref('')
const generated = ref(false)
const flashcards = ref<Flashcard[]>([])
const currentIndex = ref(0)
const flipped = ref(false)
const ratings = ref<Record<number, string>>({})

const currentFlashcard = computed(() => flashcards.value[currentIndex.value])

const generateFlashcards = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await generateFlashcardsAPI(
      props.content,
      config.value.quantity,
      props.chapterTitle
    )
    flashcards.value = result
    generated.value = true
  } catch (err: any) {
    error.value = err.message || 'Erro ao gerar flashcards'
  } finally {
    loading.value = false
  }
}

const flipCard = () => {
  flipped.value = !flipped.value
}

const rateCard = (difficulty: string) => {
  ratings.value[currentIndex.value] = difficulty
  // Auto-advance to next card after rating
  setTimeout(() => {
    if (currentIndex.value < flashcards.value.length - 1) {
      nextCard()
    }
  }, 300)
}

const nextCard = () => {
  if (currentIndex.value < flashcards.value.length - 1) {
    currentIndex.value++
    flipped.value = false
  }
}

const previousCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    flipped.value = false
  }
}

const close = () => {
  emit('close')
  // Reset
  setTimeout(() => {
    generated.value = false
    flashcards.value = []
    currentIndex.value = 0
    flipped.value = false
    ratings.value = {}
    config.value = { quantity: 10 }
  }, 300)
}
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>

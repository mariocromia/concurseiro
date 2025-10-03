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
          <div class="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-3xl">📚</span>
              <div>
                <h2 class="text-xl font-bold text-white">Exercícios Gerados por IA</h2>
                <p class="text-sm text-green-100">
                  {{ exercises.length > 0 ? `${currentIndex + 1} de ${exercises.length}` : 'Configure seus exercícios' }}
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
              <label class="block text-sm font-semibold text-gray-900 mb-2">Quantidade de questões</label>
              <div class="flex items-center space-x-4">
                <input
                  v-model.number="config.quantity"
                  type="range"
                  min="1"
                  max="20"
                  class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span class="text-2xl font-bold text-green-600 w-12 text-center">{{ config.quantity }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-3">Nível de dificuldade</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="level in difficultyLevels"
                  :key="level.value"
                  @click="config.difficulty = level.value"
                  class="px-4 py-3 rounded-xl border-2 transition-all"
                  :class="config.difficulty === level.value
                    ? 'border-green-600 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-green-300'"
                >
                  <div class="text-2xl mb-1">{{ level.icon }}</div>
                  <div class="text-sm font-semibold text-gray-900">{{ level.label }}</div>
                </button>
              </div>
            </div>

            <button
              @click="generateExercises"
              :disabled="loading"
              class="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center space-x-2"
            >
              <svg v-if="!loading" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <svg v-else class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Gerando exercícios...' : 'Gerar Exercícios' }}</span>
            </button>

            <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <!-- Exercise Display -->
          <div v-else class="flex-1 overflow-y-auto p-6">
            <div v-if="currentExercise" class="space-y-6">
              <!-- Question -->
              <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                <div class="flex items-start justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Questão {{ currentIndex + 1 }}</h3>
                  <span class="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                    {{ config.difficulty }}
                  </span>
                </div>
                <p class="text-gray-800 leading-relaxed">{{ currentExercise.question }}</p>
              </div>

              <!-- Options -->
              <div class="space-y-3">
                <button
                  v-for="(option, key) in currentExercise.options"
                  :key="key"
                  @click="selectAnswer(key)"
                  :disabled="answered"
                  class="w-full text-left px-5 py-4 rounded-xl border-2 transition-all"
                  :class="getOptionClass(key)"
                >
                  <div class="flex items-center space-x-3">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      :class="getOptionBadgeClass(key)">
                      {{ key }}
                    </span>
                    <span class="flex-1">{{ option }}</span>
                    <svg v-if="answered && key === currentExercise.correct_answer" class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="answered && key === selectedAnswer && key !== currentExercise.correct_answer" class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </button>
              </div>

              <!-- Explanation -->
              <Transition name="slide-down">
                <div v-if="answered && currentExercise.explanation" class="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div class="flex items-start space-x-3">
                    <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <div>
                      <h4 class="font-semibold text-blue-900 mb-2">Explicação</h4>
                      <p class="text-blue-800 leading-relaxed">{{ currentExercise.explanation }}</p>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Navigation -->
          <div v-if="generated" class="border-t border-gray-200 bg-white px-6 py-4">
            <div class="flex items-center justify-between">
              <button
                @click="previousExercise"
                :disabled="currentIndex === 0"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← Anterior
              </button>

              <div class="text-sm text-gray-600">
                Acertos: <span class="font-bold text-green-600">{{ correctCount }}</span> / {{ answeredCount }}
              </div>

              <button
                v-if="currentIndex < exercises.length - 1"
                @click="nextExercise"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Próxima →
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
interface Exercise {
  question: string
  options: Record<string, string>
  correct_answer: string
  explanation: string
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

const { generateExercises: generateExercisesAPI } = useGemini()

const config = ref({
  quantity: 5,
  difficulty: 'medium' as 'easy' | 'medium' | 'hard'
})

const difficultyLevels = [
  { value: 'easy' as const, label: 'Fácil', icon: '😊' },
  { value: 'medium' as const, label: 'Médio', icon: '🤔' },
  { value: 'hard' as const, label: 'Difícil', icon: '🔥' }
]

const loading = ref(false)
const error = ref('')
const generated = ref(false)
const exercises = ref<Exercise[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const answered = ref(false)
const answers = ref<Record<number, { selected: string; correct: boolean }>>({})

const currentExercise = computed(() => exercises.value[currentIndex.value])
const correctCount = computed(() => Object.values(answers.value).filter(a => a.correct).length)
const answeredCount = computed(() => Object.keys(answers.value).length)

const generateExercises = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await generateExercisesAPI(
      props.content,
      config.value.quantity,
      config.value.difficulty,
      props.chapterTitle
    )
    exercises.value = result
    generated.value = true
  } catch (err: any) {
    error.value = err.message || 'Erro ao gerar exercícios'
  } finally {
    loading.value = false
  }
}

const selectAnswer = (key: string) => {
  if (answered.value) return

  selectedAnswer.value = key
  answered.value = true
  answers.value[currentIndex.value] = {
    selected: key,
    correct: key === currentExercise.value.correct_answer
  }
}

const getOptionClass = (key: string) => {
  if (!answered.value) {
    return 'border-gray-200 hover:border-green-300 hover:bg-green-50'
  }

  if (key === currentExercise.value.correct_answer) {
    return 'border-green-600 bg-green-50'
  }

  if (key === selectedAnswer.value && key !== currentExercise.value.correct_answer) {
    return 'border-red-600 bg-red-50'
  }

  return 'border-gray-200 opacity-60'
}

const getOptionBadgeClass = (key: string) => {
  if (!answered.value) {
    return 'bg-gray-100 text-gray-700'
  }

  if (key === currentExercise.value.correct_answer) {
    return 'bg-green-600 text-white'
  }

  if (key === selectedAnswer.value && key !== currentExercise.value.correct_answer) {
    return 'bg-red-600 text-white'
  }

  return 'bg-gray-100 text-gray-700'
}

const nextExercise = () => {
  if (currentIndex.value < exercises.value.length - 1) {
    currentIndex.value++
    // Restaurar resposta se já foi respondida
    if (answers.value[currentIndex.value]) {
      selectedAnswer.value = answers.value[currentIndex.value].selected
      answered.value = true
    } else {
      selectedAnswer.value = null
      answered.value = false
    }
  }
}

const previousExercise = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    // Restaurar resposta se já foi respondida
    if (answers.value[currentIndex.value]) {
      selectedAnswer.value = answers.value[currentIndex.value].selected
      answered.value = true
    } else {
      selectedAnswer.value = null
      answered.value = false
    }
  }
}

const close = () => {
  emit('close')
  // Reset
  setTimeout(() => {
    generated.value = false
    exercises.value = []
    currentIndex.value = 0
    selectedAnswer.value = null
    answered.value = false
    answers.value = {}
    config.value = { quantity: 5, difficulty: 'medium' }
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

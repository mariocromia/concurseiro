<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-dark-700">
          <!-- Header -->
          <div class="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-claude-primary/20 dark:bg-primary-500/20 rounded-claude-md flex items-center justify-center">
                <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">Exercícios Gerados por IA</h2>
                <p class="text-sm text-gray-400">
                  {{ exercises.length > 0 ? `${currentIndex + 1} de ${exercises.length}` : 'Configure seus exercícios' }}
                </p>
              </div>
            </div>
            <button
              @click="close"
              class="text-white hover:bg-white hover:bg-opacity-20 rounded-claude-md p-2 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Configuration -->
          <div v-if="!generated" class="p-6 space-y-6 bg-dark-900">
            <div>
              <label class="block text-sm font-semibold text-white mb-2">Quantidade de questões</label>
              <div class="flex items-center space-x-4">
                <input
                  v-model.number="config.quantity"
                  type="range"
                  min="1"
                  max="20"
                  class="flex-1 h-2 bg-dark-600 rounded-claude-md appearance-none cursor-pointer"
                />
                <span class="text-2xl font-bold text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors w-12 text-center">{{ config.quantity }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-white mb-3">Nível de dificuldade</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="level in difficultyLevels"
                  :key="level.value"
                  @click="config.difficulty = level.value"
                  class="px-4 py-3 rounded-claude-lg border-2 transition-all"
                  :class="config.difficulty === level.value
                    ? 'border-claude-primary bg-dark-700/30 shadow-md'
                    : 'border-dark-600 hover:border-claude-primary dark:hover:border-primary-500 dark:border-primary-500/50'"
                >
                  <div class="text-sm font-semibold text-white">{{ level.label }}</div>
                </button>
              </div>
            </div>

            <button
              @click="generateExercises"
              :disabled="loading"
              class="w-full px-6 py-4 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white rounded-claude-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center space-x-2"
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

            <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-claude-md p-4 flex items-start space-x-3">
              <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-400">{{ error }}</p>
            </div>
          </div>

          <!-- Results Screen -->
          <div v-else-if="showResults" class="flex-1 overflow-y-auto p-6 bg-dark-900">
            <div class="max-w-2xl mx-auto space-y-6">
              <!-- Performance Summary -->
              <div class="text-center mb-8">
                <div class="w-32 h-32 mx-auto mb-6 relative">
                  <svg class="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none" class="text-dark-600" />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      stroke-width="8"
                      fill="none"
                      :stroke-dasharray="circumference"
                      :stroke-dashoffset="circumference - (percentage / 100) * circumference"
                      class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors transition-all duration-1000"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-3xl font-bold text-white">{{ percentage.toFixed(0) }}%</span>
                  </div>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">
                  {{ getPerformanceMessage() }}
                </h3>
                <p class="text-gray-400">{{ correctCount }} acertos de {{ exercises.length }} questões</p>
              </div>

              <!-- Stats Cards -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-dark-700/30 border border-dark-600 rounded-claude-lg p-4 text-center">
                  <div class="text-2xl font-bold text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mb-1">{{ correctCount }}</div>
                  <div class="text-xs text-gray-400">Acertos</div>
                </div>
                <div class="bg-dark-700/30 border border-dark-600 rounded-claude-lg p-4 text-center">
                  <div class="text-2xl font-bold text-red-400 mb-1">{{ exercises.length - correctCount }}</div>
                  <div class="text-xs text-gray-400">Erros</div>
                </div>
                <div class="bg-dark-700/30 border border-dark-600 rounded-claude-lg p-4 text-center">
                  <div class="text-2xl font-bold text-yellow-400 mb-1">{{ percentage.toFixed(1) }}</div>
                  <div class="text-xs text-gray-400">Nota</div>
                </div>
              </div>

              <!-- Questions Review -->
              <div class="bg-dark-700/30 border border-dark-600 rounded-claude-lg p-6">
                <h4 class="font-semibold text-white mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Revisão das Questões
                </h4>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <button
                    v-for="(exercise, index) in exercises"
                    :key="index"
                    @click="reviewQuestion(index)"
                    class="w-full flex items-center justify-between p-3 rounded-claude-md border transition-colors"
                    :class="answers[index]?.correct
                      ? 'border-claude-primary dark:border-primary-500/30 bg-primary-500/5 hover:bg-primary-500/10'
                      : 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'"
                  >
                    <span class="text-sm text-gray-300">Questão {{ index + 1 }}</span>
                    <svg v-if="answers[index]?.correct" class="w-5 h-5 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Save to Reports -->
              <div class="bg-dark-700/30 border border-dark-600 rounded-claude-lg p-6">
                <h4 class="font-semibold text-white mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Salvar nos Relatórios
                </h4>
                <p class="text-sm text-gray-400 mb-4">Deseja adicionar este resultado aos seus relatórios de estudo?</p>
                <button
                  @click="saveToReports"
                  :disabled="savingToReports"
                  class="w-full px-4 py-3 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white rounded-claude-md transition-colors font-medium disabled:opacity-50"
                >
                  {{ savingToReports ? 'Salvando...' : savedToReports ? '✓ Salvo nos Relatórios' : 'Salvar nos Relatórios' }}
                </button>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button
                  @click="resetQuiz"
                  class="flex-1 px-4 py-3 border border-dark-600 hover:bg-dark-700 text-white rounded-claude-md transition-colors font-medium"
                >
                  Fazer Novamente
                </button>
                <button
                  @click="close"
                  class="flex-1 px-4 py-3 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white rounded-claude-md transition-colors font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>

          <!-- Exercise Display -->
          <div v-else class="flex-1 overflow-y-auto p-6 bg-dark-900">
            <div v-if="currentExercise" class="space-y-6">
              <!-- Question -->
              <div class="bg-dark-700/30 border border-dark-600 rounded-claude-lg p-6">
                <div class="flex items-start justify-between mb-4">
                  <h3 class="text-lg font-semibold text-white">Questão {{ currentIndex + 1 }}</h3>
                  <span class="px-3 py-1 bg-claude-primary/20 dark:bg-primary-500/20 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors text-xs font-semibold rounded-full">
                    {{ config.difficulty }}
                  </span>
                </div>
                <p class="text-gray-300 leading-relaxed">{{ currentExercise.question }}</p>
              </div>

              <!-- Options -->
              <div class="space-y-3">
                <button
                  v-for="(option, key) in currentExercise.options"
                  :key="key"
                  @click="selectAnswer(key)"
                  :disabled="answered"
                  class="w-full text-left px-5 py-4 rounded-claude-lg border-2 transition-all"
                  :class="getOptionClass(key)"
                >
                  <div class="flex items-center space-x-3">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      :class="getOptionBadgeClass(key)">
                      {{ key }}
                    </span>
                    <span class="flex-1 text-gray-300">{{ option }}</span>
                    <svg v-if="answered && key === currentExercise.correct_answer" class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="answered && key === selectedAnswer && key !== currentExercise.correct_answer" class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </button>
              </div>

              <!-- Explanation -->
              <Transition name="slide-down">
                <div v-if="answered && currentExercise.explanation" class="bg-gray-700/50 border border-gray-600 rounded-claude-lg p-5">
                  <div class="flex items-start space-x-3">
                    <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <div>
                      <h4 class="font-semibold text-white mb-2">Explicação</h4>
                      <p class="text-gray-300 leading-relaxed">{{ currentExercise.explanation }}</p>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Navigation -->
          <div v-if="generated" class="border-t border-dark-700 bg-dark-800 px-6 py-4">
            <div class="flex items-center justify-between">
              <button
                @click="previousExercise"
                :disabled="currentIndex === 0"
                class="px-4 py-2 border border-dark-600 rounded-claude-md hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-300"
              >
                ← Anterior
              </button>

              <div class="text-sm text-gray-400">
                Acertos: <span class="font-bold text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors">{{ correctCount }}</span> / {{ answeredCount }}
              </div>

              <button
                v-if="currentIndex < exercises.length - 1"
                @click="nextExercise"
                class="px-4 py-2 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-white rounded-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-colors font-medium"
              >
                Próxima →
              </button>
              <button
                v-else
                @click="finishQuiz"
                class="px-4 py-2 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-white rounded-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-colors font-medium"
              >
                Ver Resultados
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
  { value: 'easy' as const, label: 'Fácil' },
  { value: 'medium' as const, label: 'Médio' },
  { value: 'hard' as const, label: 'Difícil' }
]

const loading = ref(false)
const error = ref('')
const generated = ref(false)
const exercises = ref<Exercise[]>([])
const currentIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const answered = ref(false)
const answers = ref<Record<number, { selected: string; correct: boolean }>>({})
const showResults = ref(false)
const savingToReports = ref(false)
const savedToReports = ref(false)

const currentExercise = computed(() => exercises.value[currentIndex.value])
const correctCount = computed(() => Object.values(answers.value).filter(a => a.correct).length)
const answeredCount = computed(() => Object.keys(answers.value).length)
const percentage = computed(() => exercises.value.length > 0 ? (correctCount.value / exercises.value.length) * 100 : 0)
const circumference = 2 * Math.PI * 56 // raio do círculo = 56

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
    return 'border-dark-600 hover:border-claude-primary hover:bg-dark-700/50'
  }

  if (key === currentExercise.value.correct_answer) {
    return 'border-claude-primary bg-primary-500/10'
  }

  if (key === selectedAnswer.value && key !== currentExercise.value.correct_answer) {
    return 'border-red-500 bg-red-500/10'
  }

  return 'border-dark-600 opacity-60'
}

const getOptionBadgeClass = (key: string) => {
  if (!answered.value) {
    return 'bg-dark-600 text-gray-300'
  }

  if (key === currentExercise.value.correct_answer) {
    return 'bg-primary-500 text-white'
  }

  if (key === selectedAnswer.value && key !== currentExercise.value.correct_answer) {
    return 'bg-red-500 text-white'
  }

  return 'bg-dark-600 text-gray-300'
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

const finishQuiz = () => {
  showResults.value = true
}

const getPerformanceMessage = () => {
  const perc = percentage.value
  if (perc === 100) return '🎉 Perfeito! Parabéns!'
  if (perc >= 90) return '🌟 Excelente trabalho!'
  if (perc >= 70) return '👏 Muito bom!'
  if (perc >= 50) return '👍 Bom esforço!'
  return '💪 Continue estudando!'
}

const reviewQuestion = (index: number) => {
  showResults.value = false
  currentIndex.value = index
  if (answers.value[index]) {
    selectedAnswer.value = answers.value[index].selected
    answered.value = true
  } else {
    selectedAnswer.value = null
    answered.value = false
  }
}

const resetQuiz = () => {
  showResults.value = false
  generated.value = false
  exercises.value = []
  currentIndex.value = 0
  selectedAnswer.value = null
  answered.value = false
  answers.value = {}
  savedToReports.value = false
}

const saveToReports = async () => {
  savingToReports.value = true

  try {
    // Aqui você pode adicionar a lógica para salvar nos relatórios
    // Por exemplo, chamar uma API para salvar os resultados
    await $fetch('/api/study-sessions/save', {
      method: 'POST',
      body: {
        type: 'ai_exercises',
        subject: props.chapterTitle || 'Exercícios IA',
        total_questions: exercises.value.length,
        correct_answers: correctCount.value,
        score: percentage.value,
        difficulty: config.value.difficulty,
        questions: exercises.value.map((ex, idx) => ({
          question: ex.question,
          selected: answers.value[idx]?.selected,
          correct: answers.value[idx]?.correct
        }))
      }
    })

    savedToReports.value = true
  } catch (err) {
    console.error('Erro ao salvar nos relatórios:', err)
    // Mostrar mensagem de erro se necessário
  } finally {
    savingToReports.value = false
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
    showResults.value = false
    savedToReports.value = false
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

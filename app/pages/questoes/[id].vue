<script setup lang="ts">
/**
 * Página Individual de Questão
 *
 * Exibe questão completa e permite responder
 * Registra tentativas e mostra explicação
 *
 * @author Claude Code
 * @date 2025-10-17
 */

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()

const questionId = route.params.id as string

// Estado
const question = ref<any>(null)
const loading = ref(true)
const selectedAnswer = ref<string | null>(null)
const hasAnswered = ref(false)
const isCorrect = ref(false)
const showExplanation = ref(false)
const attempts = ref([])

// Carregar questão
const loadQuestion = async () => {
  loading.value = true

  try {
    const { data, error } = await client
      .from('questions')
      .select(`
        *,
        subjects(name, color, icon),
        question_attempts(
          id,
          selected_answer,
          is_correct,
          time_spent_seconds,
          created_at
        )
      `)
      .eq('id', questionId)
      .eq('user_id', user.value?.id)
      .single()

    if (error) throw error

    question.value = data
    attempts.value = data.question_attempts || []

  } catch (error) {
    console.error('Erro ao carregar questão:', error)
    router.push('/questoes')
  } finally {
    loading.value = false
  }
}

// Submeter resposta
const submitAnswer = async () => {
  if (!selectedAnswer.value) return

  const startTime = Date.now()
  const correct = selectedAnswer.value === question.value.correct_answer
  isCorrect.value = correct
  hasAnswered.value = true
  showExplanation.value = true

  try {
    // Registrar tentativa
    const { error } = await client
      .from('question_attempts')
      .insert({
        question_id: questionId,
        user_id: user.value?.id,
        selected_answer: selectedAnswer.value,
        is_correct: correct,
        time_spent_seconds: Math.floor((Date.now() - startTime) / 1000)
      })

    if (error) throw error

    // Recarregar para atualizar estatísticas
    await loadQuestion()

  } catch (error) {
    console.error('Erro ao registrar resposta:', error)
  }
}

// Tentar novamente
const tryAgain = () => {
  selectedAnswer.value = null
  hasAnswered.value = false
  showExplanation.value = false
  isCorrect.value = false
}

// Estatísticas
const stats = computed(() => {
  const total = attempts.value.length
  const correct = attempts.value.filter((a: any) => a.is_correct).length
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0

  return { total, correct, rate }
})

// Lifecycle
onMounted(() => {
  loadQuestion()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-400 mt-4">Carregando questão...</p>
      </div>

      <!-- Questão -->
      <div v-else-if="question">
        <!-- Header -->
        <div class="mb-6">
          <button
            @click="router.back()"
            class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <span>←</span>
            <span>Voltar</span>
          </button>

          <div class="flex items-center gap-3 mb-4">
            <span
              v-if="question.subjects"
              class="px-4 py-2 rounded-full text-sm font-medium"
              :style="{ backgroundColor: question.subjects.color + '20', color: question.subjects.color }"
            >
              {{ question.subjects.icon }} {{ question.subjects.name }}
            </span>
            <span v-if="question.exam_source" class="text-gray-400">
              {{ question.exam_source }}
            </span>
            <span v-if="question.year" class="text-gray-400">
              {{ question.year }}
            </span>
          </div>
        </div>

        <!-- Estatísticas do Usuário -->
        <div v-if="attempts.length > 0" class="bg-dark-800/50 backdrop-blur rounded-xl p-4 border border-dark-700 mb-6">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-white">{{ stats.total }}</div>
              <div class="text-sm text-gray-400">Tentativas</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-400">{{ stats.correct }}</div>
              <div class="text-sm text-gray-400">Acertos</div>
            </div>
            <div>
              <div class="text-2xl font-bold" :class="stats.rate >= 70 ? 'text-green-400' : 'text-yellow-400'">
                {{ stats.rate }}%
              </div>
              <div class="text-sm text-gray-400">Taxa de Acerto</div>
            </div>
          </div>
        </div>

        <!-- Card da Questão -->
        <div class="bg-dark-800/50 backdrop-blur rounded-xl p-8 border border-dark-700 mb-6">
          <!-- Enunciado -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-white mb-4">Questão</h2>
            <p class="text-gray-200 leading-relaxed whitespace-pre-line">
              {{ question.question_text }}
            </p>
          </div>

          <!-- Alternativas -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-white mb-4">Alternativas</h3>

            <!-- Opção A -->
            <button
              @click="!hasAnswered && (selectedAnswer = 'A')"
              :disabled="hasAnswered"
              class="w-full text-left p-4 rounded-lg border transition-all"
              :class="{
                'border-primary-500 bg-primary-500/10': selectedAnswer === 'A' && !hasAnswered,
                'border-green-500 bg-green-500/10': hasAnswered && question.correct_answer === 'A',
                'border-red-500 bg-red-500/10': hasAnswered && selectedAnswer === 'A' && !isCorrect,
                'border-dark-700 hover:border-dark-600': !hasAnswered && selectedAnswer !== 'A',
                'border-dark-700': hasAnswered && selectedAnswer !== 'A' && question.correct_answer !== 'A',
                'cursor-not-allowed opacity-50': hasAnswered
              }"
            >
              <div class="flex items-start gap-3">
                <span class="font-bold text-white">A)</span>
                <span class="text-gray-200 flex-1">{{ question.option_a }}</span>
                <span v-if="hasAnswered && question.correct_answer === 'A'" class="text-green-400">✓</span>
                <span v-if="hasAnswered && selectedAnswer === 'A' && !isCorrect" class="text-red-400">✗</span>
              </div>
            </button>

            <!-- Opção B -->
            <button
              @click="!hasAnswered && (selectedAnswer = 'B')"
              :disabled="hasAnswered"
              class="w-full text-left p-4 rounded-lg border transition-all"
              :class="{
                'border-primary-500 bg-primary-500/10': selectedAnswer === 'B' && !hasAnswered,
                'border-green-500 bg-green-500/10': hasAnswered && question.correct_answer === 'B',
                'border-red-500 bg-red-500/10': hasAnswered && selectedAnswer === 'B' && !isCorrect,
                'border-dark-700 hover:border-dark-600': !hasAnswered && selectedAnswer !== 'B',
                'border-dark-700': hasAnswered && selectedAnswer !== 'B' && question.correct_answer !== 'B',
                'cursor-not-allowed opacity-50': hasAnswered
              }"
            >
              <div class="flex items-start gap-3">
                <span class="font-bold text-white">B)</span>
                <span class="text-gray-200 flex-1">{{ question.option_b }}</span>
                <span v-if="hasAnswered && question.correct_answer === 'B'" class="text-green-400">✓</span>
                <span v-if="hasAnswered && selectedAnswer === 'B' && !isCorrect" class="text-red-400">✗</span>
              </div>
            </button>

            <!-- Opção C -->
            <button
              @click="!hasAnswered && (selectedAnswer = 'C')"
              :disabled="hasAnswered"
              class="w-full text-left p-4 rounded-lg border transition-all"
              :class="{
                'border-primary-500 bg-primary-500/10': selectedAnswer === 'C' && !hasAnswered,
                'border-green-500 bg-green-500/10': hasAnswered && question.correct_answer === 'C',
                'border-red-500 bg-red-500/10': hasAnswered && selectedAnswer === 'C' && !isCorrect,
                'border-dark-700 hover:border-dark-600': !hasAnswered && selectedAnswer !== 'C',
                'border-dark-700': hasAnswered && selectedAnswer !== 'C' && question.correct_answer !== 'C',
                'cursor-not-allowed opacity-50': hasAnswered
              }"
            >
              <div class="flex items-start gap-3">
                <span class="font-bold text-white">C)</span>
                <span class="text-gray-200 flex-1">{{ question.option_c }}</span>
                <span v-if="hasAnswered && question.correct_answer === 'C'" class="text-green-400">✓</span>
                <span v-if="hasAnswered && selectedAnswer === 'C' && !isCorrect" class="text-red-400">✗</span>
              </div>
            </button>

            <!-- Opção D -->
            <button
              @click="!hasAnswered && (selectedAnswer = 'D')"
              :disabled="hasAnswered"
              class="w-full text-left p-4 rounded-lg border transition-all"
              :class="{
                'border-primary-500 bg-primary-500/10': selectedAnswer === 'D' && !hasAnswered,
                'border-green-500 bg-green-500/10': hasAnswered && question.correct_answer === 'D',
                'border-red-500 bg-red-500/10': hasAnswered && selectedAnswer === 'D' && !isCorrect,
                'border-dark-700 hover:border-dark-600': !hasAnswered && selectedAnswer !== 'D',
                'border-dark-700': hasAnswered && selectedAnswer !== 'D' && question.correct_answer !== 'D',
                'cursor-not-allowed opacity-50': hasAnswered
              }"
            >
              <div class="flex items-start gap-3">
                <span class="font-bold text-white">D)</span>
                <span class="text-gray-200 flex-1">{{ question.option_d }}</span>
                <span v-if="hasAnswered && question.correct_answer === 'D'" class="text-green-400">✓</span>
                <span v-if="hasAnswered && selectedAnswer === 'D' && !isCorrect" class="text-red-400">✗</span>
              </div>
            </button>

            <!-- Opção E (se existir) -->
            <button
              v-if="question.option_e"
              @click="!hasAnswered && (selectedAnswer = 'E')"
              :disabled="hasAnswered"
              class="w-full text-left p-4 rounded-lg border transition-all"
              :class="{
                'border-primary-500 bg-primary-500/10': selectedAnswer === 'E' && !hasAnswered,
                'border-green-500 bg-green-500/10': hasAnswered && question.correct_answer === 'E',
                'border-red-500 bg-red-500/10': hasAnswered && selectedAnswer === 'E' && !isCorrect,
                'border-dark-700 hover:border-dark-600': !hasAnswered && selectedAnswer !== 'E',
                'border-dark-700': hasAnswered && selectedAnswer !== 'E' && question.correct_answer !== 'E',
                'cursor-not-allowed opacity-50': hasAnswered
              }"
            >
              <div class="flex items-start gap-3">
                <span class="font-bold text-white">E)</span>
                <span class="text-gray-200 flex-1">{{ question.option_e }}</span>
                <span v-if="hasAnswered && question.correct_answer === 'E'" class="text-green-400">✓</span>
                <span v-if="hasAnswered && selectedAnswer === 'E' && !isCorrect" class="text-red-400">✗</span>
              </div>
            </button>
          </div>

          <!-- Botão Responder -->
          <div v-if="!hasAnswered" class="mt-6">
            <button
              @click="submitAnswer"
              :disabled="!selectedAnswer"
              class="w-full px-6 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar Resposta
            </button>
          </div>

          <!-- Feedback -->
          <div v-if="hasAnswered" class="mt-6">
            <div
              class="p-4 rounded-lg border"
              :class="isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'"
            >
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{{ isCorrect ? '✓' : '✗' }}</span>
                <span class="text-lg font-semibold" :class="isCorrect ? 'text-green-400' : 'text-red-400'">
                  {{ isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta' }}
                </span>
              </div>
              <p class="text-gray-300">
                {{ isCorrect ? 'Parabéns! Continue assim.' : `A resposta correta é: ${question.correct_answer}` }}
              </p>
            </div>

            <button
              @click="tryAgain"
              class="w-full mt-4 px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>

        <!-- Explicação -->
        <div v-if="question.explanation && showExplanation" class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700">
          <h3 class="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Explicação</span>
          </h3>
          <p class="text-gray-200 leading-relaxed whitespace-pre-line">
            {{ question.explanation }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

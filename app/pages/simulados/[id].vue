<script setup lang="ts">
/**
 * Realizar Simulado Page
 *
 * Interface para realizar simulado com cronômetro
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

const examId = route.params.id as string

// Estado
const exam = ref<any>(null)
const questions = ref([])
const answers = ref<Record<string, string>>({})
const loading = ref(true)
const timeLeft = ref(0)
const timerInterval = ref<any>(null)
const showResults = ref(false)
const results = ref<any>(null)

// Carregar simulado
const loadExam = async () => {
  loading.value = true

  try {
    // Carregar simulado
    const { data: examData, error: examError } = await client
      .from('exams')
      .select('*')
      .eq('id', examId)
      .eq('user_id', user.value?.id)
      .single()

    if (examError) throw examError

    exam.value = examData

    // Se já foi concluído, carregar resultados
    if (exam.value.status === 'completed') {
      await loadResults()
      return
    }

    // Carregar questões do simulado
    const { data: questionsData, error: questionsError } = await client
      .from('exam_questions')
      .select(`
        *,
        questions(*)
      `)
      .eq('exam_id', examId)
      .order('order_index')

    if (questionsError) throw questionsError

    questions.value = questionsData || []

    // Iniciar timer se não iniciado
    if (exam.value.status === 'not_started') {
      await startExam()
    } else {
      // Calcular tempo restante
      const startedAt = new Date(exam.value.started_at).getTime()
      const durationMs = exam.value.duration_minutes * 60 * 1000
      const elapsed = Date.now() - startedAt
      timeLeft.value = Math.max(0, Math.floor((durationMs - elapsed) / 1000))
    }

    startTimer()

  } catch (error) {
    console.error('Erro ao carregar simulado:', error)
    router.push('/simulados')
  } finally {
    loading.value = false
  }
}

// Iniciar simulado
const startExam = async () => {
  await client
    .from('exams')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', examId)

  timeLeft.value = exam.value.duration_minutes * 60
}

// Timer
const startTimer = () => {
  if (timerInterval.value) clearInterval(timerInterval.value)

  timerInterval.value = setInterval(() => {
    timeLeft.value--

    if (timeLeft.value <= 0) {
      finishExam()
    }
  }, 1000)
}

// Formatar tempo
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Finalizar simulado
const finishExam = async () => {
  if (timerInterval.value) clearInterval(timerInterval.value)

  try {
    // Calcular pontuação
    let correct = 0
    const total = questions.value.length

    questions.value.forEach((q: any) => {
      const userAnswer = answers.value[q.question_id]
      if (userAnswer === q.questions.correct_answer) {
        correct++
      }
    })

    const score = Math.round((correct / total) * 100)

    // Salvar resultado
    const { data: resultData, error: resultError } = await client
      .from('exam_results')
      .insert({
        exam_id: examId,
        user_id: user.value?.id,
        score,
        correct_answers: correct,
        total_questions: total,
        time_spent_minutes: Math.floor((exam.value.duration_minutes * 60 - timeLeft.value) / 60),
        answers: answers.value
      })
      .select()
      .single()

    if (resultError) throw resultError

    // Atualizar status do exame
    await client
      .from('exams')
      .update({ status: 'completed' })
      .eq('id', examId)

    results.value = resultData
    showResults.value = true

  } catch (error) {
    console.error('Erro ao finalizar simulado:', error)
  }
}

// Carregar resultados
const loadResults = async () => {
  const { data, error } = await client
    .from('exam_results')
    .select('*')
    .eq('exam_id', examId)
    .single()

  if (!error && data) {
    results.value = data
    showResults.value = true
  }
}

// Lifecycle
onMounted(() => {
  loadExam()
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
    <div class="max-w-5xl mx-auto">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-400 mt-4">Carregando simulado...</p>
      </div>

      <!-- Resultados -->
      <div v-else-if="showResults && results" class="text-center py-12">
        <div class="bg-dark-800/50 backdrop-blur rounded-2xl p-12 border border-dark-700 max-w-2xl mx-auto">
          <div class="text-6xl mb-6">{{ results.score >= 70 ? '🎉' : results.score >= 50 ? '👍' : '📚' }}</div>
          <h2 class="text-3xl font-bold text-white mb-4">Simulado Concluído!</h2>

          <div class="text-6xl font-bold mb-4" :class="results.score >= 70 ? 'text-green-400' : results.score >= 50 ? 'text-yellow-400' : 'text-red-400'">
            {{ results.score }}%
          </div>

          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-dark-900 rounded-lg p-4">
              <div class="text-2xl font-bold text-white">{{ results.correct_answers }}</div>
              <div class="text-sm text-gray-400">Acertos</div>
            </div>
            <div class="bg-dark-900 rounded-lg p-4">
              <div class="text-2xl font-bold text-white">{{ results.total_questions - results.correct_answers }}</div>
              <div class="text-sm text-gray-400">Erros</div>
            </div>
            <div class="bg-dark-900 rounded-lg p-4">
              <div class="text-2xl font-bold text-white">{{ results.time_spent_minutes }}min</div>
              <div class="text-sm text-gray-400">Tempo</div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button
              @click="router.push('/simulados')"
              class="px-8 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      <!-- Realizar Simulado -->
      <div v-else-if="exam">
        <!-- Header com Timer -->
        <div class="bg-dark-800/50 backdrop-blur rounded-xl p-4 border border-dark-700 mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-white">{{ exam.title }}</h1>
            <p class="text-sm text-gray-400">{{ questions.length }} questões</p>
          </div>

          <div class="text-center">
            <div class="text-3xl font-bold" :class="timeLeft < 300 ? 'text-red-400' : 'text-white'">
              {{ formatTime(timeLeft) }}
            </div>
            <div class="text-sm text-gray-400">Tempo Restante</div>
          </div>
        </div>

        <!-- Questões -->
        <div class="space-y-6">
          <div v-for="(examQuestion, index) in questions" :key="examQuestion.id" class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700">
            <div class="flex items-start gap-4 mb-4">
              <div class="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="text-white mb-4">{{ examQuestion.questions.question_text }}</p>

                <!-- Alternativas -->
                <div class="space-y-2">
                  <button
                    v-for="option in ['A', 'B', 'C', 'D', 'E'].filter(o => examQuestion.questions[`option_${o.toLowerCase()}`])"
                    :key="option"
                    @click="answers[examQuestion.question_id] = option"
                    class="w-full text-left p-3 rounded-lg border transition-all"
                    :class="answers[examQuestion.question_id] === option
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 hover:border-dark-600'"
                  >
                    <span class="font-bold text-white mr-2">{{ option }})</span>
                    <span class="text-gray-200">{{ examQuestion.questions[`option_${option.toLowerCase()}`] }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botão Finalizar -->
        <div class="mt-8 bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700 flex items-center justify-between">
          <div class="text-gray-400">
            {{ Object.keys(answers).length }} de {{ questions.length }} questões respondidas
          </div>
          <button
            @click="finishExam"
            class="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Finalizar Simulado
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

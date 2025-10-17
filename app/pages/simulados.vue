<script setup lang="ts">
/**
 * Simulados Page
 *
 * Lista simulados e permite criar novos
 *
 * @author Claude Code
 * @date 2025-10-17
 */

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const router = useRouter()
const client = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const exams = ref([])
const loading = ref(true)
const showCreateModal = ref(false)

// Form para novo simulado
const newExam = ref({
  title: '',
  subject_ids: [] as string[],
  question_count: 20,
  duration_minutes: 60
})

const subjects = ref([])

// Carregar matérias
const loadSubjects = async () => {
  const { data } = await client
    .from('subjects')
    .select('id, name, color, icon')
    .eq('user_id', user.value?.id)
    .order('name')

  subjects.value = data || []
}

// Carregar simulados
const loadExams = async () => {
  loading.value = true

  try {
    const { data, error } = await client
      .from('exams')
      .select(`
        *,
        exam_results(score, completed_at)
      `)
      .eq('user_id', user.value?.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    exams.value = data || []

  } catch (error) {
    console.error('Erro ao carregar simulados:', error)
  } finally {
    loading.value = false
  }
}

// Criar simulado
const createExam = async () => {
  if (!newExam.value.title || newExam.value.subject_ids.length === 0) {
    alert('Preencha título e selecione ao menos uma matéria')
    return
  }

  try {
    const { data, error } = await client
      .from('exams')
      .insert({
        user_id: user.value?.id,
        title: newExam.value.title,
        subject_ids: newExam.value.subject_ids,
        question_count: newExam.value.question_count,
        duration_minutes: newExam.value.duration_minutes,
        status: 'not_started'
      })
      .select()
      .single()

    if (error) throw error

    // Redirecionar para o simulado
    router.push(`/simulados/${data.id}`)

  } catch (error) {
    console.error('Erro ao criar simulado:', error)
    alert('Erro ao criar simulado')
  }
}

// Toggle subject selection
const toggleSubject = (subjectId: string) => {
  const index = newExam.value.subject_ids.indexOf(subjectId)
  if (index > -1) {
    newExam.value.subject_ids.splice(index, 1)
  } else {
    newExam.value.subject_ids.push(subjectId)
  }
}

// Formatar duração
const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

// Status do simulado
const getExamStatus = (exam: any) => {
  if (exam.status === 'completed') {
    const result = exam.exam_results?.[0]
    return {
      text: 'Concluído',
      color: 'green',
      score: result?.score || 0
    }
  }
  if (exam.status === 'in_progress') {
    return { text: 'Em andamento', color: 'yellow' }
  }
  return { text: 'Não iniciado', color: 'gray' }
}

// Lifecycle
onMounted(() => {
  loadSubjects()
  loadExams()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">📝 Simulados</h1>
          <p class="text-gray-400">Pratique com simulados personalizados</p>
        </div>

        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Novo Simulado</span>
        </button>
      </div>

      <!-- Lista de Simulados -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-400 mt-4">Carregando simulados...</p>
      </div>

      <div v-else-if="exams.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl text-white mb-2">Nenhum simulado criado</h3>
        <p class="text-gray-400 mb-6">Crie seu primeiro simulado para começar a praticar!</p>
        <button
          @click="showCreateModal = true"
          class="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          ➕ Criar Simulado
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="exam in exams"
          :key="exam.id"
          class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all cursor-pointer"
          @click="router.push(`/simulados/${exam.id}`)"
        >
          <!-- Título -->
          <h3 class="text-lg font-semibold text-white mb-3">{{ exam.title }}</h3>

          <!-- Info -->
          <div class="space-y-2 text-sm text-gray-400 mb-4">
            <div class="flex items-center gap-2">
              <span>📊</span>
              <span>{{ exam.question_count }} questões</span>
            </div>
            <div class="flex items-center gap-2">
              <span>⏱️</span>
              <span>{{ formatDuration(exam.duration_minutes) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span>📅</span>
              <span>{{ new Date(exam.created_at).toLocaleDateString('pt-BR') }}</span>
            </div>
          </div>

          <!-- Status -->
          <div class="flex items-center justify-between">
            <span
              class="px-3 py-1 rounded-full text-sm"
              :class="{
                'bg-green-500/20 text-green-400': getExamStatus(exam).color === 'green',
                'bg-yellow-500/20 text-yellow-400': getExamStatus(exam).color === 'yellow',
                'bg-gray-500/20 text-gray-400': getExamStatus(exam).color === 'gray'
              }"
            >
              {{ getExamStatus(exam).text }}
            </span>

            <span v-if="exam.status === 'completed' && getExamStatus(exam).score" class="text-white font-semibold">
              {{ getExamStatus(exam).score }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Criar Simulado -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-dark-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-dark-700">
        <h2 class="text-2xl font-bold text-white mb-6">➕ Criar Novo Simulado</h2>

        <div class="space-y-6">
          <!-- Título -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Título do Simulado</label>
            <input
              v-model="newExam.title"
              type="text"
              placeholder="Ex: Simulado de Direito Constitucional"
              class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
            >
          </div>

          <!-- Matérias -->
          <div>
            <label class="block text-sm text-gray-400 mb-3">Matérias (selecione uma ou mais)</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="subject in subjects"
                :key="subject.id"
                type="button"
                @click="toggleSubject(subject.id)"
                class="px-4 py-3 rounded-lg border transition-all text-left"
                :class="newExam.subject_ids.includes(subject.id)
                  ? 'border-primary-500 bg-primary-500/20'
                  : 'border-dark-700 bg-dark-900 hover:border-dark-600'"
              >
                <span class="text-white">{{ subject.icon }} {{ subject.name }}</span>
              </button>
            </div>
          </div>

          <!-- Quantidade de Questões -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Quantidade de Questões</label>
            <input
              v-model.number="newExam.question_count"
              type="number"
              min="5"
              max="100"
              class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
            >
          </div>

          <!-- Duração -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Duração (minutos)</label>
            <input
              v-model.number="newExam.duration_minutes"
              type="number"
              min="10"
              max="240"
              step="10"
              class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none"
            >
            <p class="text-sm text-gray-500 mt-1">{{ formatDuration(newExam.duration_minutes) }}</p>
          </div>

          <!-- Botões -->
          <div class="flex gap-4 pt-4">
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="createExam"
              class="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
            >
              Criar Simulado
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

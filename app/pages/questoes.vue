<script setup lang="ts">
/**
 * Banco de Questões Page
 *
 * Lista e gerencia questões de concursos
 * Filtros por matéria, ano, banca, dificuldade
 *
 * @author Claude Code
 * @date 2025-10-17
 */

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const client = useSupabaseClient()
const user = useSupabaseUser()

// Estado
const questions = ref([])
const loading = ref(true)
const selectedSubject = ref<string | null>(null)
const selectedYear = ref<number | null>(null)
const selectedBanca = ref<string | null>(null)
const selectedDifficulty = ref<string | null>(null)
const searchQuery = ref('')
const showFilters = ref(false)

// Paginação
const page = ref(1)
const perPage = ref(20)
const totalQuestions = ref(0)

// Subjects para filtro
const subjects = ref([])

// Bancas comuns
const bancas = [
  'CESPE/CEBRASPE',
  'FCC',
  'FGV',
  'VUNESP',
  'IBFC',
  'CESGRANRIO',
  'Quadrix',
  'AOCP',
  'IADES',
  'Outras'
]

// Carregar matérias
const loadSubjects = async () => {
  const { data } = await client
    .from('subjects')
    .select('id, name, color, icon')
    .eq('user_id', user.value?.id)
    .order('name')

  subjects.value = data || []
}

// Carregar questões
const loadQuestions = async () => {
  loading.value = true

  try {
    let query = client
      .from('questions')
      .select('*, subjects(name, color), question_attempts(is_correct)', { count: 'exact' })
      .eq('user_id', user.value?.id)

    // Aplicar filtros
    if (selectedSubject.value) {
      query = query.eq('subject_id', selectedSubject.value)
    }
    if (selectedYear.value) {
      query = query.eq('year', selectedYear.value)
    }
    if (selectedBanca.value) {
      query = query.eq('exam_source', selectedBanca.value)
    }
    if (selectedDifficulty.value) {
      query = query.eq('difficulty', selectedDifficulty.value)
    }
    if (searchQuery.value) {
      query = query.ilike('question_text', `%${searchQuery.value}%`)
    }

    // Paginação
    const start = (page.value - 1) * perPage.value
    const end = start + perPage.value - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) throw error

    questions.value = data || []
    totalQuestions.value = count || 0

  } catch (error) {
    console.error('Erro ao carregar questões:', error)
  } finally {
    loading.value = false
  }
}

// Calcular estatísticas de uma questão
const getQuestionStats = (question: any) => {
  const attempts = question.question_attempts || []
  const correct = attempts.filter((a: any) => a.is_correct).length
  const total = attempts.length
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0

  return { correct, total, rate }
}

// Marcar como favorita
const toggleFavorite = async (questionId: string, isFavorite: boolean) => {
  const { error } = await client
    .from('questions')
    .update({ is_favorite: !isFavorite })
    .eq('id', questionId)

  if (!error) {
    await loadQuestions()
  }
}

// Limpar filtros
const clearFilters = () => {
  selectedSubject.value = null
  selectedYear.value = null
  selectedBanca.value = null
  selectedDifficulty.value = null
  searchQuery.value = ''
  page.value = 1
  loadQuestions()
}

// Navegação de página
const goToPage = (newPage: number) => {
  page.value = newPage
  loadQuestions()
}

// Computed
const totalPages = computed(() => Math.ceil(totalQuestions.value / perPage.value))
const hasFilters = computed(() =>
  selectedSubject.value || selectedYear.value || selectedBanca.value ||
  selectedDifficulty.value || searchQuery.value
)

// Lifecycle
onMounted(() => {
  loadSubjects()
  loadQuestions()
})

// Watchers
watch([selectedSubject, selectedYear, selectedBanca, selectedDifficulty], () => {
  page.value = 1
  loadQuestions()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-6">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white mb-2">📚 Banco de Questões</h1>
          <p class="text-gray-400">
            {{ totalQuestions }} questões disponíveis
          </p>
        </div>

        <NuxtLink
          to="/questoes/nova"
          class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Nova Questão</span>
        </NuxtLink>
      </div>

      <!-- Barra de Busca -->
      <div class="bg-dark-800/50 backdrop-blur rounded-xl p-4 border border-dark-700">
        <div class="flex gap-4">
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por texto da questão..."
              class="w-full px-4 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500 focus:outline-none pl-10"
              @keyup.enter="loadQuestions"
            >
            <span class="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
          </div>

          <button
            @click="showFilters = !showFilters"
            class="px-6 py-3 bg-dark-900 text-white rounded-lg border border-dark-700 hover:border-primary-500 transition-colors flex items-center gap-2"
          >
            <span>🎯</span>
            <span>Filtros</span>
            <span v-if="hasFilters" class="w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>

          <button
            @click="loadQuestions"
            class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Buscar
          </button>
        </div>

        <!-- Filtros Expandidos -->
        <div v-if="showFilters" class="mt-4 pt-4 border-t border-dark-700 grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Matéria -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Matéria</label>
            <select
              v-model="selectedSubject"
              class="w-full px-3 py-2 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500"
            >
              <option :value="null">Todas</option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.icon }} {{ subject.name }}
              </option>
            </select>
          </div>

          <!-- Ano -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Ano</label>
            <input
              v-model.number="selectedYear"
              type="number"
              placeholder="Ex: 2024"
              min="2000"
              max="2025"
              class="w-full px-3 py-2 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500"
            >
          </div>

          <!-- Banca -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Banca</label>
            <select
              v-model="selectedBanca"
              class="w-full px-3 py-2 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500"
            >
              <option :value="null">Todas</option>
              <option v-for="banca in bancas" :key="banca" :value="banca">
                {{ banca }}
              </option>
            </select>
          </div>

          <!-- Dificuldade -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">Dificuldade</label>
            <select
              v-model="selectedDifficulty"
              class="w-full px-3 py-2 bg-dark-900 text-white rounded-lg border border-dark-700 focus:border-primary-500"
            >
              <option :value="null">Todas</option>
              <option value="easy">Fácil</option>
              <option value="medium">Médio</option>
              <option value="hard">Difícil</option>
            </select>
          </div>

          <!-- Botão Limpar -->
          <div class="md:col-span-4 flex justify-end">
            <button
              v-if="hasFilters"
              @click="clearFilters"
              class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              🔄 Limpar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de Questões -->
    <div class="max-w-7xl mx-auto">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-400 mt-4">Carregando questões...</p>
      </div>

      <div v-else-if="questions.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl text-white mb-2">Nenhuma questão encontrada</h3>
        <p class="text-gray-400 mb-6">
          {{ hasFilters ? 'Tente ajustar os filtros' : 'Adicione sua primeira questão!' }}
        </p>
        <NuxtLink
          to="/questoes/nova"
          class="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          ➕ Adicionar Questão
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <!-- Card de Questão -->
        <div
          v-for="question in questions"
          :key="question.id"
          class="bg-dark-800/50 backdrop-blur rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <!-- Metadados -->
              <div class="flex items-center gap-3 mb-3">
                <span
                  v-if="question.subjects"
                  class="px-3 py-1 rounded-full text-sm"
                  :style="{ backgroundColor: question.subjects.color + '20', color: question.subjects.color }"
                >
                  {{ question.subjects.name }}
                </span>
                <span v-if="question.exam_source" class="text-sm text-gray-400">
                  {{ question.exam_source }}
                </span>
                <span v-if="question.year" class="text-sm text-gray-400">
                  {{ question.year }}
                </span>
                <span
                  v-if="question.difficulty"
                  class="px-2 py-1 rounded text-xs"
                  :class="{
                    'bg-green-500/20 text-green-400': question.difficulty === 'easy',
                    'bg-yellow-500/20 text-yellow-400': question.difficulty === 'medium',
                    'bg-red-500/20 text-red-400': question.difficulty === 'hard'
                  }"
                >
                  {{ question.difficulty === 'easy' ? 'Fácil' : question.difficulty === 'medium' ? 'Médio' : 'Difícil' }}
                </span>
              </div>

              <!-- Texto da Questão -->
              <p class="text-white mb-4 line-clamp-3">
                {{ question.question_text }}
              </p>

              <!-- Estatísticas -->
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-2 text-gray-400">
                  <span>📊</span>
                  <span>{{ getQuestionStats(question).total }} tentativas</span>
                </div>
                <div
                  v-if="getQuestionStats(question).total > 0"
                  class="flex items-center gap-2"
                  :class="getQuestionStats(question).rate >= 70 ? 'text-green-400' : 'text-yellow-400'"
                >
                  <span>{{ getQuestionStats(question).rate }}% acerto</span>
                </div>
              </div>
            </div>

            <!-- Ações -->
            <div class="flex items-center gap-2">
              <button
                @click="toggleFavorite(question.id, question.is_favorite)"
                class="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                :class="question.is_favorite ? 'text-yellow-400' : 'text-gray-400'"
              >
                {{ question.is_favorite ? '⭐' : '☆' }}
              </button>
              <NuxtLink
                :to="`/questoes/${question.id}`"
                class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Responder
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Paginação -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
          <button
            @click="goToPage(page - 1)"
            :disabled="page === 1"
            class="px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <span class="text-gray-400">
            Página {{ page }} de {{ totalPages }}
          </span>

          <button
            @click="goToPage(page + 1)"
            :disabled="page === totalPages"
            class="px-4 py-2 bg-dark-800 text-white rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<template>
  <div class="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
    <!-- Header -->
    <header class="border-b border-dark-700 bg-dark-900/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg"></div>
          <div>
            <h1 class="text-xl font-bold text-white">Dashboard</h1>
            <p class="text-xs text-gray-400">Bem-vindo, {{ userData?.full_name || 'Estudante' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-xs px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full border border-primary-500/30">
            {{ subscriptionType === 'premium' ? '⭐ Premium' : 'Freemium' }}
          </span>
          <button
            @click="handleSignOut"
            class="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Tempo Hoje</p>
              <p class="text-2xl font-bold text-white">{{ formatHM(dailyStudySeconds) }}</p>
              <p class="text-xs text-primary-400 mt-1">+{{ formatHM(weeklyStudySeconds) }} esta semana</p>
            </div>
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 hover:border-orange-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Revisões Pendentes</p>
              <p class="text-2xl font-bold text-white">{{ revisionsPending }}</p>
              <p class="text-xs text-orange-400 mt-1">{{ urgentRevisions }} urgentes</p>
            </div>
            <div class="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 hover:border-primary-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Matérias Ativas</p>
              <p class="text-2xl font-bold text-white">{{ subjectsCount }}</p>
              <p class="text-xs text-primary-400 mt-1">{{ studyGoalsCount }} metas definidas</p>
            </div>
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 hover:border-yellow-500/50 transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Sequência</p>
              <p class="text-2xl font-bold text-white">{{ studyStreak }}</p>
              <p class="text-xs text-yellow-400 mt-1">dias consecutivos 🔥</p>
            </div>
            <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Weekly Progress Chart -->
        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Progresso Semanal</h3>
          <div class="h-64">
            <canvas ref="weeklyChart"></canvas>
          </div>
        </div>

        <!-- Subject Distribution Chart -->
        <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Distribuição por Matéria</h3>
          <div class="h-64">
            <canvas ref="subjectChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-white">Mural de Tarefas</h3>
          <button
            @click="showAddTaskModal = true"
            class="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nova Tarefa
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- To Do Column -->
          <div class="bg-dark-900/50 border border-dark-700 rounded-lg p-4">
            <h4 class="font-medium text-white mb-4 flex items-center gap-2">
              <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
              A Fazer ({{ todoTasks.length }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="task in todoTasks"
                :key="task.id"
                class="bg-dark-800 p-4 rounded-lg border border-dark-700 cursor-pointer hover:border-primary-500/50 transition"
                @click="editTask(task)"
              >
                <h5 class="font-medium text-white mb-2">{{ task.title }}</h5>
                <p class="text-sm text-gray-400 mb-3">{{ task.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full">{{ task.subject }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(task.due_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
            <h4 class="font-medium text-white mb-4 flex items-center gap-2">
              <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
              Em Progresso ({{ inProgressTasks.length }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="task in inProgressTasks"
                :key="task.id"
                class="bg-dark-800 p-4 rounded-lg border border-dark-700 cursor-pointer hover:border-primary-500/50 transition"
                @click="editTask(task)"
              >
                <h5 class="font-medium text-white mb-2">{{ task.title }}</h5>
                <p class="text-sm text-gray-400 mb-3">{{ task.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full">{{ task.subject }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(task.due_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Done Column -->
          <div class="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
            <h4 class="font-medium text-white mb-4 flex items-center gap-2">
              <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
              Concluído ({{ doneTasks.length }})
            </h4>
            <div class="space-y-3">
              <div
                v-for="task in doneTasks"
                :key="task.id"
                class="bg-dark-800 p-4 rounded-lg border border-dark-700 cursor-pointer hover:border-primary-500/50 transition opacity-75"
                @click="editTask(task)"
              >
                <h5 class="font-medium text-white mb-2">{{ task.title }}</h5>
                <p class="text-sm text-gray-400 mb-3">{{ task.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full">{{ task.subject }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(task.completed_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <NuxtLink to="/calendar" class="p-4 border-2 border-dark-700 rounded-lg hover:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p class="font-semibold text-white">Calendário</p>
          </NuxtLink>

          <NuxtLink to="/reports" class="p-4 border-2 border-dark-700 rounded-lg hover:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <p class="font-semibold text-white">Relatórios</p>
          </NuxtLink>

          <NuxtLink to="/onboarding" class="p-4 border-2 border-dark-700 rounded-lg hover:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <p class="font-semibold text-white">Configurar Meta</p>
          </NuxtLink>

          <NuxtLink to="/subjects" class="p-4 border-2 border-dark-700 rounded-lg hover:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <p class="font-semibold text-white">Gerenciar Matérias</p>
          </NuxtLink>

          <NuxtLink to="/study" class="p-4 border-2 border-dark-700 rounded-lg hover:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="font-semibold text-white">Iniciar Estudo</p>
          </NuxtLink>

          <NuxtLink to="/notebook" class="p-4 border-2 border-dark-700 rounded-lg hover:border-primary-500 hover:bg-primary-500/10 transition text-center group">
            <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/30 transition">
              <svg class="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
            <p class="font-semibold text-white">Caderno Virtual</p>
          </NuxtLink>
        </div>
      </div>

      <!-- Task Modal -->
      <div v-if="showAddTaskModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-dark-800 border border-dark-700 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-white mb-4">{{ editingTask ? 'Editar Tarefa' : 'Nova Tarefa' }}</h3>

          <form @submit.prevent="saveTask">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Título</label>
                <input
                  v-model="taskForm.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Digite o título da tarefa"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
                <textarea
                  v-model="taskForm.description"
                  rows="3"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descreva a tarefa"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Matéria</label>
                <select
                  v-model="taskForm.subject"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecione uma matéria</option>
                  <option v-for="subject in subjects" :key="subject.id" :value="subject.name">
                    {{ subject.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Data de Vencimento</label>
                <input
                  v-model="taskForm.due_date"
                  type="date"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
              </div>

              <div v-if="editingTask">
                <label class="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  v-model="taskForm.status"
                  class="w-full px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="todo">A Fazer</option>
                  <option value="in_progress">Em Progresso</option>
                  <option value="done">Concluído</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closeTaskModal"
                class="px-4 py-2 text-gray-400 hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button
                v-if="editingTask"
                type="button"
                @click="deleteTask"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Excluir
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition"
              >
                {{ editingTask ? 'Salvar' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'

definePageMeta({
  middleware: 'auth'
})

Chart.register(...registerables)

const { signOut } = useAuth()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

// Basic data
const userData = ref<any>(null)
const subscriptionType = ref('freemium')

// Enhanced statistics
const dailyStudySeconds = ref(0)
const weeklyStudySeconds = ref(0)
const subjectsCount = ref(0)
const studyGoalsCount = ref(0)
const revisionsPending = ref(0)
const urgentRevisions = ref(0)
const studyStreak = ref(0)

// Chart refs
const weeklyChart = ref<HTMLCanvasElement>()
const subjectChart = ref<HTMLCanvasElement>()

// Kanban data
const tasks = ref<any[]>([])
const subjects = ref<any[]>([])
const showAddTaskModal = ref(false)
const editingTask = ref<any>(null)
const taskForm = ref({
  title: '',
  description: '',
  subject: '',
  due_date: '',
  status: 'todo'
})

// Computed properties for Kanban columns
const todoTasks = computed(() => tasks.value.filter(task => task.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter(task => task.status === 'in_progress'))
const doneTasks = computed(() => tasks.value.filter(task => task.status === 'done'))

const formatHM = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Buscar dados do usuário e estatísticas
onMounted(async () => {
  if (user.value) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (data) {
      userData.value = data
      subscriptionType.value = data.subscription_type || 'freemium'
      await loadStats()
      await loadTasks()
      await loadSubjects()
      await initCharts()
    }
  }
})

const loadStats = async () => {
  if (!user.value) return

  // Subjects count
  const { count } = await supabase
    .from('subjects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.value.id)
  subjectsCount.value = count || 0

  // Study goals count
  const { count: goalsCount } = await supabase
    .from('study_goals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.value.id)
  studyGoalsCount.value = goalsCount || 0

  // Daily study time
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: dailySessions } = await supabase
    .from('study_sessions')
    .select('duration, started_at')
    .eq('user_id', user.value.id)
    .gte('started_at', today.toISOString())

  dailyStudySeconds.value = (dailySessions || []).reduce((sum: number, s: any) => sum + (s.duration || 0), 0)

  // Weekly study time
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const { data: weeklySessions } = await supabase
    .from('study_sessions')
    .select('duration, started_at')
    .eq('user_id', user.value.id)
    .gte('started_at', weekStart.toISOString())

  weeklyStudySeconds.value = (weeklySessions || []).reduce((sum: number, s: any) => sum + (s.duration || 0), 0)

  // Revisions
  const now = new Date()
  const { count: pendingCount } = await supabase
    .from('revisions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.value.id)
    .eq('status', 'pending')
    .lte('scheduled_date', now.toISOString())

  revisionsPending.value = pendingCount || 0

  // Urgent revisions (due today)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const { count: urgentCount } = await supabase
    .from('revisions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.value.id)
    .eq('status', 'pending')
    .lte('scheduled_date', tomorrow.toISOString())

  urgentRevisions.value = urgentCount || 0

  // Study streak calculation
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  while (true) {
    const nextDay = new Date(currentDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const { data: daySession } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('user_id', user.value.id)
      .gte('started_at', currentDate.toISOString())
      .lt('started_at', nextDay.toISOString())
      .limit(1)

    if (daySession && daySession.length > 0) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  studyStreak.value = streak
}

const loadTasks = async () => {
  if (!user.value) return

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })

  tasks.value = data || []
}

const loadSubjects = async () => {
  if (!user.value) return

  const { data } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user.value.id)
    .order('name')

  subjects.value = data || []
}

const initCharts = async () => {
  await nextTick()

  // Weekly Progress Chart
  if (weeklyChart.value) {
    const weeklyData = await getWeeklyStudyData()
    new Chart(weeklyChart.value, {
      type: 'line',
      data: {
        labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        datasets: [{
          label: 'Horas de Estudo',
          data: weeklyData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#9CA3AF',
              callback: function(value) {
                return value + 'h'
              }
            },
            grid: {
              color: '#374151'
            }
          },
          x: {
            ticks: {
              color: '#9CA3AF'
            },
            grid: {
              color: '#374151'
            }
          }
        }
      }
    })
  }

  // Subject Distribution Chart
  if (subjectChart.value) {
    const subjectData = await getSubjectStudyData()
    new Chart(subjectChart.value, {
      type: 'doughnut',
      data: {
        labels: subjectData.labels,
        datasets: [{
          data: subjectData.data,
          backgroundColor: [
            '#22C55E', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9CA3AF'
            }
          }
        }
      }
    })
  }
}

const getWeeklyStudyData = async () => {
  if (!user.value) return Array(7).fill(0)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weeklyData = []

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(weekStart)
    dayStart.setDate(dayStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('duration')
      .eq('user_id', user.value.id)
      .gte('started_at', dayStart.toISOString())
      .lt('started_at', dayEnd.toISOString())

    const totalSeconds = (sessions || []).reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
    weeklyData.push(Math.round(totalSeconds / 3600 * 10) / 10)
  }

  return weeklyData
}

const getSubjectStudyData = async () => {
  if (!user.value) return { labels: [], data: [] }

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('duration, subject_id, subjects(name)')
    .eq('user_id', user.value.id)
    .not('subject_id', 'is', null)

  const subjectTotals: { [key: string]: number } = {}

  sessions?.forEach((session: any) => {
    const subjectName = session.subjects?.name || 'Sem matéria'
    subjectTotals[subjectName] = (subjectTotals[subjectName] || 0) + (session.duration || 0)
  })

  const labels = Object.keys(subjectTotals)
  const data = Object.values(subjectTotals).map(seconds => Math.round(seconds / 3600 * 10) / 10)

  return { labels, data }
}

// Task management functions
const editTask = (task: any) => {
  editingTask.value = task
  taskForm.value = {
    title: task.title,
    description: task.description || '',
    subject: task.subject || '',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    status: task.status
  }
  showAddTaskModal.value = true
}

const closeTaskModal = () => {
  showAddTaskModal.value = false
  editingTask.value = null
  taskForm.value = {
    title: '',
    description: '',
    subject: '',
    due_date: '',
    status: 'todo'
  }
}

const saveTask = async () => {
  if (!user.value || !taskForm.value.title.trim()) return

  const taskData = {
    title: taskForm.value.title.trim(),
    description: taskForm.value.description.trim(),
    subject: taskForm.value.subject,
    due_date: taskForm.value.due_date || null,
    status: taskForm.value.status,
    user_id: user.value.id
  }

  if (editingTask.value) {
    // Update existing task
    const { error } = await supabase
      .from('tasks')
      .update(taskData)
      .eq('id', editingTask.value.id)

    if (!error) {
      const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
      if (index !== -1) {
        tasks.value[index] = { ...editingTask.value, ...taskData }
      }
    }
  } else {
    // Create new task
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()

    if (!error && data) {
      tasks.value.unshift(data)
    }
  }

  closeTaskModal()
}

const deleteTask = async () => {
  if (!editingTask.value) return

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', editingTask.value.id)

  if (!error) {
    tasks.value = tasks.value.filter(t => t.id !== editingTask.value.id)
  }

  closeTaskModal()
}

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Erro ao sair:', error)
  }
}
</script>

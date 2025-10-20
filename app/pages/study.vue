<template>
  <div class="min-h-screen bg-[#faf9f5] dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">


    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Timer Card (Main) -->
        <div class="lg:col-span-2">
          <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-2xl overflow-hidden">
            <!-- Subject Selection -->
            <div class="p-6 border-b border-dark-700">
              <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-3">Matéria de estudo</label>
              <div class="relative">
                <select
                  v-model="selectedSubjectId"
                  class="w-full px-4 py-3 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="" disabled>Escolha uma matéria...</option>
                  <option v-for="s in subjects" :key="s.id" :value="s.id">
                    {{ s.name }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-5 h-5 text-claude-text-secondary dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Timer Display -->
            <div class="p-12 text-center bg-[#e4f3e6] dark:bg-gradient-to-br dark:from-dark-900 dark:to-dark-800 relative overflow-hidden">
              <!-- Background decoration -->
              <div class="absolute inset-0 opacity-5">
                <div class="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full filter blur-3xl"></div>
                <div class="absolute bottom-0 right-0 w-64 h-64 bg-primary-600 rounded-full filter blur-3xl"></div>
              </div>

              <div class="relative z-10">
                <!-- Timer -->
                <div class="mb-8">
                  <div class="text-7xl md:text-8xl font-mono font-bold text-[#cb785b] dark:text-white mb-4 tracking-tight">
                    {{ formattedTime }}
                  </div>

                  <!-- Status Badge -->
                  <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" :class="statusBadgeClass">
                    <span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>
                    {{ statusText }}
                  </div>
                </div>

                <!-- Control Buttons -->
                <div class="flex justify-center gap-3 flex-wrap">
                  <button
                    v-if="!timer.isRunning && !timer.isPaused"
                    @click="showStartModal = true"
                    :disabled="!selectedSubjectId"
                    class="inline-flex items-center px-8 py-4 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-lg hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg shadow-primary-500/30"
                  >
                    <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    Iniciar Sessão
                  </button>

                  <button
                    v-if="timer.isRunning && !timer.isPaused"
                    @click="pause"
                    class="inline-flex items-center px-8 py-4 bg-yellow-500 text-claude-text dark:text-white rounded-claude-lg hover:bg-yellow-600 transition-all font-semibold text-lg shadow-lg"
                  >
                    <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Pausar
                  </button>

                  <button
                    v-if="timer.isPaused"
                    @click="resume"
                    class="inline-flex items-center px-8 py-4 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-lg hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all font-semibold text-lg shadow-lg shadow-primary-500/30"
                  >
                    <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    Retomar
                  </button>

                  <button
                    @click="confirmStop"
                    :disabled="!timer.isRunning && !timer.isPaused"
                    class="inline-flex items-center px-8 py-4 bg-red-500 text-claude-text dark:text-white rounded-claude-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg"
                  >
                    <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd" />
                    </svg>
                    Encerrar
                  </button>
                </div>
              </div>
            </div>

            <!-- Notes Section -->
            <div class="p-6 border-t border-dark-700">
              <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
                Anotações da sessão (opcional)
              </label>
              <textarea
                v-model="notes"
                rows="4"
                placeholder="O que você estudou? Principais pontos, dúvidas ou conquistas..."
                class="w-full px-4 py-3 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Quick Stats -->
          <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6">
            <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Sessão Atual
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-claude-text-secondary dark:text-gray-400 text-sm">Matéria:</span>
                <span class="text-claude-text dark:text-white font-medium">{{ selectedSubjectName || '-' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-claude-text-secondary dark:text-gray-400 text-sm">Tempo:</span>
                <span class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors font-mono font-semibold">{{ formattedTime }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-claude-text-secondary dark:text-gray-400 text-sm">Status:</span>
                <span class="text-claude-text dark:text-white font-medium">{{ statusText }}</span>
              </div>
            </div>
          </div>

          <!-- Study Tips -->
          <div class="bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-claude-primary dark:border-primary-500/30 rounded-claude-lg p-6">
            <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Dicas Rápidas
            </h3>
            <ul class="space-y-3 text-claude-text-secondary dark:text-gray-300 text-sm">
              <li class="flex items-start">
                <span class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mr-2 mt-1">•</span>
                <span>Técnica Pomodoro: 25 min de foco + 5 min de pausa</span>
              </li>
              <li class="flex items-start">
                <span class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mr-2 mt-1">•</span>
                <span>Elimine distrações durante a sessão</span>
              </li>
              <li class="flex items-start">
                <span class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mr-2 mt-1">•</span>
                <span>Faça anotações para revisão posterior</span>
              </li>
              <li class="flex items-start">
                <span class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors mr-2 mt-1">•</span>
                <span>Hidrate-se e mantenha postura adequada</span>
              </li>
            </ul>
          </div>

          <!-- Pomodoro Timer Suggestion -->
          <div class="bg-claude-bg dark:bg-dark-800/50 backdrop-blur-sm border border-claude-border dark:border-dark-700 rounded-claude-lg p-6">
            <h3 class="text-lg font-semibold text-claude-text dark:text-white mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Sugestão Pomodoro
            </h3>
            <p class="text-claude-text-secondary dark:text-gray-400 text-sm mb-3">Configure um alarme para:</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md p-3 text-center">
                <div class="text-2xl font-bold text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors">25</div>
                <div class="text-xs text-claude-text-secondary dark:text-gray-400">minutos foco</div>
              </div>
              <div class="bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md p-3 text-center">
                <div class="text-2xl font-bold text-yellow-400">5</div>
                <div class="text-xs text-claude-text-secondary dark:text-gray-400">minutos pausa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Confirmação de Encerramento -->
    <div
      v-if="showStopModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="cancelStop"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-claude-lg max-w-md w-full p-6 shadow-2xl animate-scale-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-claude-primary/20 dark:bg-primary-500/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-claude-text dark:text-white">Encerrar Sessão</h3>
            <p class="text-sm text-claude-text-secondary dark:text-gray-400">Salvar progresso de estudo</p>
          </div>
        </div>

        <div class="bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md p-4 mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-claude-text-secondary dark:text-gray-400 text-sm">Matéria:</span>
            <span class="text-claude-text dark:text-white font-medium">{{ selectedSubjectName }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-claude-text-secondary dark:text-gray-400 text-sm">Tempo estudado:</span>
            <span class="text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors font-mono font-semibold text-lg">{{ formattedTime }}</span>
          </div>
        </div>

        <p class="text-claude-text-secondary dark:text-gray-300 mb-6 text-sm">
          Deseja salvar esta sessão de estudo? Suas anotações e o tempo serão registrados.
        </p>

        <div class="flex gap-3">
          <button
            @click="cancelStop"
            class="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-claude-text dark:text-white rounded-claude-md transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="stop"
            :disabled="loading"
            class="flex-1 px-4 py-2 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-claude-text dark:text-white rounded-claude-md transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Salvando...' : 'Salvar Sessão' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-claude-md shadow-lg backdrop-blur-sm border flex items-center gap-3 min-w-[300px]',
            toast.type === 'success'
              ? 'bg-claude-primary/20 dark:bg-primary-500/20 border-claude-primary dark:border-primary-500/50 text-primary-100'
              : 'bg-red-500/20 border-red-500/50 text-red-100'
          ]"
        >
          <svg
            v-if="toast.type === 'success'"
            class="w-5 h-5 text-claude-text-link dark:text-primary-400 hover:text-claude-hover dark:hover:text-primary-300 transition-colors flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="flex-1 font-medium">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>

    <!-- Modal: Configurar Tipo de Estudo -->
    <div
      v-if="showStartModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeStartModal"
    >
      <div class="bg-dark-800 border border-dark-700 rounded-claude-lg max-w-md w-full p-6 shadow-2xl">
        <h3 class="text-xl font-bold text-claude-text dark:text-white mb-4">Configurar Sessão de Estudo</h3>

        <form @submit.prevent="start">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Tipo de Estudo</label>
              <select
                v-model="startForm.studyType"
                required
                class="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="conteudo">📖 Conteúdo</option>
                <option value="questoes">📝 Questões</option>
                <option value="revisao">🔄 Revisão</option>
              </select>
            </div>

            <div v-if="startForm.studyType === 'questoes'">
              <label class="block text-sm font-medium text-claude-text-secondary dark:text-gray-300 mb-2">Quantidade de Questões</label>
              <input
                v-model.number="startForm.plannedQuestions"
                type="number"
                min="1"
                class="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-claude-border-input dark:border-dark-700 rounded-claude-md text-claude-text dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="50"
              >
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="closeStartModal"
              class="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-claude-text dark:text-white rounded-claude-md transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-claude-primary dark:bg-gradient-to-r dark:from-primary-500 dark:to-primary-600 text-white hover:bg-claude-hover dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all duration-200 shadow-claude-sm hover:shadow-claude-md text-claude-text dark:text-white rounded-claude-md hover:from-claude-hover hover:to-primary-700 dark:hover:from-primary-600 dark:hover:to-primary-700 transition"
            >
              Iniciar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
import type { Database } from '~/types/database.types'
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const { timer, formattedTime, startTimer, pauseTimer, resumeTimer, stopTimer } = useStudyTimer()

const subjects = ref<Array<{ id: string, name: string }>>([])
const selectedSubjectId = ref<string>('')
const notes = ref('')
const loading = ref(false)

// Modal de confirmação
const showStopModal = ref(false)

// Modal de configuração de início
const showStartModal = ref(false)
const startForm = ref({
  studyType: 'conteudo' as 'conteudo' | 'questoes' | 'revisao',
  plannedQuestions: null as number | null
})

// Sistema de notificações toast
const toasts = ref<Array<{ id: number, message: string, type: 'success' | 'error' }>>([])
let toastIdCounter = 0

// Computed
const selectedSubjectName = computed(() => {
  const subject = subjects.value.find(s => s.id === selectedSubjectId.value)
  return subject?.name || ''
})

const statusText = computed(() => {
  if (timer.isRunning) return 'Em andamento'
  if (timer.isPaused) return 'Pausado'
  return 'Pronto para iniciar'
})

const statusBadgeClass = computed(() => {
  if (timer.isRunning) return 'bg-claude-primary/20 text-primary-300 border border-claude-primary/50'
  if (timer.isPaused) return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
  return 'bg-gray-500/20 text-[#cb785b] dark:text-gray-300 border border-gray-500/50'
})

const statusDotClass = computed(() => {
  if (timer.isRunning) return 'bg-primary-400 animate-pulse'
  if (timer.isPaused) return 'bg-yellow-400'
  return 'bg-[#cb785b] dark:bg-gray-400'
})

// Methods
onMounted(async () => {
  // Obter userId da sessão
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = user.value?.id || sessionData?.session?.user?.id

  if (!userId) return

  const { data } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('user_id', userId)
    .order('name')
  subjects.value = data || []
  selectedSubjectId.value = subjects.value[0]?.id || ''
})

const start = () => {
  if (!selectedSubjectId.value) {
    showToast('Selecione uma matéria para iniciar', 'error')
    return
  }
  startTimer(
    selectedSubjectId.value,
    startForm.value.studyType,
    startForm.value.plannedQuestions || undefined
  )
  showToast(`Sessão de ${startForm.value.studyType} iniciada!`, 'success')
  closeStartModal()
}

const closeStartModal = () => {
  showStartModal.value = false
  startForm.value = {
    studyType: 'conteudo',
    plannedQuestions: null
  }
}

const pause = () => {
  pauseTimer()
  showToast('Sessão pausada', 'success')
}

const resume = () => {
  resumeTimer()
  showToast('Sessão retomada!', 'success')
}

const confirmStop = () => {
  showStopModal.value = true
}

const cancelStop = () => {
  showStopModal.value = false
}

const stop = async () => {
  try {
    loading.value = true
    const result = await stopTimer(notes.value)

    if (result?.duration !== undefined) {
      const minutes = Math.floor(result.duration / 60)
      showToast(`Sessão salva! Duração: ${minutes} minutos`, 'success')
      notes.value = ''
      showStopModal.value = false
    }
  } catch (e: any) {
    showToast(e.message || 'Erro ao salvar sessão', 'error')
  } finally {
    loading.value = false
  }
}

const showToast = (message: string, type: 'success' | 'error') => {
  const id = toastIdCounter++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}
</script>

<style scoped>
/* Animação do modal */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}

/* Animações dos toasts */
.toast-enter-active {
  animation: slide-in 0.3s ease-out;
}

.toast-leave-active {
  animation: slide-out 0.3s ease-in;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Pulse animation for status dot */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
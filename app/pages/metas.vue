<script setup lang="ts">
import type { Goal, CreateGoalData, UpdateGoalData } from '~/composables/useGoals'

definePageMeta({
  middleware: 'auth'
})

// Composables
const {
  goals,
  loading,
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal
} = useGoals()

const { addToast } = useToast()
const router = useRouter()
const supabase = useSupabaseClient()

// State
const currentFilter = ref<'all' | 'in_progress' | 'completed' | 'overdue'>('all')
const showCreateModal = ref(false)
const editingGoal = ref<Goal | null>(null)
const subjects = ref<any[]>([])
const loadingSubjects = ref(false)

// Form data
const formData = ref<CreateGoalData>({
  name: '',
  subject_id: '',
  target_date: '',
  checklist_items: [{ description: '' }]
})

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchGoals(),
    loadSubjects()
  ])
})

// Load subjects
const loadSubjects = async () => {
  loadingSubjects.value = true
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name')

    if (error) throw error
    subjects.value = data || []
  } catch (e: any) {
    console.error('Error loading subjects:', e)
    addToast({
      type: 'error',
      message: 'Erro ao carregar matérias'
    })
  } finally {
    loadingSubjects.value = false
  }
}

// Filtered goals
const filteredGoals = computed(() => {
  if (currentFilter.value === 'all') return goals.value
  return goals.value.filter(g => g.status === currentFilter.value)
})

// Statistics
const stats = computed(() => {
  const inProgress = goals.value.filter(g => g.status === 'in_progress').length
  const completed = goals.value.filter(g => g.status === 'completed').length
  const overdue = goals.value.filter(g => g.status === 'overdue').length
  const total = goals.value.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return { inProgress, completed, overdue, total, completionRate }
})

// Modal functions
const openCreateModal = () => {
  editingGoal.value = null
  formData.value = {
    name: '',
    subject_id: '',
    target_date: '',
    checklist_items: [{ description: '' }]
  }
  showCreateModal.value = true
}

const openEditModal = (goal: Goal) => {
  editingGoal.value = goal
  formData.value = {
    name: goal.name,
    subject_id: goal.subject_id,
    target_date: goal.target_date,
    checklist_items: goal.checklist_items?.map(item => ({
      description: item.description
    })) || [{ description: '' }]
  }
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingGoal.value = null
}

// Checklist item functions
const addChecklistItem = () => {
  formData.value.checklist_items.push({ description: '' })
}

const removeChecklistItem = (index: number) => {
  if (formData.value.checklist_items.length > 1) {
    formData.value.checklist_items.splice(index, 1)
  }
}

const moveItemUp = (index: number) => {
  if (index > 0) {
    const items = formData.value.checklist_items
    ;[items[index - 1], items[index]] = [items[index], items[index - 1]]
  }
}

const moveItemDown = (index: number) => {
  if (index < formData.value.checklist_items.length - 1) {
    const items = formData.value.checklist_items
    ;[items[index], items[index +  1]] = [items[index + 1], items[index]]
  }
}

// Validate form
const validateForm = (): string | null => {
  if (!formData.value.name.trim()) return 'O nome da meta é obrigatório'
  if (!formData.value.subject_id) return 'Selecione uma matéria'
  if (!formData.value.target_date) return 'Selecione uma data de conclusão'

  const targetDate = new Date(formData.value.target_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (targetDate < today) return 'A data de conclusão não pode ser anterior a hoje'

  const validItems = formData.value.checklist_items.filter(item => item.description.trim())
  if (validItems.length === 0) return 'Adicione pelo menos um item ao checklist'

  return null
}

// Submit form
const submitForm = async () => {
  const error = validateForm()
  if (error) {
    addToast({ type: 'error', message: error })
    return
  }

  const validItems = formData.value.checklist_items.filter(item => item.description.trim())

  if (editingGoal.value) {
    const updateData: UpdateGoalData = {
      name: formData.value.name,
      subject_id: formData.value.subject_id,
      target_date: formData.value.target_date
    }

    const result = await updateGoal(editingGoal.value.id, updateData)
    if (result.success) {
      addToast({ type: 'success', message: 'Meta atualizada com sucesso!' })
      closeModal()
    } else {
      addToast({ type: 'error', message: result.message || 'Erro ao atualizar meta' })
    }
  } else {
    const createData: CreateGoalData = { ...formData.value, checklist_items: validItems }
    const result = await createGoal(createData)

    if (result.success) {
      addToast({ type: 'success', message: 'Meta criada com sucesso! Você deu o primeiro passo rumo à sua aprovação!' })
      closeModal()
    } else {
      addToast({ type: 'error', message: result.message || 'Erro ao criar meta' })
    }
  }
}

// Delete goal
const handleDeleteGoal = async (goal: Goal) => {
  if (!confirm(`Tem certeza que deseja deletar a meta "${goal.name}"?`)) return

  const result = await deleteGoal(goal.id)
  if (result.success) {
    addToast({ type: 'success', message: 'Meta deletada com sucesso' })
  } else {
    addToast({ type: 'error', message: result.message || 'Erro ao deletar meta' })
  }
}

// View goal details
const viewGoalDetails = (goal: Goal) => {
  router.push(`/metas/${goal.id}`)
}

// Get minimum date
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
          Minhas Metas de Estudo
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Defina seus objetivos e acompanhe sua jornada rumo à aprovação!
        </p>
      </div>

      <!-- Statistics Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total de Metas</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
            </div>
            <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Em Andamento</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.inProgress }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.completed }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-dark-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Taxa de Conclusão</p>
              <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ stats.completionRate }}%</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Create Button -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <!-- Filters -->
        <div class="flex flex-wrap gap-2">
          <button
            @click="currentFilter = 'all'"
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="currentFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-700 hover:border-primary-500'"
          >
            Todas
          </button>
          <button
            @click="currentFilter = 'in_progress'"
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="currentFilter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-700 hover:border-blue-500'"
          >
            Em andamento
          </button>
          <button
            @click="currentFilter = 'completed'"
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="currentFilter === 'completed' ? 'bg-green-600 text-white' : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-700 hover:border-green-500'"
          >
            Concluídas
          </button>
          <button
            @click="currentFilter = 'overdue'"
            class="px-4 py-2 rounded-lg font-medium transition-all"
            :class="currentFilter === 'overdue' ? 'bg-red-600 text-white' : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-700 hover:border-red-500'"
          >
            Atrasadas
          </button>
        </div>

        <!-- Create Button -->
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nova Meta
        </button>
      </div>

      <!-- Goals Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-dark-800 rounded-xl p-6 animate-pulse">
          <div class="h-6 bg-gray-200 dark:bg-dark-700 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-full"></div>
        </div>
      </div>

      <div v-else-if="filteredGoals.length === 0" class="text-center py-16">
        <div class="w-24 h-24 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ currentFilter === 'all' ? 'Nenhuma meta criada ainda' : 'Nenhuma meta encontrada' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ currentFilter === 'all' ? 'Crie sua primeira meta e comece a organizar seus estudos!' : 'Tente outro filtro ou crie uma nova meta' }}
        </p>
        <button
          v-if="currentFilter === 'all'"
          @click="openCreateModal"
          class="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Criar Primeira Meta
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GoalCard
          v-for="goal in filteredGoals"
          :key="goal.id"
          :goal="goal"
          @delete="handleDeleteGoal(goal)"
          @edit="openEditModal(goal)"
          @view-details="viewGoalDetails(goal)"
        />
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCreateModal"
          class="fixed inset-0 z-50 overflow-y-auto"
          @click.self="closeModal"
        >
          <div class="flex min-h-screen items-center justify-center p-4">
            <!-- Overlay -->
            <div
              class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              @click="closeModal"
            ></div>

            <!-- Modal Content -->
            <div
              class="relative bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              @click.stop
            >
              <!-- Modal Header -->
              <div class="sticky top-0 z-10 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-6 py-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ editingGoal ? 'Editar Meta' : 'Nova Meta' }}
                  </h2>
                  <button
                    @click="closeModal"
                    class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <form @submit.prevent="submitForm" class="p-6 space-y-6">
                <!-- Goal Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nome da Meta <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.name"
                    type="text"
                    placeholder="Ex: Dominar toda a matéria de Direito Constitucional"
                    class="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Seja específico e motivador!
                  </p>
                </div>

                <!-- Subject Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matéria <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.subject_id"
                    class="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                    required
                  >
                    <option value="" disabled>Selecione uma matéria</option>
                    <option
                      v-for="subject in subjects"
                      :key="subject.id"
                      :value="subject.id"
                    >
                      {{ subject.name }}
                    </option>
                  </select>
                  <p v-if="subjects.length === 0" class="mt-1 text-xs text-orange-600 dark:text-orange-400">
                    Você ainda não tem matérias cadastradas. Cadastre uma matéria primeiro!
                  </p>
                </div>

                <!-- Target Date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data de Conclusão <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.target_date"
                    type="date"
                    :min="minDate"
                    class="w-full px-4 py-3 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <!-- Checklist Items -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    O que você precisa fazer para alcançar essa meta? <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-3">
                    <div
                      v-for="(item, index) in formData.checklist_items"
                      :key="index"
                      class="flex items-center gap-2"
                    >
                      <input
                        v-model="item.description"
                        type="text"
                        :placeholder="`Item ${index + 1}: Ex: Ler o capítulo 3 do livro`"
                        class="flex-1 px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />

                      <!-- Reorder Buttons -->
                      <div class="flex gap-1">
                        <button
                          type="button"
                          @click="moveItemUp(index)"
                          :disabled="index === 0"
                          class="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover para cima"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          @click="moveItemDown(index)"
                          :disabled="index === formData.checklist_items.length - 1"
                          class="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover para baixo"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      <!-- Delete Button -->
                      <button
                        type="button"
                        @click="removeChecklistItem(index)"
                        :disabled="formData.checklist_items.length === 1"
                        class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remover item"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Add Item Button -->
                  <button
                    type="button"
                    @click="addChecklistItem"
                    class="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar item
                  </button>
                </div>

                <!-- Modal Footer -->
                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {{ loading ? 'Salvando...' : editingGoal ? 'Atualizar Meta' : 'Salvar Meta' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>

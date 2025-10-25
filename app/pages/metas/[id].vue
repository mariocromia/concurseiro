<script setup lang="ts">
import type { Goal } from '~/composables/useGoals'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const goalId = route.params.id as string

const {
  currentGoal,
  loading,
  fetchGoalById,
  toggleChecklistItem,
  addChecklistItem,
  deleteChecklistItem,
  getMotivationalMessage
} = useGoals()

const { addToast } = useToast()

// State
const newItemDescription = ref('')
const showAddItem = ref(false)

// Load goal data
onMounted(async () => {
  console.log('🔷 [Meta Details Page] onMounted - goal ID:', goalId)
  await loadGoal()
  console.log('🔷 [Meta Details Page] Goal loaded:', currentGoal.value)
})

const loadGoal = async () => {
  console.log('🔷 [Meta Details Page] loadGoal called for ID:', goalId)
  const goal = await fetchGoalById(goalId)
  console.log('🔷 [Meta Details Page] fetchGoalById result:', goal)

  if (!goal) {
    console.error('❌ [Meta Details Page] Goal not found')
    addToast({
      type: 'error',
      message: 'Meta não encontrada'
    })
    router.push('/metas')
  } else {
    console.log('✅ [Meta Details Page] Goal loaded successfully:', goal.name)
  }
};

// Handle checkbox toggle with celebration
const handleToggleItem = async (itemId: string, willBeCompleted: boolean) => {
  console.log('🔷 [Meta Details] Toggling item:', { itemId, willBeCompleted })

  const result = await toggleChecklistItem(itemId)

  console.log('🔷 [Meta Details] Toggle result:', result)

  if (result.success) {
    console.log('✅ [Meta Details] Item toggled successfully')

    if (willBeCompleted) {
      // Check if this completion finished the goal
      if (currentGoal.value?.status === 'completed') {
        console.log('🎉 [Meta Details] Goal completed! Celebrating...')
        // Celebrate goal completion
        celebrateGoalCompletion()
      } else {
        console.log('🎉 [Meta Details] Item completed! Celebrating...')
        // Celebrate item completion
        celebrateItemCompletion()
      }
    }

    // Show success toast
    addToast({
      type: 'success',
      message: result.message || 'Item atualizado com sucesso!'
    })
  } else {
    console.error('❌ [Meta Details] Failed to toggle item:', result.message)
    addToast({
      type: 'error',
      message: result.message || 'Erro ao atualizar item'
    })
  }
}

// Celebration functions
const celebrateItemCompletion = async () => {
  const confetti = (await import('canvas-confetti')).default
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 }
  })
}

const celebrateGoalCompletion = async () => {
  const confetti = (await import('canvas-confetti')).default
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

// Add new item
const handleAddItem = async () => {
  if (!newItemDescription.value.trim() || !currentGoal.value) return

  const result = await addChecklistItem(currentGoal.value.id, newItemDescription.value)

  if (result.success) {
    addToast({
      type: 'success',
      message: 'Item adicionado com sucesso!'
    })
    newItemDescription.value = ''
    showAddItem.value = false
  } else {
    addToast({
      type: 'error',
      message: result.message || 'Erro ao adicionar item'
    })
  }
}

// Delete item
const handleDeleteItem = async (itemId: string) => {
  if (!confirm('Tem certeza que deseja remover este item?')) return

  const result = await deleteChecklistItem(itemId)

  if (result.success) {
    addToast({
      type: 'success',
      message: 'Item removido com sucesso!'
    })
  } else {
    addToast({
      type: 'error',
      message: result.message || 'Erro ao remover item'
    })
  }
}

// Computed
const motivationalMessage = computed(() => {
  return currentGoal.value ? getMotivationalMessage(currentGoal.value) : ''
})

const formattedTargetDate = computed(() => {
  if (!currentGoal.value?.target_date) return ''
  const date = new Date(currentGoal.value.target_date)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

const statusBadge = computed(() => {
  if (!currentGoal.value) return { label: '', color: 'gray' }

  switch (currentGoal.value.status) {
    case 'completed':
      return { label: 'Concluída', color: 'green' }
    case 'overdue':
      return { label: 'Atrasada', color: 'red' }
    case 'in_progress':
    default:
      return { label: 'Em andamento', color: 'blue' }
  }
})

const daysRemainingText = computed(() => {
  if (!currentGoal.value) return ''
  const days = currentGoal.value.days_remaining || 0

  if (days < 0) {
    return `Atrasada ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`
  }
  if (days === 0) {
    return 'Vence hoje!'
  }
  if (days === 1) {
    return 'Falta 1 dia'
  }
  return `Faltam ${days} dias`
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse">
        <div class="h-8 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-4"></div>
        <div class="h-64 bg-gray-200 dark:bg-dark-700 rounded"></div>
      </div>

      <!-- Goal Content -->
      <div v-else-if="currentGoal">
        <!-- Back Button -->
        <button
          @click="router.push('/metas')"
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para Metas
        </button>

        <!-- Goal Header -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8 mb-6 border-2"
          :class="{
            'border-blue-500': currentGoal.status === 'in_progress',
            'border-green-500': currentGoal.status === 'completed',
            'border-red-500': currentGoal.status === 'overdue'
          }"
        >
          <div class="flex items-start justify-between mb-4">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex-1">
              {{ currentGoal.name }}
            </h1>
            <span
              class="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
              :class="{
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': statusBadge.color === 'blue',
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': statusBadge.color === 'green',
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': statusBadge.color === 'red'
              }"
            >
              {{ statusBadge.label }}
            </span>
          </div>

          <!-- Subject and Date -->
          <div class="flex flex-wrap items-center gap-6 mb-6">
            <div v-if="currentGoal.subject" class="flex items-center gap-2">
              <div
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: currentGoal.subject.color }"
              ></div>
              <span class="text-lg font-medium text-gray-700 dark:text-gray-300">
                {{ currentGoal.subject.name }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-gray-600 dark:text-gray-400">
                Prazo: {{ formattedTargetDate }}
              </span>
              <span
                class="ml-2 font-semibold"
                :class="{
                  'text-red-600 dark:text-red-400': currentGoal.status === 'overdue',
                  'text-green-600 dark:text-green-400': currentGoal.status === 'completed',
                  'text-gray-700 dark:text-gray-300': currentGoal.status === 'in_progress'
                }"
              >
                ({{ daysRemainingText }})
              </span>
            </div>
          </div>

          <!-- Progress Section -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-lg font-semibold text-gray-900 dark:text-white">
                Progresso Geral
              </span>
              <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ currentGoal.progress_percentage }}%
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-6 overflow-hidden mb-2">
              <div
                class="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                :class="{
                  'bg-gradient-to-r from-primary-500 to-primary-600': currentGoal.status === 'in_progress',
                  'bg-gradient-to-r from-green-500 to-green-600': currentGoal.status === 'completed',
                  'bg-gradient-to-r from-red-500 to-red-600': currentGoal.status === 'overdue'
                }"
                :style="{ width: `${currentGoal.progress_percentage}%` }"
              >
                <span v-if="currentGoal.progress_percentage > 15" class="text-xs font-bold text-white">
                  {{ currentGoal.completed_items }}/{{ currentGoal.total_items }}
                </span>
              </div>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400">
              Você completou <strong>{{ currentGoal.completed_items }}</strong> de <strong>{{ currentGoal.total_items }}</strong> itens
            </p>
          </div>

          <!-- Motivational Message -->
          <div class="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <p class="text-primary-900 dark:text-primary-100 font-medium">
                {{ motivationalMessage }}
              </p>
            </div>
          </div>
        </div>

        <!-- Checklist Section -->
        <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Lista de Tarefas
            </h2>
            <button
              @click="showAddItem = !showAddItem"
              class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Item
            </button>
          </div>

          <!-- Add Item Form -->
          <div v-if="showAddItem" class="mb-6 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg border border-gray-200 dark:border-dark-600">
            <div class="flex gap-2">
              <input
                v-model="newItemDescription"
                type="text"
                placeholder="Digite a descrição do novo item..."
                class="flex-1 px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                @keyup.enter="handleAddItem"
              />
              <button
                @click="handleAddItem"
                :disabled="!newItemDescription.trim()"
                class="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Adicionar
              </button>
              <button
                @click="showAddItem = false; newItemDescription = ''"
                class="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>

          <!-- Checklist Items -->
          <div class="space-y-3">
            <div
              v-for="(item, index) in currentGoal.checklist_items"
              :key="item.id"
              class="group flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-700/30 rounded-lg border-2 transition-all hover:shadow-md"
              :class="{
                'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20': item.is_completed,
                'border-gray-200 dark:border-dark-600': !item.is_completed
              }"
            >
              <!-- Checkbox -->
              <button
                @click="handleToggleItem(item.id, !item.is_completed)"
                class="flex-shrink-0 mt-1 transition-transform hover:scale-110"
              >
                <div
                  v-if="item.is_completed"
                  class="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center"
                >
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div
                  v-else
                  class="w-6 h-6 border-2 border-gray-400 dark:border-gray-500 rounded-md hover:border-primary-500 dark:hover:border-primary-400"
                ></div>
              </button>

              <!-- Item Content -->
              <div class="flex-1">
                <p
                  class="text-lg"
                  :class="{
                    'line-through text-gray-500 dark:text-gray-500': item.is_completed,
                    'text-gray-900 dark:text-white': !item.is_completed
                  }"
                >
                  {{ item.description }}
                </p>
                <p v-if="item.completed_at" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Conclu�do em {{ new Date(item.completed_at).toLocaleDateString('pt-BR') }}
                </p>
              </div>

              <!-- Delete Button -->
              <button
                @click="handleDeleteItem(item.id)"
                class="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Remover item"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!currentGoal.checklist_items || currentGoal.checklist_items.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Nenhum item na lista ainda</p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-16">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Meta n�o encontrada</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">A meta que voc� procura n�o existe ou foi removida.</p>
        <button
          @click="router.push('/metas')"
          class="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Voltar para Metas
        </button>
      </div>
    </main>
  </div>
</template>

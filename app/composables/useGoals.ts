// Composable para gerenciar metas de estudo
import type { Ref } from 'vue'

export interface GoalChecklistItem {
  id: string
  goal_id: string
  description: string
  is_completed: boolean
  order_index: number
  completed_at: string | null
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  subject_id: string
  name: string
  target_date: string
  status: 'in_progress' | 'completed' | 'overdue'
  completed_at: string | null
  created_at: string
  updated_at: string
  subject?: {
    id: string
    name: string
    color: string
    icon: string
  }
  checklist_items?: GoalChecklistItem[]
  total_items?: number
  completed_items?: number
  progress_percentage?: number
  days_remaining?: number
}

export interface CreateGoalData {
  name: string
  subject_id: string
  target_date: string
  checklist_items: Array<{ description: string }>
}

export interface UpdateGoalData {
  name?: string
  subject_id?: string
  target_date?: string
}

export const useGoals = () => {
  const goals = useState<Goal[]>('goals', () => [])
  const currentGoal = useState<Goal | null>('currentGoal', () => null)
  const loading = useState<boolean>('goalsLoading', () => false)
  const error = useState<string | null>('goalsError', () => null)

  // Fetch all goals
  const fetchGoals = async (status?: 'in_progress' | 'completed' | 'overdue') => {
    console.log('🔷 [useGoals] fetchGoals called with status:', status)
    loading.value = true
    error.value = null

    try {
      const query = status ? `?status=${status}` : ''
      console.log('🔷 [useGoals] Fetching goals from:', `/api/goals${query}`)

      // Use $fetch instead of useFetch for manual async calls
      const response = await $fetch<{ success: boolean; data: Goal[] }>(
        `/api/goals${query}`,
        {
          method: 'GET'
        }
      )

      console.log('🔷 [useGoals] Fetch result:', response)

      if (response.success && response.data) {
        console.log('✅ [useGoals] Goals loaded:', response.data.length, 'goals')
        goals.value = response.data
      } else {
        console.warn('⚠️  [useGoals] Unexpected response:', response)
      }
    } catch (e: any) {
      error.value = e.message
      console.error('❌ [useGoals] Exception fetching goals:', e)
    } finally {
      loading.value = false
      console.log('🔷 [useGoals] Final state - goals count:', goals.value.length)
    }
  }

  // Fetch a single goal by ID
  const fetchGoalById = async (goalId: string) => {
    console.log('🔷 [useGoals] fetchGoalById called with id:', goalId)
    loading.value = true
    error.value = null

    try {
      console.log('🔷 [useGoals] Making request to:', `/api/goals/${goalId}`)

      const response = await $fetch<{ success: boolean; data: Goal }>(
        `/api/goals/${goalId}`,
        {
          method: 'GET'
        }
      )

      console.log('🔷 [useGoals] fetchGoalById raw response:', response)

      if (response.success && response.data) {
        console.log('✅ [useGoals] Goal loaded successfully:', {
          id: response.data.id,
          name: response.data.name,
          checklist_items_count: response.data.checklist_items?.length || 0
        })
        currentGoal.value = response.data
        return response.data
      } else {
        console.warn('⚠️  [useGoals] Unexpected response format:', response)
        return null
      }
    } catch (e: any) {
      error.value = e.message
      console.error('❌ [useGoals] Exception fetching goal:', {
        message: e.message,
        statusCode: e.statusCode,
        data: e.data,
        stack: e.stack
      })
      return null
    } finally {
      loading.value = false
      console.log('🔷 [useGoals] fetchGoalById finished. Loading:', loading.value)
    }
  }

  // Create a new goal
  const createGoal = async (goalData: CreateGoalData) => {
    loading.value = true
    error.value = null

    try {
      console.log('🔷 [useGoals] Iniciando criação de meta:', goalData)

      const response = await $fetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals',
        {
          method: 'POST',
          body: goalData
        }
      )

      console.log('🔷 [useGoals] Resposta da API:', response)

      if (response.success && response.data) {
        console.log('✅ [useGoals] Meta criada com sucesso:', response.data)
        // Add to local state
        goals.value.unshift(response.data)
        return { success: true, data: response.data, message: response.message }
      }

      console.warn('⚠️  [useGoals] Resposta inesperada da API:', response)
      return { success: false, message: 'Erro ao criar meta' }
    } catch (e: any) {
      error.value = e.message
      console.error('❌ [useGoals] Exceção ao criar meta:', {
        message: e.message,
        statusCode: e.statusCode,
        data: e.data
      })

      // Better error handling for $fetch
      let userMessage = 'Erro ao criar meta'
      if (e.statusCode === 401) {
        userMessage = 'Sessão expirada. Faça login novamente.'
      } else if (e.statusCode === 400) {
        userMessage = e.data?.message || 'Dados inválidos'
      } else if (e.statusCode >= 500) {
        userMessage = 'Erro no servidor. Tente novamente.'
      }

      return { success: false, message: userMessage }
    } finally {
      loading.value = false
    }
  }

  // Update an existing goal
  const updateGoal = async (goalId: string, updateData: UpdateGoalData) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: Goal; message: string }>(
        `/api/goals/${goalId}`,
        {
          method: 'PUT',
          body: updateData
        }
      )

      if (response.success && response.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === goalId)
        if (index !== -1) {
          goals.value[index] = response.data
        }
        if (currentGoal.value?.id === goalId) {
          currentGoal.value = response.data
        }
        return { success: true, data: response.data, message: response.message }
      }

      return { success: false, message: 'Erro ao atualizar meta' }
    } catch (e: any) {
      error.value = e.message || 'Erro ao atualizar meta'
      console.error('Error updating goal:', e)
      return { success: false, message: e.data?.message || e.message || 'Erro ao atualizar meta' }
    } finally {
      loading.value = false
    }
  }

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; message: string }>(
        `/api/goals/${goalId}`,
        {
          method: 'DELETE'
        }
      )

      if (response.success) {
        // Remove from local state
        goals.value = goals.value.filter(g => g.id !== goalId)
        if (currentGoal.value?.id === goalId) {
          currentGoal.value = null
        }
        return { success: true, message: response.message }
      }

      return { success: false, message: 'Erro ao deletar meta' }
    } catch (e: any) {
      error.value = e.message || 'Erro ao deletar meta'
      console.error('Error deleting goal:', e)
      return { success: false, message: e.data?.message || e.message || 'Erro ao deletar meta' }
    } finally {
      loading.value = false
    }
  }

  // Toggle checklist item completion
  const toggleChecklistItem = async (itemId: string) => {
    try {
      console.log('🔷 [useGoals] Toggling checklist item:', itemId)

      const response = await $fetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals/checklist/toggle',
        {
          method: 'POST',
          body: { item_id: itemId }
        }
      )

      console.log('🔷 [useGoals] Toggle response:', response)

      if (response.success && response.data) {
        console.log('✅ [useGoals] Toggle successful, updating local state')
        // Update local state
        const index = goals.value.findIndex(g => g.id === response.data.id)
        if (index !== -1) {
          goals.value[index] = response.data
        }
        if (currentGoal.value?.id === response.data.id) {
          currentGoal.value = response.data
          console.log('✅ [useGoals] Current goal updated:', currentGoal.value)
        }
        return { success: true, data: response.data, message: response.message }
      }

      console.warn('⚠️  [useGoals] Unexpected response:', response)
      return { success: false, message: 'Erro ao atualizar item' }
    } catch (e: any) {
      console.error('❌ [useGoals] Exception toggling checklist item:', e)
      return { success: false, message: e.data?.message || e.message || 'Erro ao atualizar item' }
    }
  }

  // Add new checklist item
  const addChecklistItem = async (goalId: string, description: string) => {
    try {
      const response = await $fetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals/checklist/add',
        {
          method: 'POST',
          body: { goal_id: goalId, description }
        }
      )

      if (response.success && response.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === goalId)
        if (index !== -1) {
          goals.value[index] = response.data
        }
        if (currentGoal.value?.id === goalId) {
          currentGoal.value = response.data
        }
        return { success: true, data: response.data, message: response.message }
      }

      return { success: false, message: 'Erro ao adicionar item' }
    } catch (e: any) {
      console.error('Error adding checklist item:', e)
      return { success: false, message: e.data?.message || e.message || 'Erro ao adicionar item' }
    }
  }

  // Update checklist item description
  const updateChecklistItem = async (itemId: string, description: string) => {
    try {
      const response = await $fetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals/checklist/update',
        {
          method: 'POST',
          body: { item_id: itemId, description }
        }
      )

      if (response.success && response.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === response.data.id)
        if (index !== -1) {
          goals.value[index] = response.data
        }
        if (currentGoal.value?.id === response.data.id) {
          currentGoal.value = response.data
        }
        return { success: true, data: response.data, message: response.message }
      }

      return { success: false, message: 'Erro ao atualizar item' }
    } catch (e: any) {
      console.error('Error updating checklist item:', e)
      return { success: false, message: e.data?.message || e.message || 'Erro ao atualizar item' }
    }
  }

  // Delete checklist item
  const deleteChecklistItem = async (itemId: string) => {
    try {
      const response = await $fetch<{ success: boolean; data: Goal; message: string }>(
        `/api/goals/checklist/${itemId}`,
        {
          method: 'DELETE'
        }
      )

      if (response.success && response.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === response.data.id)
        if (index !== -1) {
          goals.value[index] = response.data
        }
        if (currentGoal.value?.id === response.data.id) {
          currentGoal.value = response.data
        }
        return { success: true, data: response.data, message: response.message }
      }

      return { success: false, message: 'Erro ao deletar item' }
    } catch (e: any) {
      console.error('Error deleting checklist item:', e)
      return { success: false, message: e.data?.message || e.message || 'Erro ao deletar item' }
    }
  }

  // Get motivational message based on progress
  const getMotivationalMessage = (goal: Goal): string => {
    const progress = goal.progress_percentage || 0

    if (goal.status === 'completed') {
      return 'Parabéns! Você alcançou sua meta! Sua dedicação vai te levar longe!'
    }

    if (goal.status === 'overdue') {
      return 'Não desanime! Revise seu planejamento e siga em frente.'
    }

    if (progress === 0) {
      return 'Ótimo! Você deu o primeiro passo rumo à sua aprovação!'
    }

    if (progress < 30) {
      return 'Você começou bem! Continue firme nessa jornada!'
    }

    if (progress < 50) {
      return 'Está indo muito bem! Mantenha o foco!'
    }

    if (progress < 70) {
      return 'Você está no meio do caminho! Continue firme!'
    }

    if (progress < 100) {
      return 'Você está quase lá! Não pare agora!'
    }

    return 'Continue assim, você está no caminho certo!'
  }

  // Get status badge info
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Concluída', color: 'green' }
      case 'overdue':
        return { label: 'Atrasada', color: 'red' }
      case 'in_progress':
      default:
        return { label: 'Em andamento', color: 'blue' }
    }
  }

  // Format days remaining
  const formatDaysRemaining = (days: number): string => {
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
  }

  return {
    // State
    goals,
    currentGoal,
    loading,
    error,

    // Actions
    fetchGoals,
    fetchGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleChecklistItem,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,

    // Helpers
    getMotivationalMessage,
    getStatusBadge,
    formatDaysRemaining
  }
}

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
    loading.value = true
    error.value = null

    try {
      const query = status ? `?status=${status}` : ''
      const { data, error: fetchError } = await useFetch<{ success: boolean; data: Goal[] }>(
        `/api/goals${query}`,
        {
          method: 'GET'
        }
      )

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Erro ao carregar metas')
      }

      if (data.value?.success) {
        goals.value = data.value.data
      }
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching goals:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch a single goal by ID
  const fetchGoalById = async (goalId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useFetch<{ success: boolean; data: Goal }>(
        `/api/goals/${goalId}`,
        {
          method: 'GET'
        }
      )

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Erro ao carregar meta')
      }

      if (data.value?.success) {
        currentGoal.value = data.value.data
        return data.value.data
      }
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching goal:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create a new goal
  const createGoal = async (goalData: CreateGoalData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await useFetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals',
        {
          method: 'POST',
          body: goalData
        }
      )

      if (createError.value) {
        throw new Error(createError.value.message || 'Erro ao criar meta')
      }

      if (data.value?.success && data.value.data) {
        // Add to local state
        goals.value.unshift(data.value.data)
        return { success: true, data: data.value.data, message: data.value.message }
      }

      return { success: false, message: 'Erro ao criar meta' }
    } catch (e: any) {
      error.value = e.message
      console.error('Error creating goal:', e)
      return { success: false, message: e.message }
    } finally {
      loading.value = false
    }
  }

  // Update an existing goal
  const updateGoal = async (goalId: string, updateData: UpdateGoalData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await useFetch<{ success: boolean; data: Goal; message: string }>(
        `/api/goals/${goalId}`,
        {
          method: 'PUT',
          body: updateData
        }
      )

      if (updateError.value) {
        throw new Error(updateError.value.message || 'Erro ao atualizar meta')
      }

      if (data.value?.success && data.value.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === goalId)
        if (index !== -1) {
          goals.value[index] = data.value.data
        }
        if (currentGoal.value?.id === goalId) {
          currentGoal.value = data.value.data
        }
        return { success: true, data: data.value.data, message: data.value.message }
      }

      return { success: false, message: 'Erro ao atualizar meta' }
    } catch (e: any) {
      error.value = e.message
      console.error('Error updating goal:', e)
      return { success: false, message: e.message }
    } finally {
      loading.value = false
    }
  }

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: deleteError } = await useFetch<{ success: boolean; message: string }>(
        `/api/goals/${goalId}`,
        {
          method: 'DELETE'
        }
      )

      if (deleteError.value) {
        throw new Error(deleteError.value.message || 'Erro ao deletar meta')
      }

      if (data.value?.success) {
        // Remove from local state
        goals.value = goals.value.filter(g => g.id !== goalId)
        if (currentGoal.value?.id === goalId) {
          currentGoal.value = null
        }
        return { success: true, message: data.value.message }
      }

      return { success: false, message: 'Erro ao deletar meta' }
    } catch (e: any) {
      error.value = e.message
      console.error('Error deleting goal:', e)
      return { success: false, message: e.message }
    } finally {
      loading.value = false
    }
  }

  // Toggle checklist item completion
  const toggleChecklistItem = async (itemId: string) => {
    try {
      const { data, error: toggleError } = await useFetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals/checklist/toggle',
        {
          method: 'POST',
          body: { item_id: itemId }
        }
      )

      if (toggleError.value) {
        throw new Error(toggleError.value.message || 'Erro ao atualizar item')
      }

      if (data.value?.success && data.value.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === data.value.data.id)
        if (index !== -1) {
          goals.value[index] = data.value.data
        }
        if (currentGoal.value?.id === data.value.data.id) {
          currentGoal.value = data.value.data
        }
        return { success: true, data: data.value.data, message: data.value.message }
      }

      return { success: false, message: 'Erro ao atualizar item' }
    } catch (e: any) {
      console.error('Error toggling checklist item:', e)
      return { success: false, message: e.message }
    }
  }

  // Add new checklist item
  const addChecklistItem = async (goalId: string, description: string) => {
    try {
      const { data, error: addError } = await useFetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals/checklist/add',
        {
          method: 'POST',
          body: { goal_id: goalId, description }
        }
      )

      if (addError.value) {
        throw new Error(addError.value.message || 'Erro ao adicionar item')
      }

      if (data.value?.success && data.value.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === goalId)
        if (index !== -1) {
          goals.value[index] = data.value.data
        }
        if (currentGoal.value?.id === goalId) {
          currentGoal.value = data.value.data
        }
        return { success: true, data: data.value.data, message: data.value.message }
      }

      return { success: false, message: 'Erro ao adicionar item' }
    } catch (e: any) {
      console.error('Error adding checklist item:', e)
      return { success: false, message: e.message }
    }
  }

  // Update checklist item description
  const updateChecklistItem = async (itemId: string, description: string) => {
    try {
      const { data, error: updateError } = await useFetch<{ success: boolean; data: Goal; message: string }>(
        '/api/goals/checklist/update',
        {
          method: 'POST',
          body: { item_id: itemId, description }
        }
      )

      if (updateError.value) {
        throw new Error(updateError.value.message || 'Erro ao atualizar item')
      }

      if (data.value?.success && data.value.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === data.value.data.id)
        if (index !== -1) {
          goals.value[index] = data.value.data
        }
        if (currentGoal.value?.id === data.value.data.id) {
          currentGoal.value = data.value.data
        }
        return { success: true, data: data.value.data, message: data.value.message }
      }

      return { success: false, message: 'Erro ao atualizar item' }
    } catch (e: any) {
      console.error('Error updating checklist item:', e)
      return { success: false, message: e.message }
    }
  }

  // Delete checklist item
  const deleteChecklistItem = async (itemId: string) => {
    try {
      const { data, error: deleteError } = await useFetch<{ success: boolean; data: Goal; message: string }>(
        `/api/goals/checklist/${itemId}`,
        {
          method: 'DELETE'
        }
      )

      if (deleteError.value) {
        throw new Error(deleteError.value.message || 'Erro ao deletar item')
      }

      if (data.value?.success && data.value.data) {
        // Update local state
        const index = goals.value.findIndex(g => g.id === data.value.data.id)
        if (index !== -1) {
          goals.value[index] = data.value.data
        }
        if (currentGoal.value?.id === data.value.data.id) {
          currentGoal.value = data.value.data
        }
        return { success: true, data: data.value.data, message: data.value.message }
      }

      return { success: false, message: 'Erro ao deletar item' }
    } catch (e: any) {
      console.error('Error deleting checklist item:', e)
      return { success: false, message: e.message }
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

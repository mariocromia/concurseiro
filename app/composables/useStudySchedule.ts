import type { Database } from '~/types/supabase'

type StudySchedule = Database['public']['Tables']['study_schedules']['Row']
type StudyScheduleInsert = Database['public']['Tables']['study_schedules']['Insert']
type StudyScheduleUpdate = Database['public']['Tables']['study_schedules']['Update']

export type ScheduleType = 'study' | 'event'

export interface ScheduleActivity {
  id?: string
  user_id?: string
  subject_id?: string | null
  title: string
  description?: string | null
  scheduled_date: string
  start_time: string
  duration: number
  is_completed: boolean
  color?: string | null
  type?: ScheduleType
  subject?: {
    id: string
    name: string
    color: string
    icon: string
  } | null
}

export interface CreateActivityPayload {
  type: ScheduleType
  subject_id?: string | null
  title: string
  description?: string | null
  scheduled_date: string
  start_time: string
  duration: number
  color?: string | null
}

export const useStudySchedule = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const activities = ref<ScheduleActivity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Calcula o horário de término baseado no início e duração
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  // Formata duração em texto legível
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) {
      return `${hours}h`
    }
    return `${hours}h ${mins}min`
  }

  // Busca todas as atividades do usuário em um período
  const fetchActivities = async (startDate: string, endDate: string) => {
    if (!user.value?.id) {
      error.value = 'Usuário não autenticado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('study_schedules')
        .select(`
          *,
          subject:subjects(id, name, color, icon)
        `)
        .eq('user_id', user.value.id)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (fetchError) throw fetchError

      activities.value = (data || []).map(item => ({
        ...item,
        subject: item.subject ? (Array.isArray(item.subject) ? item.subject[0] : item.subject) : null,
        type: item.subject_id ? 'study' : 'event'
      })) as ScheduleActivity[]
    } catch (err: any) {
      console.error('Erro ao buscar atividades:', err)
      error.value = err.message || 'Erro ao carregar atividades'
    } finally {
      loading.value = false
    }
  }

  // Busca atividades de um dia específico
  const fetchActivitiesByDate = async (date: string) => {
    return fetchActivities(date, date)
  }

  // Cria uma nova atividade
  const createActivity = async (payload: CreateActivityPayload): Promise<ScheduleActivity | null> => {
    if (!user.value?.id) {
      error.value = 'Usuário não autenticado'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const insertData: StudyScheduleInsert = {
        user_id: user.value.id,
        subject_id: payload.subject_id || null,
        title: payload.title,
        description: payload.description || null,
        scheduled_date: payload.scheduled_date,
        start_time: payload.start_time,
        duration: payload.duration,
        is_completed: false,
        color: payload.color || null
      }

      const { data, error: insertError } = await supabase
        .from('study_schedules')
        .insert(insertData)
        .select(`
          *,
          subject:subjects(id, name, color, icon)
        `)
        .single()

      if (insertError) throw insertError

      const newActivity = {
        ...data,
        subject: data.subject ? (Array.isArray(data.subject) ? data.subject[0] : data.subject) : null,
        type: data.subject_id ? 'study' : 'event'
      } as ScheduleActivity

      activities.value.push(newActivity)
      activities.value.sort((a, b) => {
        if (a.scheduled_date !== b.scheduled_date) {
          return a.scheduled_date.localeCompare(b.scheduled_date)
        }
        return a.start_time.localeCompare(b.start_time)
      })

      return newActivity
    } catch (err: any) {
      console.error('Erro ao criar atividade:', err)
      error.value = err.message || 'Erro ao criar atividade'
      return null
    } finally {
      loading.value = false
    }
  }

  // Atualiza uma atividade existente
  const updateActivity = async (
    id: string,
    updates: Partial<CreateActivityPayload>
  ): Promise<boolean> => {
    if (!user.value?.id) {
      error.value = 'Usuário não autenticado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const updateData: StudyScheduleUpdate = {
        ...updates,
        subject_id: updates.subject_id !== undefined ? updates.subject_id : undefined
      }

      const { data, error: updateError } = await supabase
        .from('study_schedules')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.value.id)
        .select(`
          *,
          subject:subjects(id, name, color, icon)
        `)
        .single()

      if (updateError) throw updateError

      const index = activities.value.findIndex(a => a.id === id)
      if (index !== -1) {
        activities.value[index] = {
          ...data,
          subject: data.subject ? (Array.isArray(data.subject) ? data.subject[0] : data.subject) : null,
          type: data.subject_id ? 'study' : 'event'
        } as ScheduleActivity

        // Reordena se a data ou hora mudou
        if (updates.scheduled_date || updates.start_time) {
          activities.value.sort((a, b) => {
            if (a.scheduled_date !== b.scheduled_date) {
              return a.scheduled_date.localeCompare(b.scheduled_date)
            }
            return a.start_time.localeCompare(b.start_time)
          })
        }
      }

      return true
    } catch (err: any) {
      console.error('Erro ao atualizar atividade:', err)
      error.value = err.message || 'Erro ao atualizar atividade'
      return false
    } finally {
      loading.value = false
    }
  }

  // Marca atividade como concluída/não concluída
  const toggleCompletion = async (id: string): Promise<boolean> => {
    const activity = activities.value.find(a => a.id === id)
    if (!activity) return false

    return updateActivity(id, { is_completed: !activity.is_completed } as any)
  }

  // Deleta uma atividade
  const deleteActivity = async (id: string): Promise<boolean> => {
    if (!user.value?.id) {
      error.value = 'Usuário não autenticado'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('study_schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id)

      if (deleteError) throw deleteError

      activities.value = activities.value.filter(a => a.id !== id)
      return true
    } catch (err: any) {
      console.error('Erro ao deletar atividade:', err)
      error.value = err.message || 'Erro ao deletar atividade'
      return false
    } finally {
      loading.value = false
    }
  }

  // Verifica conflitos de horário
  const checkTimeConflicts = (
    date: string,
    startTime: string,
    duration: number,
    excludeId?: string
  ): ScheduleActivity[] => {
    const endTime = calculateEndTime(startTime, duration)
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    return activities.value.filter(activity => {
      if (activity.id === excludeId) return false
      if (activity.scheduled_date !== date) return false

      const [actStartH, actStartM] = activity.start_time.split(':').map(Number)
      const actStartMinutes = actStartH * 60 + actStartM
      const actEndMinutes = actStartMinutes + activity.duration

      // Verifica sobreposição
      return (
        (startMinutes >= actStartMinutes && startMinutes < actEndMinutes) ||
        (endMinutes > actStartMinutes && endMinutes <= actEndMinutes) ||
        (startMinutes <= actStartMinutes && endMinutes >= actEndMinutes)
      )
    })
  }

  // Obtém estatísticas de carga horária
  const getWorkloadStats = (startDate: string, endDate: string) => {
    const filtered = activities.value.filter(
      a => a.scheduled_date >= startDate && a.scheduled_date <= endDate
    )

    const totalMinutes = filtered.reduce((sum, a) => sum + a.duration, 0)
    const completedMinutes = filtered.filter(a => a.is_completed)
      .reduce((sum, a) => sum + a.duration, 0)

    const totalActivities = filtered.length
    const completedActivities = filtered.filter(a => a.is_completed).length

    return {
      totalMinutes,
      completedMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      completedHours: Math.round(completedMinutes / 60 * 10) / 10,
      totalActivities,
      completedActivities,
      completionRate: totalActivities > 0
        ? Math.round((completedActivities / totalActivities) * 100)
        : 0
    }
  }

  // Obtém atividades agrupadas por data
  const getActivitiesByDate = computed(() => {
    const grouped: Record<string, ScheduleActivity[]> = {}

    activities.value.forEach(activity => {
      if (!grouped[activity.scheduled_date]) {
        grouped[activity.scheduled_date] = []
      }
      grouped[activity.scheduled_date].push(activity)
    })

    return grouped
  })

  // Paleta de cores padrão
  const colorPalette = [
    '#8B5CF6', // Roxo primário
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarelo/Laranja
    '#EC4899', // Rosa/Magenta
    '#EF4444', // Vermelho
    '#14B8A6', // Teal
    '#8B5A3C', // Marrom
    '#6366F1', // Indigo
    '#F97316', // Laranja
    '#06B6D4', // Cyan
    '#A855F7'  // Roxo claro
  ]

  return {
    // State
    activities,
    loading,
    error,
    colorPalette,

    // Computed
    getActivitiesByDate,

    // Methods
    fetchActivities,
    fetchActivitiesByDate,
    createActivity,
    updateActivity,
    toggleCompletion,
    deleteActivity,
    checkTimeConflicts,
    getWorkloadStats,
    calculateEndTime,
    formatDuration
  }
}

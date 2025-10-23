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
  const fetchActivities = async (startDate: string, endDate?: string) => {
    console.log('🔄🔄🔄 === INÍCIO: fetchActivities (CARREGAMENTO) === 🔄🔄🔄')
    console.log('📅 Período solicitado:', { startDate, endDate: endDate || 'SEM LIMITE' })

    // ✅ CORREÇÃO: Usar getSession() ao invés de user.value
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user?.id) {
      console.error('❌ Usuário não autenticado')
      console.error('sessionError:', sessionError)
      console.error('session:', session)
      error.value = 'Usuário não autenticado'
      return
    }

    console.log('✅ Usuário autenticado:', session.user.id)
    loading.value = true
    error.value = null

    try {
      console.log('🔍 Buscando na tabela study_schedules...')
      console.log('📊 Filtros aplicados:', {
        user_id: session.user.id,
        'scheduled_date >=': startDate,
        'scheduled_date <=': endDate || 'SEM LIMITE'
      })

      // Construir query base
      let query = supabase
        .from('study_schedules')
        .select(`
          *,
          subject:subjects(id, name, color, icon)
        `)
        .eq('user_id', session.user.id)
        .gte('scheduled_date', startDate)

      // Adicionar filtro de data final APENAS se fornecido
      if (endDate) {
        query = query.lte('scheduled_date', endDate)
      }

      // Executar query
      const { data, error: fetchError } = await query
        .order('scheduled_date', { ascending: true })
        // NÃO ordenar por start_time/scheduled_time - pode causar erro se coluna não existir

      console.log('📬 Resposta recebida do banco')

      if (fetchError) {
        console.error('❌❌❌ ERRO NA CONSULTA ❌❌❌')
        console.error('Código:', fetchError.code)
        console.error('Mensagem:', fetchError.message)
        console.error('Detalhes:', fetchError.details)
        console.error('Hint:', fetchError.hint)
        throw fetchError
      }

      console.log('✅ Consulta executada com sucesso')
      console.log('📊 Quantidade de registros retornados:', (data || []).length)

      if ((data || []).length === 0) {
        console.warn('⚠️⚠️⚠️ NENHUMA ATIVIDADE ENCONTRADA ⚠️⚠️⚠️')
        console.warn('Possíveis causas:')
        console.warn('1. Não há atividades criadas neste período')
        console.warn('2. Atividades foram criadas com user_id diferente')
        console.warn('3. Atividades foram criadas com scheduled_date fora do período')
        console.warn('4. Políticas RLS estão bloqueando a leitura')
      } else {
        console.log('📋 Primeiros registros encontrados:', JSON.stringify(data.slice(0, 3), null, 2))
      }

      activities.value = (data || []).map(item => {
        // Fazer mapeamento robusto dos campos (compatibilidade total)
        const mapped = {
          ...item,
          // Garantir que start_time existe (pode vir como start_time ou scheduled_time)
          start_time: item.start_time || item.scheduled_time || '00:00',
          // Garantir que duration existe (pode vir como duration ou planned_duration)
          duration: item.duration || item.planned_duration || 60,
          // Garantir que is_completed existe (pode vir como is_completed ou derivar de status)
          is_completed: item.is_completed !== undefined ? item.is_completed : (item.status === 'completed'),
          subject: item.subject ? (Array.isArray(item.subject) ? item.subject[0] : item.subject) : null,
          type: item.subject_id ? 'study' : 'event'
        }

        return mapped
      }) as ScheduleActivity[]

      console.log('✅✅✅ Atividades processadas e armazenadas ✅✅✅')
      console.log('📊 Total no array local:', activities.value.length)
      console.log('🏁 === FIM: fetchActivities (SUCESSO) ===')
    } catch (err: any) {
      console.error('❌❌❌ EXCEPTION em fetchActivities ❌❌❌')
      console.error('Tipo:', typeof err)
      console.error('Mensagem:', err.message)
      console.error('Stack:', err.stack)
      console.error('Erro completo:', JSON.stringify(err, null, 2))
      error.value = err.message || 'Erro ao carregar atividades'
      console.log('🏁 === FIM: fetchActivities (ERRO) ===')
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
    console.log('🎬 === INÍCIO: createActivity ===')
    console.log('📊 Payload recebido:', JSON.stringify(payload, null, 2))

    loading.value = true
    error.value = null

    try {
      // PASSO 1: Verificar autenticação
      console.log('🔐 PASSO 1: Verificando autenticação...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Erro ao buscar sessão:', sessionError)
        error.value = 'Erro ao verificar autenticação'
        return null
      }

      if (!session?.user?.id) {
        console.error('❌ Usuário não autenticado ou session.user.id está undefined')
        console.log('📋 Session completa:', JSON.stringify(session, null, 2))
        error.value = 'Usuário não autenticado'
        return null
      }

      console.log('✅ Usuário autenticado:', session.user.id)

      // PASSO 2: Preparar dados para inserção
      console.log('📝 PASSO 2: Preparando dados para inserção...')
      const insertData: any = {
        user_id: session.user.id,
        subject_id: payload.subject_id || null,
        title: payload.title,
        description: payload.description || null,
        scheduled_date: payload.scheduled_date,

        // ✅ Enviar AMBOS os campos para compatibilidade total
        start_time: payload.start_time,           // Campo novo (se existir)
        scheduled_time: payload.start_time,       // Campo antigo (se existir)
        duration: payload.duration,               // Campo novo (se existir)
        planned_duration: payload.duration,       // Campo antigo (se existir) - OBRIGATÓRIO!

        // Status/completion
        is_completed: false,                      // Campo novo (se existir)
        status: 'pending',                        // Campo antigo (se existir) - OBRIGATÓRIO!

        // Tipo de estudo (se campo existir)
        study_type: payload.type === 'study' ? 'conteudo' : 'revisao',  // Campo antigo - OBRIGATÓRIO!

        color: payload.color || null
      }

      console.log('📦 Dados preparados para inserção:', JSON.stringify(insertData, null, 2))

      // PASSO 3: Tentar inserir no banco
      console.log('🚀 PASSO 3: Enviando para o banco de dados...')
      console.log('📍 Tabela: study_schedules')
      console.log('⚠️ IMPORTANTE: Aguardando resposta do banco...')

      const { data, error: insertError } = await supabase
        .from('study_schedules')
        .insert(insertData)
        .select(`
          *,
          subject:subjects(id, name, color, icon)
        `)
        .single()

      console.log('📬 Resposta recebida do banco')
      console.log('🔍 Verificando se houve erro...')
      console.log('📊 data =', data ? 'EXISTE' : 'NULL')
      console.log('📊 insertError =', insertError ? 'EXISTE' : 'NULL')

      if (insertError) {
        console.error('❌❌❌ ERRO AO INSERIR NO BANCO ❌❌❌')
        console.error('Código do erro:', insertError.code)
        console.error('Mensagem:', insertError.message)
        console.error('Detalhes:', insertError.details)
        console.error('Hint:', insertError.hint)
        console.error('Erro completo:', JSON.stringify(insertError, null, 2))

        error.value = `Erro no banco: ${insertError.message || 'Desconhecido'}`
        throw insertError
      }

      console.log('✅✅✅ ATIVIDADE CRIADA COM SUCESSO ✅✅✅')
      console.log('🎉 Dados retornados:', JSON.stringify(data, null, 2))

      // PASSO 4: Processar resposta
      console.log('🔄 PASSO 4: Processando resposta...')
      const newActivity = {
        ...data,
        // Os campos já estão corretos (start_time, duration, is_completed)
        subject: data.subject ? (Array.isArray(data.subject) ? data.subject[0] : data.subject) : null,
        type: data.subject_id ? 'study' : 'event'
      } as ScheduleActivity

      console.log('✨ Atividade processada:', JSON.stringify(newActivity, null, 2))

      // PASSO 5: Adicionar à lista local
      console.log('📋 PASSO 5: Adicionando à lista local...')
      activities.value.push(newActivity)
      activities.value.sort((a, b) => {
        if (a.scheduled_date !== b.scheduled_date) {
          return a.scheduled_date.localeCompare(b.scheduled_date)
        }
        return a.start_time.localeCompare(b.start_time)
      })

      console.log('✅ Lista atualizada. Total de atividades:', activities.value.length)
      console.log('🏁 === FIM: createActivity (SUCESSO) ===')
      return newActivity
    } catch (err: any) {
      console.error('❌❌❌ EXCEPTION CAPTURADA ❌❌❌')
      console.error('Tipo:', typeof err)
      console.error('Mensagem:', err.message)
      console.error('Stack:', err.stack)
      console.error('Erro completo:', JSON.stringify(err, null, 2))

      error.value = err.message || 'Erro ao criar atividade'
      console.log('🏁 === FIM: createActivity (ERRO) ===')
      return null
    } finally {
      loading.value = false
      console.log('🔓 Loading definido como false')
    }
  }

  // Atualiza uma atividade existente
  const updateActivity = async (
    id: string,
    updates: Partial<CreateActivityPayload>
  ): Promise<boolean> => {
    // ✅ Buscar user_id da sessão diretamente
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user?.id) {
      error.value = 'Usuário não autenticado'
      return false
    }

    const userId = session.user.id

    loading.value = true
    error.value = null

    try {
      // Preparar dados para atualização - enviar AMBOS os formatos para compatibilidade
      const updateData: any = {}

      if (updates.subject_id !== undefined) updateData.subject_id = updates.subject_id
      if (updates.title) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.scheduled_date) updateData.scheduled_date = updates.scheduled_date

      // ✅ Enviar ambos os campos de horário (novo e antigo)
      if (updates.start_time) {
        updateData.start_time = updates.start_time
        updateData.scheduled_time = updates.start_time
      }

      // ✅ Enviar ambos os campos de duração (novo e antigo)
      if (updates.duration) {
        updateData.duration = updates.duration
        updateData.planned_duration = updates.duration
      }

      if (updates.color !== undefined) updateData.color = updates.color

      // ✅ Enviar ambos os campos de status (novo e antigo)
      if ((updates as any).is_completed !== undefined) {
        updateData.is_completed = (updates as any).is_completed
        updateData.status = (updates as any).is_completed ? 'completed' : 'pending'
      }

      // ✅ Tipo de estudo (se for passado)
      if (updates.type) {
        updateData.study_type = updates.type === 'study' ? 'conteudo' : 'revisao'
      }

      const { data, error: updateError } = await supabase
        .from('study_schedules')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
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
          // Os campos já estão corretos (start_time, duration, is_completed)
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
    // ✅ Buscar user_id da sessão diretamente
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user?.id) {
      error.value = 'Usuário não autenticado'
      return false
    }

    const userId = session.user.id

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('study_schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

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
    console.log('📊📊📊 [getWorkloadStats] Calculando estatísticas...')
    console.log('📅 Período solicitado:', { startDate, endDate })
    console.log('📦 Total de atividades no array:', activities.value.length)

    const filtered = activities.value.filter(
      a => a.scheduled_date >= startDate && a.scheduled_date <= endDate
    )

    console.log('🔍 Atividades filtradas:', filtered.length)
    console.log('📋 Datas filtradas:', filtered.map(a => ({ date: a.scheduled_date, title: a.title, completed: a.is_completed })))

    const totalMinutes = filtered.reduce((sum, a) => sum + a.duration, 0)
    const completedMinutes = filtered.filter(a => a.is_completed)
      .reduce((sum, a) => sum + a.duration, 0)

    const totalActivities = filtered.length
    const completedActivities = filtered.filter(a => a.is_completed).length

    const stats = {
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

    console.log('✅ Estatísticas calculadas:', stats)
    return stats
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

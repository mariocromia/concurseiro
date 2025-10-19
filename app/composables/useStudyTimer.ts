import type { Database } from '~/types/database.types'

export const useStudyTimer = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Estado global compartilhado - useState DENTRO da função
  const timer = useState('study-timer-state', () => ({
    isRunning: false,
    isPaused: false,
    startTime: 0,
    elapsed: 0,
    subjectId: '' as string,
    startedAt: null as Date | null,
  }))

  const now = useState('study-timer-now', () => Date.now())

  // Guarda o ID do interval no estado global também
  const intervalId = useState<any>('study-timer-interval', () => null)

  const formattedTime = computed(() => {
    // Se estiver pausado, mostra apenas elapsed
    // Se estiver rodando (e não pausado), calcula tempo atual + elapsed
    const total = (timer.value.isRunning && !timer.value.isPaused)
      ? Math.floor((now.value - timer.value.startTime) / 1000) + timer.value.elapsed
      : timer.value.elapsed
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  // Restaura interval se o timer está rodando mas o interval foi perdido
  if (process.client && timer.value.isRunning && !timer.value.isPaused && !intervalId.value) {
    console.log('⏱️ Restaurando interval perdido')
    intervalId.value = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }

  const startTimer = (subjectId: string) => {
    if (timer.value.isRunning) {
      console.log('⏱️ Timer já está rodando')
      return
    }
    console.log('⏱️ Iniciando timer para subject:', subjectId)
    timer.value.subjectId = subjectId
    timer.value.isRunning = true
    timer.value.isPaused = false
    timer.value.startTime = Date.now()
    timer.value.startedAt = new Date()
    now.value = Date.now()

    // Limpa interval anterior se existir
    if (intervalId.value) {
      clearInterval(intervalId.value)
      console.log('⏱️ Limpou interval anterior')
    }

    // Cria novo interval
    intervalId.value = setInterval(() => {
      now.value = Date.now()
    }, 1000)
    console.log('⏱️ Interval criado:', intervalId.value)
  }

  const pauseTimer = () => {
    if (!timer.value.isRunning || timer.value.isPaused) return

    const tempoDecorrido = Math.floor((Date.now() - timer.value.startTime) / 1000)
    console.log('⏱️ Pausando timer')
    console.log('  - Tempo decorrido desta sessão:', tempoDecorrido, 's')
    console.log('  - Tempo elapsed antes:', timer.value.elapsed, 's')

    timer.value.elapsed += tempoDecorrido
    timer.value.isPaused = true

    console.log('  - Tempo elapsed depois:', timer.value.elapsed, 's')

    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
      console.log('⏱️ Interval pausado e limpo')
    }
  }

  const resumeTimer = () => {
    if (!timer.value.isPaused) return

    console.log('⏱️ Retomando timer')
    console.log('  - Tempo elapsed acumulado:', timer.value.elapsed, 's')

    timer.value.isPaused = false
    timer.value.startTime = Date.now()
    now.value = Date.now()

    if (intervalId.value) clearInterval(intervalId.value)
    intervalId.value = setInterval(() => {
      now.value = Date.now()
    }, 1000)
    console.log('⏱️ Interval retomado:', intervalId.value)
  }

  const stopTimer = async (notes?: string) => {
    if (!timer.value.isRunning && !timer.value.isPaused) return null
    console.log('⏱️ Encerrando timer')
    const duration = timer.value.elapsed + (timer.value.isRunning ? Math.floor((Date.now() - timer.value.startTime) / 1000) : 0)
    const startedAt = timer.value.startedAt || new Date()
    const endedAt = new Date()

    // Limpa interval
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
      console.log('⏱️ Interval encerrado e limpo')
    }

    // Reset state
    timer.value.isRunning = false
    timer.value.isPaused = false
    timer.value.startTime = 0
    timer.value.elapsed = 0

    if (!user.value) return { duration }

    // Obter userId da sessão
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = user.value?.id || sessionData?.session?.user?.id

    if (!userId) return { duration }

    // Persist session
    const { error } = await supabase.from('study_sessions').insert({
      user_id: userId,
      subject_id: timer.value.subjectId || null,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration,
      notes: notes || null,
    })
    if (error) throw error

    // Atualizar total_study_time na matéria
    if (timer.value.subjectId) {
      // Buscar tempo total atual
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('total_study_time')
        .eq('id', timer.value.subjectId)
        .single()

      const currentTotal = subjectData?.total_study_time || 0
      const newTotal = currentTotal + duration

      // Atualizar com novo total
      const { error: updateError } = await supabase
        .from('subjects')
        .update({ total_study_time: newTotal })
        .eq('id', timer.value.subjectId)

      if (updateError) {
        console.error('❌ Erro ao atualizar total_study_time:', updateError)
      } else {
        console.log('✅ total_study_time atualizado:', newTotal, 'segundos')
      }
    }

    // Create revisions (R1-R7)
    const revisions = [
      { name: 'R1', days: 1 },
      { name: 'R2', days: 7 },
      { name: 'R3', days: 14 },
      { name: 'R4', days: 30 },
      { name: 'R5', days: 60 },
      { name: 'R6', days: 120 },
      { name: 'R7', days: 240 }
    ]

    const nowDate = new Date()
    const revisionRecords = revisions.map(r => {
      const dueDate = new Date(nowDate)
      dueDate.setDate(dueDate.getDate() + r.days)
      return {
        user_id: userId,
        subject_id: timer.value.subjectId || null,
        revision_number: parseInt(r.name.slice(1)),
        due_date: dueDate.toISOString().split('T')[0],
        completed: false
      }
    })

    const { error: revError } = await supabase.from('revisions').insert(revisionRecords)
    if (revError) console.error('Erro ao criar revisões:', revError)

    return { duration }
  }

  // NÃO fazemos cleanup on unmount porque o timer precisa continuar
  // rodando globalmente entre as páginas. O interval só deve ser limpo
  // quando o usuário explicitamente pausa ou encerra o timer.

  return {
    timer,
    formattedTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  }
}

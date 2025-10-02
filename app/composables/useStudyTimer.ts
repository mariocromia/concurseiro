import type { Database } from '~/types/database.types'

// Variável global compartilhada (não reativa, apenas para controle do interval)
let globalInterval: any = null

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

  const formattedTime = computed(() => {
    const total = timer.value.isRunning
      ? Math.floor((now.value - timer.value.startTime) / 1000) + timer.value.elapsed
      : timer.value.elapsed
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  const startTimer = (subjectId: string) => {
    if (timer.value.isRunning) return
    console.log('⏱️ Iniciando timer para subject:', subjectId)
    timer.value.subjectId = subjectId
    timer.value.isRunning = true
    timer.value.isPaused = false
    timer.value.startTime = Date.now()
    timer.value.startedAt = new Date()
    now.value = Date.now()
    if (globalInterval) clearInterval(globalInterval)
    globalInterval = setInterval(() => { now.value = Date.now() }, 1000)
  }

  const pauseTimer = () => {
    if (!timer.value.isRunning || timer.value.isPaused) return
    console.log('⏱️ Pausando timer')
    timer.value.isPaused = true
    timer.value.elapsed += Math.floor((Date.now() - timer.value.startTime) / 1000)
    if (globalInterval) {
      clearInterval(globalInterval)
      globalInterval = null
    }
  }

  const resumeTimer = () => {
    if (!timer.value.isPaused) return
    console.log('⏱️ Retomando timer')
    timer.value.isPaused = false
    timer.value.startTime = Date.now()
    now.value = Date.now()
    if (globalInterval) clearInterval(globalInterval)
    globalInterval = setInterval(() => { now.value = Date.now() }, 1000)
  }

  const stopTimer = async (notes?: string) => {
    if (!timer.value.isRunning && !timer.value.isPaused) return null
    console.log('⏱️ Encerrando timer')
    const duration = timer.value.elapsed + (timer.value.isRunning ? Math.floor((Date.now() - timer.value.startTime) / 1000) : 0)
    const startedAt = timer.value.startedAt || new Date()
    const endedAt = new Date()

    // Reset state
    timer.value.isRunning = false
    timer.value.isPaused = false
    timer.value.startTime = 0
    timer.value.elapsed = 0
    if (globalInterval) {
      clearInterval(globalInterval)
      globalInterval = null
    }

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

    // Agendar revisões R1→R7 baseadas na data de término
    try {
      if (timer.value.subjectId) {
        const base = new Date(endedAt)
        const dayOffsets = [1, 7, 14, 30, 60, 120, 240]
        const rows = dayOffsets.map((days, idx) => {
          const dt = new Date(base)
          dt.setDate(dt.getDate() + days)
          return {
            user_id: userId,
            subject_id: timer.value.subjectId!,
            page_id: null,
            revision_number: idx + 1,
            scheduled_date: dt.toISOString(),
            status: 'pending' as const,
          }
        })
        await supabase.from('revisions').insert(rows)
      }
    } catch (e) {
      console.warn('Falha ao agendar revisões:', e)
    }

    // Update subject total time
    if (timer.value.subjectId) {
      await supabase.rpc('increment_subject_time', { subject_id: timer.value.subjectId, inc_seconds: duration }).catch(async () => {
        // Fallback: update directly
        const { data } = await supabase.from('subjects').select('total_study_time').eq('id', timer.value.subjectId).single()
        const current = data?.total_study_time || 0
        await supabase.from('subjects').update({ total_study_time: current + duration }).eq('id', timer.value.subjectId)
      })
    }

    return { duration }
  }

  return { timer, formattedTime, startTimer, pauseTimer, resumeTimer, stopTimer }
}

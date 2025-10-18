import type { Database } from '~/types/database.types'

// Server-controlled persistent timer
// Time is calculated server-side, client only displays

interface TimerState {
  id: string | null
  isRunning: boolean
  displaySeconds: number // Local counter for UI (incremented every 1s)
  subjectId: string | null
  subjectName: string | null
  subjectColor: string | null
  subjectIcon: string | null
  studyType: 'conteudo' | 'questoes' | 'revisao'
  plannedQuestions: number | null
  startedAt: Date | null
}

// Display interval (1s for UI updates)
let displayInterval: any = null

// Sync interval (60s to fetch from server)
let syncInterval: any = null

export const useStudyTimer = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Global state for timer (display only)
  const timer = useState<TimerState>('study-timer-state', () => ({
    id: null,
    isRunning: false,
    displaySeconds: 0,
    subjectId: null,
    subjectName: null,
    subjectColor: null,
    subjectIcon: null,
    studyType: 'conteudo',
    plannedQuestions: null,
    startedAt: null,
  }))

  // Formatted time (HH:MM:SS)
  const formattedTime = computed(() => {
    const total = timer.value.displaySeconds
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  // Start display interval (increments UI counter)
  const startDisplayInterval = () => {
    if (displayInterval) clearInterval(displayInterval)
    displayInterval = setInterval(() => {
      timer.value.displaySeconds++
    }, 1000)
  }

  // Stop display interval
  const stopDisplayInterval = () => {
    if (displayInterval) {
      clearInterval(displayInterval)
      displayInterval = null
    }
  }

  // Start sync interval (fetches from server every 60s)
  const startSyncInterval = () => {
    if (syncInterval) clearInterval(syncInterval)
    syncInterval = setInterval(async () => {
      if (timer.value.isRunning) {
        await fetchCurrentTimer()
      }
    }, 60000) // 60 seconds
  }

  // Stop sync interval
  const stopSyncInterval = () => {
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
  }

  // Fetch current timer from server (sync)
  const fetchCurrentTimer = async (): Promise<boolean> => {
    try {
      const response = await $fetch('/api/study-timer/active', {
        method: 'GET',
      })

      if (response.hasActiveTimer && response.timer) {
        // Update state with server data
        timer.value.id = response.timer.id
        timer.value.isRunning = true
        timer.value.displaySeconds = response.timer.elapsedSeconds
        timer.value.subjectId = response.timer.subjectId
        timer.value.subjectName = response.timer.subject?.name || null
        timer.value.subjectColor = response.timer.subject?.color || null
        timer.value.subjectIcon = response.timer.subject?.icon || null
        timer.value.studyType = response.timer.studyType
        timer.value.plannedQuestions = response.timer.plannedQuestions
        timer.value.startedAt = new Date(response.timer.startTime)

        // If not running display interval, start it
        if (!displayInterval) {
          startDisplayInterval()
        }

        return true
      } else {
        // No active timer
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao buscar timer do servidor:', error)
      return false
    }
  }

  // Restore timer on mount (manual call, not automatic)
  const restoreTimer = async () => {
    if (!process.client) return

    const hasTimer = await fetchCurrentTimer()
    if (hasTimer) {
      startSyncInterval()
    }
  }

  // Start new timer
  const startTimer = async (
    subjectId: string,
    studyType: 'conteudo' | 'questoes' | 'revisao' = 'conteudo',
    plannedQuestions?: number
  ) => {
    try {
      // Call API to start timer
      const response = await $fetch('/api/study-timer/start', {
        method: 'POST',
        body: {
          subject_id: subjectId,
          study_type: studyType,
          planned_questions: plannedQuestions,
        },
      })

      if (response.success && response.timer) {
        // Update local state
        timer.value.id = response.timer.id
        timer.value.isRunning = true
        timer.value.displaySeconds = response.timer.elapsedSeconds
        timer.value.subjectId = response.timer.subjectId
        timer.value.studyType = response.timer.studyType
        timer.value.plannedQuestions = plannedQuestions || null
        timer.value.startedAt = new Date(response.timer.startTime)

        // Fetch subject info
        if (subjectId) {
          const { data: subject } = await supabase
            .from('subjects')
            .select('name, color, icon')
            .eq('id', subjectId)
            .single()

          if (subject) {
            timer.value.subjectName = subject.name
            timer.value.subjectColor = subject.color
            timer.value.subjectIcon = subject.icon
          }
        }

        // Start intervals
        startDisplayInterval()
        startSyncInterval()

        // Send message to extension (if exists)
        if (process.client) {
          try {
            const { data: sessionData } = await supabase.auth.getSession()
            if (sessionData?.session) {
              window.postMessage({
                source: 'concurseiro-app',
                type: 'AUTH_SESSION',
                session: {
                  access_token: sessionData.session.access_token,
                  refresh_token: sessionData.session.refresh_token,
                },
              }, '*')

              window.postMessage({
                source: 'concurseiro-app',
                type: 'STUDY_SESSION_STARTED',
                data: {
                  subjectId,
                  studyType,
                  plannedQuestions,
                  startedAt: new Date().toISOString(),
                },
              }, '*')
            }
          } catch (error) {
            console.log('⚠️ Erro ao comunicar com extensão:', error)
          }
        }

        console.log('✅ Timer iniciado:', response.alreadyExists ? '(já existente)' : '(novo)')
      }
    } catch (error: any) {
      console.error('❌ Erro ao iniciar timer:', error)
      throw error
    }
  }

  // Stop timer
  const stopTimer = async (completionData?: {
    notes?: string
    completedQuestions?: number
    correctQuestions?: number
  }) => {
    if (!timer.value.isRunning || !timer.value.id) {
      console.warn('⚠️ Nenhum timer ativo para parar')
      return null
    }

    try {
      // Stop intervals immediately
      stopDisplayInterval()
      stopSyncInterval()

      // Call API to stop timer
      const response = await $fetch('/api/study-timer/stop', {
        method: 'POST',
        body: {
          timer_id: timer.value.id,
          notes: completionData?.notes,
          completed_questions: completionData?.completedQuestions,
          correct_questions: completionData?.correctQuestions,
        },
      })

      // Send message to extension
      if (process.client) {
        window.postMessage({
          source: 'concurseiro-app',
          type: 'STUDY_SESSION_STOPPED',
          data: {
            duration: response.timer.totalSeconds,
            completedQuestions: completionData?.completedQuestions,
            correctQuestions: completionData?.correctQuestions,
          },
        }, '*')
      }

      // Reset state
      timer.value = {
        id: null,
        isRunning: false,
        displaySeconds: 0,
        subjectId: null,
        subjectName: null,
        subjectColor: null,
        subjectIcon: null,
        studyType: 'conteudo',
        plannedQuestions: null,
        startedAt: null,
      }

      console.log('✅ Timer encerrado:', response.timer.totalFormatted)

      return {
        duration: response.timer.totalSeconds,
        formatted: response.timer.totalFormatted,
      }
    } catch (error: any) {
      console.error('❌ Erro ao parar timer:', error)
      throw error
    }
  }

  // Pause timer (not implemented in API yet, but keeping for compatibility)
  const pauseTimer = () => {
    console.warn('⚠️ Pause não implementado no modo servidor')
  }

  // Resume timer (not implemented in API yet, but keeping for compatibility)
  const resumeTimer = () => {
    console.warn('⚠️ Resume não implementado no modo servidor')
  }

  // Cleanup on unmount
  if (process.client) {
    onBeforeUnmount(() => {
      stopDisplayInterval()
      stopSyncInterval()
    })
  }

  return {
    timer,
    formattedTime,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    restoreTimer,
    fetchCurrentTimer,
  }
}

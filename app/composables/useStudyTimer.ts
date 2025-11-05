import type { Database } from '~/types/database.types'

type PersistedTimerState = {
  version: number
  userId: string
  savedAt: number
  timer: {
    isRunning: boolean
    isPaused: boolean
    startTime: number
    elapsed: number
    subjectId: string
    startedAt: string | null
    studyType: 'conteudo' | 'questoes' | 'revisao'
    plannedQuestions: number | null
  }
}

const STORAGE_KEY = 'prapassar:study-timer'

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
    studyType: 'conteudo' as 'conteudo' | 'questoes' | 'revisao',
    plannedQuestions: null as number | null,
  }))

  // Estado Pomodoro (integrado ao timer de estudo)
  const pomodoro = useState('pomodoro-state', () => ({
    focusMinutes: 25,
    breakMinutes: 5,
    alarmEnabled: false, // Desabilitado por padrão
    isFocusPhase: true, // true = foco, false = pausa
    remainingSeconds: 25 * 60, // tempo restante no ciclo atual
    showAlarmModal: false,
    pomodoroStartTime: 0, // Quando o ciclo atual começou
    totalBreakTime: 0, // Total de tempo em pausa (para subtrair do tempo de estudo)
  }))

  const now = useState('study-timer-now', () => Date.now())

  // Guarda o ID do interval no estado global também
  const intervalId = useState<any>('study-timer-interval', () => null)
  const restoredForUser = useState<string | null>('study-timer-restored-user', () => null)

  const hasActiveTimer = () => timer.value.isRunning || timer.value.isPaused

  const persistTimerState = () => {
    if (!process.client) return
    const currentUserId = user.value?.id
    if (!currentUserId) return

    if (!hasActiveTimer()) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    const payload: PersistedTimerState = {
      version: 1,
      userId: currentUserId,
      savedAt: Date.now(),
      timer: {
        isRunning: timer.value.isRunning,
        isPaused: timer.value.isPaused,
        startTime: timer.value.startTime,
        elapsed: timer.value.elapsed,
        subjectId: timer.value.subjectId,
        startedAt: timer.value.startedAt ? new Date(timer.value.startedAt).toISOString() : null,
        studyType: timer.value.studyType,
        plannedQuestions: timer.value.plannedQuestions ?? null,
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('⚠️ Não foi possível persistir o timer localmente:', error)
    }
  }

  const clearPersistedTimer = () => {
    if (!process.client) return
    localStorage.removeItem(STORAGE_KEY)
  }

  const restoreTimerFromStorage = (userId: string | null) => {
    if (!process.client) return false
    if (!userId) return false

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    try {
      const payload = JSON.parse(raw) as PersistedTimerState
      if (!payload?.timer || payload.userId !== userId) return false
      if (!payload.timer.isRunning) return false

      timer.value.isRunning = payload.timer.isRunning
      timer.value.isPaused = payload.timer.isPaused
      timer.value.startTime = payload.timer.startTime || Date.now()
      timer.value.elapsed = payload.timer.elapsed || 0
      timer.value.subjectId = payload.timer.subjectId || ''
      timer.value.studyType = payload.timer.studyType || 'conteudo'
      timer.value.plannedQuestions = payload.timer.plannedQuestions ?? null
      timer.value.startedAt = payload.timer.startedAt ? new Date(payload.timer.startedAt) : (payload.timer.startTime ? new Date(payload.timer.startTime) : new Date())

      now.value = Date.now()

      if (timer.value.isRunning && !timer.value.isPaused) {
        if (intervalId.value) clearInterval(intervalId.value)
        intervalId.value = setInterval(() => {
          now.value = Date.now()
        }, 1000)
      }

      console.log('⏱️ Timer restaurado do armazenamento local')
      return true
    } catch (error) {
      console.warn('⚠️ Falha ao restaurar timer persistido:', error)
      return false
    }
  }

  const restoreTimer = () => restoreTimerFromStorage(user.value?.id || null)

  if (process.client) {
    watch(
      () => user.value?.id || null,
      (currentUserId) => {
        if (!currentUserId) {
          restoredForUser.value = null
          return
        }

        if (restoredForUser.value === currentUserId) return
        restoreTimerFromStorage(currentUserId)
        restoredForUser.value = currentUserId
      },
      { immediate: true }
    )
  }

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

  const startTimer = (subjectId: string, studyType: 'conteudo' | 'questoes' | 'revisao' = 'conteudo', plannedQuestions?: number) => {
    if (timer.value.isRunning) {
      console.log('⏱️ Timer já está rodando')
      return
    }
    console.log('⏱️ Iniciando timer para subject:', subjectId, 'tipo:', studyType)
    timer.value.subjectId = subjectId
    timer.value.studyType = studyType
    timer.value.plannedQuestions = plannedQuestions || null
    timer.value.isRunning = true
    timer.value.isPaused = false
    timer.value.startTime = Date.now()
    timer.value.startedAt = new Date()
    now.value = Date.now()

    // Inicia Pomodoro se estiver habilitado
    if (pomodoro.value.alarmEnabled) {
      pomodoro.value.isFocusPhase = true
      pomodoro.value.pomodoroStartTime = Date.now()
      pomodoro.value.remainingSeconds = pomodoro.value.focusMinutes * 60
      console.log('🍅 Pomodoro iniciado - Fase: FOCO')
    }

    // Limpa interval anterior se existir
    if (intervalId.value) {
      clearInterval(intervalId.value)
      console.log('⏱️ Limpou interval anterior')
    }

    // Cria novo interval
    intervalId.value = setInterval(() => {
      now.value = Date.now()

      // Atualiza Pomodoro se estiver ativo
      if (pomodoro.value.alarmEnabled) {
        // Atualiza se:
        // - Timer rodando E não pausado (fase FOCO)
        // - OU timer pausado E fase PAUSA (continua contando durante pausa)
        const shouldUpdatePomodoro =
          (timer.value.isRunning && !timer.value.isPaused) ||
          (timer.value.isPaused && !pomodoro.value.isFocusPhase)

        if (shouldUpdatePomodoro) {
          const pomodoroElapsed = Math.floor((Date.now() - pomodoro.value.pomodoroStartTime) / 1000)
          const targetSeconds = pomodoro.value.isFocusPhase
            ? pomodoro.value.focusMinutes * 60
            : pomodoro.value.breakMinutes * 60

          pomodoro.value.remainingSeconds = Math.max(0, targetSeconds - pomodoroElapsed)

          // Alarme dispara ao chegar em 0
          if (pomodoro.value.remainingSeconds === 0 && !pomodoro.value.showAlarmModal) {
            console.log('🍅 Alarme Pomodoro disparado!')
            console.log('  - Fase:', pomodoro.value.isFocusPhase ? 'FOCO' : 'PAUSA')
            pomodoro.value.showAlarmModal = true

            // Pausa automaticamente o timer de estudo se for fim do foco
            if (pomodoro.value.isFocusPhase && timer.value.isRunning) {
              pauseTimer()
            }

            // IMPORTANTE: Define remainingSeconds para -1 para NÃO disparar novamente
            // Só volta a contar quando usuário responder ao modal
            pomodoro.value.remainingSeconds = -1
          }
        }
      }
    }, 1000)
    console.log('⏱️ Interval criado:', intervalId.value)
    persistTimerState()
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

    // NÃO limpa o interval se Pomodoro estiver em fase de PAUSA
    // Precisa continuar rodando para contar o tempo de pausa
    if (!pomodoro.value.alarmEnabled || pomodoro.value.isFocusPhase) {
      if (intervalId.value) {
        clearInterval(intervalId.value)
        intervalId.value = null
        console.log('⏱️ Interval pausado e limpo')
      }
    } else {
      console.log('⏱️ Timer pausado, mas interval continua (Pomodoro em pausa)')
    }

    persistTimerState()
  }

  const resumeTimer = () => {
    if (!timer.value.isPaused) return

    console.log('⏱️ Retomando timer')
    console.log('  - Tempo elapsed acumulado:', timer.value.elapsed, 's')

    timer.value.isPaused = false
    timer.value.startTime = Date.now()
    now.value = Date.now()

    // Retoma Pomodoro se estiver habilitado
    if (pomodoro.value.alarmEnabled) {
      pomodoro.value.pomodoroStartTime = Date.now()
      console.log('🍅 Pomodoro retomado - Fase:', pomodoro.value.isFocusPhase ? 'FOCO' : 'PAUSA')
    }

    if (intervalId.value) clearInterval(intervalId.value)
    intervalId.value = setInterval(() => {
      now.value = Date.now()

      // Atualiza Pomodoro se estiver ativo
      if (pomodoro.value.alarmEnabled) {
        // Atualiza se:
        // - Timer rodando E não pausado (fase FOCO)
        // - OU timer pausado E fase PAUSA (continua contando durante pausa)
        const shouldUpdatePomodoro =
          (timer.value.isRunning && !timer.value.isPaused) ||
          (timer.value.isPaused && !pomodoro.value.isFocusPhase)

        if (shouldUpdatePomodoro) {
          const pomodoroElapsed = Math.floor((Date.now() - pomodoro.value.pomodoroStartTime) / 1000)
          const targetSeconds = pomodoro.value.isFocusPhase
            ? pomodoro.value.focusMinutes * 60
            : pomodoro.value.breakMinutes * 60

          pomodoro.value.remainingSeconds = Math.max(0, targetSeconds - pomodoroElapsed)

          // Alarme dispara ao chegar em 0
          if (pomodoro.value.remainingSeconds === 0 && !pomodoro.value.showAlarmModal) {
            console.log('🍅 Alarme Pomodoro disparado!')
            console.log('  - Fase:', pomodoro.value.isFocusPhase ? 'FOCO' : 'PAUSA')
            pomodoro.value.showAlarmModal = true

            // Pausa automaticamente o timer de estudo se for fim do foco
            if (pomodoro.value.isFocusPhase && timer.value.isRunning) {
              pauseTimer()
            }

            // IMPORTANTE: Define remainingSeconds para -1 para NÃO disparar novamente
            // Só volta a contar quando usuário responder ao modal
            pomodoro.value.remainingSeconds = -1
          }
        }
      }
    }, 1000)
    console.log('⏱️ Interval retomado:', intervalId.value)

    persistTimerState()
  }

  const stopTimer = async (notes?: string) => {
    if (!timer.value.isRunning && !timer.value.isPaused) return null
    console.log('⏱️ Encerrando timer')

    // Calcula tempo total
    let duration = timer.value.elapsed + (timer.value.isRunning ? Math.floor((Date.now() - timer.value.startTime) / 1000) : 0)

    // Se Pomodoro estava ativo, desconta o tempo de pausas
    if (pomodoro.value.alarmEnabled && pomodoro.value.totalBreakTime > 0) {
      console.log('⏱️ Tempo total bruto:', duration, 's')
      console.log('⏱️ Tempo em pausas Pomodoro:', pomodoro.value.totalBreakTime, 's')
      duration = Math.max(0, duration - pomodoro.value.totalBreakTime)
      console.log('⏱️ Tempo efetivo de estudo:', duration, 's')
    }

    const startedAt = timer.value.startedAt || new Date()
    const endedAt = new Date()
    const subjectId = timer.value.subjectId

    // Limpa interval
    if (intervalId.value) {
      clearInterval(intervalId.value)
      intervalId.value = null
      console.log('⏱️ Interval encerrado e limpo')
    }

    // Salvar studyType e plannedQuestions antes do reset
    const studyType = timer.value.studyType
    const plannedQuestions = timer.value.plannedQuestions

    // Reset state
    timer.value.isRunning = false
    timer.value.isPaused = false
    timer.value.startTime = 0
    timer.value.elapsed = 0
    timer.value.subjectId = subjectId || ''
    timer.value.studyType = 'conteudo'
    timer.value.plannedQuestions = null

    // Reset Pomodoro
    pomodoro.value.totalBreakTime = 0
    pomodoro.value.isFocusPhase = true
    pomodoro.value.remainingSeconds = pomodoro.value.focusMinutes * 60

    if (!user.value) return { duration }

    // Obter userId da sessão
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = user.value?.id || sessionData?.session?.user?.id

    if (!userId) return { duration }

    // Persist session
    const { error } = await supabase.from('study_sessions').insert({
      user_id: userId,
      subject_id: subjectId || null,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration,
      notes: notes || null,
      study_type: studyType,
      planned_questions: plannedQuestions,
    })
    if (error) throw error

    // Atualizar total_study_time na matéria
    if (subjectId) {
      // Buscar tempo total atual
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('total_study_time')
        .eq('id', subjectId)
        .single()

      const currentTotal = subjectData?.total_study_time || 0
      const newTotal = currentTotal + duration

      // Atualizar com novo total
      const { error: updateError } = await supabase
        .from('subjects')
        .update({ total_study_time: newTotal })
        .eq('id', subjectId)

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
        subject_id: subjectId || null,
        revision_number: parseInt(r.name.slice(1)),
        due_date: dueDate.toISOString().split('T')[0],
        completed: false
      }
    })

    const { error: revError } = await supabase.from('revisions').insert(revisionRecords)
    if (revError) console.error('Erro ao criar revisões:', revError)

    clearPersistedTimer()

    return { duration }
  }

  // ============================================
  // FUNÇÕES POMODORO (INTEGRADAS AO TIMER)
  // ============================================

  const formattedPomodoroTime = computed(() => {
    const mins = Math.floor(pomodoro.value.remainingSeconds / 60)
    const secs = pomodoro.value.remainingSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  })

  const setFocusMinutes = (minutes: number) => {
    if (minutes < 1 || minutes > 120) return
    pomodoro.value.focusMinutes = minutes
    if (!timer.value.isRunning && pomodoro.value.isFocusPhase) {
      pomodoro.value.remainingSeconds = minutes * 60
    }
  }

  const setBreakMinutes = (minutes: number) => {
    if (minutes < 1 || minutes > 60) return
    pomodoro.value.breakMinutes = minutes
    if (!timer.value.isRunning && !pomodoro.value.isFocusPhase) {
      pomodoro.value.remainingSeconds = minutes * 60
    }
  }

  const toggleAlarm = () => {
    pomodoro.value.alarmEnabled = !pomodoro.value.alarmEnabled
    if (pomodoro.value.alarmEnabled) {
      console.log('🍅 Pomodoro ATIVADO')
      // Se já está rodando, inicia o Pomodoro agora
      if (timer.value.isRunning && !timer.value.isPaused) {
        pomodoro.value.isFocusPhase = true
        pomodoro.value.pomodoroStartTime = Date.now()
        pomodoro.value.remainingSeconds = pomodoro.value.focusMinutes * 60
      }
    } else {
      console.log('🍅 Pomodoro DESATIVADO')
    }
  }

  const handleAlarmResponse = (acceptAction: boolean) => {
    pomodoro.value.showAlarmModal = false

    if (pomodoro.value.isFocusPhase) {
      // Fim do FOCO
      if (acceptAction) {
        // Usuário aceita fazer PAUSA
        console.log('🍅 Iniciando pausa de', pomodoro.value.breakMinutes, 'minutos')
        pomodoro.value.isFocusPhase = false
        pomodoro.value.pomodoroStartTime = Date.now()
        pomodoro.value.remainingSeconds = pomodoro.value.breakMinutes * 60

        // IMPORTANTE: Criar interval para contar a pausa
        if (!intervalId.value) {
          console.log('⏱️ Criando interval para fase de PAUSA')
          intervalId.value = setInterval(() => {
            now.value = Date.now()

            if (pomodoro.value.alarmEnabled && !pomodoro.value.isFocusPhase) {
              // Atualiza countdown da pausa
              const pomodoroElapsed = Math.floor((Date.now() - pomodoro.value.pomodoroStartTime) / 1000)
              const targetSeconds = pomodoro.value.breakMinutes * 60
              pomodoro.value.remainingSeconds = Math.max(0, targetSeconds - pomodoroElapsed)

              // Alarme dispara ao fim da pausa
              if (pomodoro.value.remainingSeconds === 0 && !pomodoro.value.showAlarmModal) {
                console.log('🍅 Alarme Pomodoro disparado!')
                console.log('  - Fase: PAUSA')
                pomodoro.value.showAlarmModal = true
                pomodoro.value.remainingSeconds = -1
              }
            }
          }, 1000)
          console.log('⏱️ Interval de pausa criado:', intervalId.value)
        }
      } else {
        // Usuário quer continuar estudando (ignora Pomodoro)
        console.log('🍅 Usuário ignorou pausa - retomando estudo')
        if (timer.value.isPaused) {
          resumeTimer()
        }
        // Reinicia ciclo de foco
        pomodoro.value.isFocusPhase = true
        pomodoro.value.pomodoroStartTime = Date.now()
        pomodoro.value.remainingSeconds = pomodoro.value.focusMinutes * 60
      }
    } else {
      // Fim da PAUSA
      const breakDuration = pomodoro.value.breakMinutes * 60 // Tempo total da pausa em segundos

      if (acceptAction) {
        // Usuário aceita VOLTAR a estudar
        console.log('🍅 Voltando aos estudos - iniciando foco')
        console.log('  - Tempo de pausa completado:', breakDuration, 's')

        // Registra tempo de pausa para descontar do tempo total
        pomodoro.value.totalBreakTime += breakDuration

        pomodoro.value.isFocusPhase = true
        pomodoro.value.pomodoroStartTime = Date.now()
        pomodoro.value.remainingSeconds = pomodoro.value.focusMinutes * 60
        // Retoma timer de estudo
        if (timer.value.isPaused) {
          resumeTimer()
        }
      } else {
        // Usuário quer continuar na pausa
        console.log('🍅 Usuário quer mais pausa - reiniciando timer de pausa')

        // Registra a pausa que acabou de completar
        pomodoro.value.totalBreakTime += breakDuration

        // Reinicia countdown de pausa
        pomodoro.value.pomodoroStartTime = Date.now()
        pomodoro.value.remainingSeconds = pomodoro.value.breakMinutes * 60

        // IMPORTANTE: Limpar interval anterior e criar novo
        if (intervalId.value) {
          clearInterval(intervalId.value)
          intervalId.value = null
        }

        console.log('⏱️ Criando novo interval para fase de PAUSA (extensão)')
        intervalId.value = setInterval(() => {
          now.value = Date.now()

          if (pomodoro.value.alarmEnabled && !pomodoro.value.isFocusPhase) {
            // Atualiza countdown da pausa
            const pomodoroElapsed = Math.floor((Date.now() - pomodoro.value.pomodoroStartTime) / 1000)
            const targetSeconds = pomodoro.value.breakMinutes * 60
            pomodoro.value.remainingSeconds = Math.max(0, targetSeconds - pomodoroElapsed)

            // Alarme dispara ao fim da pausa
            if (pomodoro.value.remainingSeconds === 0 && !pomodoro.value.showAlarmModal) {
              console.log('🍅 Alarme Pomodoro disparado!')
              console.log('  - Fase: PAUSA (extensão)')
              pomodoro.value.showAlarmModal = true
              pomodoro.value.remainingSeconds = -1
            }
          }
        }, 1000)
        console.log('⏱️ Interval de pausa (extensão) criado:', intervalId.value)
      }
    }
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
    // Pomodoro (integrado ao timer)
    pomodoro,
    formattedPomodoroTime,
    setFocusMinutes,
    setBreakMinutes,
    toggleAlarm,
    handleAlarmResponse,
    restoreTimer,
    clearPersistedTimer,
  }
}

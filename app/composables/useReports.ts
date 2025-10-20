import type { Database } from '~/types/database.types'

interface ReportStats {
  totalHours: string
  totalMinutes: number
  dailyAverage: string
  totalQuestions: number
  successRate: number
  weeklyTrend: number
  monthlyComparison: number
  goalProgress: number
}

interface SubjectReport {
  subject: string
  color: string
  minutes: number
  sessions: number
  percentage: number
}

interface QuestionReport {
  subject: string
  color: string
  total: number
  correct: number
  wrong: number
  rate: number
}

interface ExerciseReport {
  subject: string
  color: string
  title: string
  totalQuestions: number
  correctAnswers: number
  score: number
  createdAt: string
}

interface StudyTypeStats {
  conteudo: number
  conteudoSessions: number
  questoes: number
  questoesSessions: number
  revisao: number
  revisaoSessions: number
}

interface DailyStudyData {
  date: string
  minutes: number
  sessions: number
}

interface ReportData {
  stats: ReportStats
  bySubject: SubjectReport[]
  questionsBySubject: QuestionReport[]
  exercisesBySubject: ExerciseReport[]
  studyTypes: StudyTypeStats
  dailyData: DailyStudyData[]
  revisionStats: {
    pending: number
    completed: number
    skipped: number
    completionRate: number
  }
}

export const useReports = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const { isLoading, error, withLoading } = useLoading()

  const formatHours = (minutes: number): string => {
    if (!minutes) return '0h'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}min`
    if (h > 0) return `${h}h`
    return `${m}min`
  }

  const calculateTrend = (currentPeriod: number, previousPeriod: number): number => {
    if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0
    return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100)
  }

  const getDateRange = (period: string) => {
    const today = new Date()
    let startDate = new Date()
    let previousStartDate = new Date()

    if (period === '7days') {
      startDate.setDate(today.getDate() - 7)
      previousStartDate.setDate(today.getDate() - 14)
    } else if (period === '15days') {
      startDate.setDate(today.getDate() - 15)
      previousStartDate.setDate(today.getDate() - 30)
    } else if (period === '30days') {
      startDate.setDate(today.getDate() - 30)
      previousStartDate.setDate(today.getDate() - 60)
    } else if (period === '60days') {
      startDate.setDate(today.getDate() - 60)
      previousStartDate.setDate(today.getDate() - 120)
    } else if (period === '90days') {
      startDate.setDate(today.getDate() - 90)
      previousStartDate.setDate(today.getDate() - 180)
    } else {
      startDate = new Date('2000-01-01')
      previousStartDate = new Date('2000-01-01')
    }

    // ✅ CORREÇÃO CRÍTICA: Adicionar horário ao endDate para incluir o dia todo
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endOfToday.toISOString(), // Agora com hora: 2025-10-20T23:59:59.999Z
      previousStartDate: previousStartDate.toISOString().split('T')[0],
      previousEndDate: startDate.toISOString().split('T')[0]
    }
  }

  const loadReportData = async (period: string = '30days', subjectId?: string): Promise<ReportData | null> => {
    // ✅ CORREÇÃO: Usar getSession() ao invés de user.value.id
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) {
      console.error('[useReports] Usuário não autenticado')
      return null
    }

    console.log('[useReports] Carregando dados para user:', userId, 'subject:', subjectId || 'all')

    return await withLoading(async () => {
      const { startDate, endDate, previousStartDate, previousEndDate } = getDateRange(period)
      console.log('[useReports] Período:', { startDate, endDate }, 'Subject filter:', subjectId)

      // Buscar sessões do período atual (da tabela study_sessions)
      let sessionsQuery = supabase
        .from('study_sessions')
        .select('*, subjects(name, color)')
        .eq('user_id', userId)
        .gte('started_at', startDate)
        .lte('started_at', endDate)

      if (subjectId) {
        sessionsQuery = sessionsQuery.eq('subject_id', subjectId)
      }

      const { data: sessions, error: sessionsError } = await sessionsQuery.order('started_at', { ascending: true })

      if (sessionsError) {
        console.error('[useReports] Erro ao buscar sessões:', sessionsError)
      } else {
        console.log('[useReports] Sessions encontradas:', sessions?.length || 0)
      }

      // Buscar sessões do período anterior para comparação
      let prevSessionsQuery = supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', userId)
        .gte('started_at', previousStartDate)
        .lt('started_at', previousEndDate)

      if (subjectId) {
        prevSessionsQuery = prevSessionsQuery.eq('subject_id', subjectId)
      }

      const { data: previousSessions } = await prevSessionsQuery

      // Buscar tentativas de questões do período atual
      let questionsQuery = supabase
        .from('question_attempts')
        .select(`
          *,
          questions(subject_id, subjects(name, color))
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      // Note: subject filtering for questions is more complex due to nested relation
      // We'll filter after fetching if needed

      const { data: questionAttempts, error: questionsError } = await questionsQuery

      if (questionsError) {
        console.error('[useReports] Erro ao buscar questões:', questionsError)
      } else {
        console.log('[useReports] Questões encontradas:', questionAttempts?.length || 0)
      }

      // Buscar exercícios IA salvos do período atual
      console.log('[useReports] 🔍 Buscando exercícios IA... (subjectId:', subjectId || 'all', ')')

      // Tentar SEM o join de subjects primeiro para ver se é isso que está causando problema
      let exercisesQuery = supabase
        .from('saved_exercise_results')
        .select('*') // Removido temporariamente: subjects(name, color)
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (subjectId) {
        exercisesQuery = exercisesQuery.eq('subject_id', subjectId)
      }

      const { data: savedExercises, error: exercisesError } = await exercisesQuery.order('created_at', { ascending: false })

      if (exercisesError) {
        console.error('[useReports] ❌ Erro ao buscar exercícios IA:', exercisesError.message)
      } else {
        console.log('[useReports] ✅ Exercícios IA encontrados:', savedExercises?.length || 0)
      }


      // Buscar estatísticas de revisões
      let revisionsQuery = supabase
        .from('revisions')
        .select('status')
        .eq('user_id', userId)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)

      if (subjectId) {
        revisionsQuery = revisionsQuery.eq('subject_id', subjectId)
      }

      const { data: revisions } = await revisionsQuery

      // Buscar meta do usuário
      const { data: goal } = await supabase
        .from('study_goals')
        .select('daily_hours, target_date')
        .eq('user_id', userId)
        .single()

      // Não retornar vazio se não houver sessões, pois pode haver questões
      // Removido o early return aqui

      // Processar dados
      let totalMinutes = 0
      let totalQuestions = 0
      let totalCorrect = 0
      let previousTotalMinutes = 0

      const subjectMap = new Map<string, any>()
      const questionMap = new Map<string, any>()
      const exercisesList: ExerciseReport[] = []
      const typeMinutes = { conteudo: 0, questoes: 0, revisao: 0 }
      const typeSessions = { conteudo: 0, questoes: 0, revisao: 0 }
      const dailyMap = new Map<string, DailyStudyData>()

      // Processar sessões atuais (se houver)
      if (sessions && sessions.length > 0) {
        sessions.forEach((session: any) => {
          // Converter duração de segundos para minutos
          const minutes = Math.floor((session.duration || 0) / 60)
          totalMinutes += minutes

          // Dados diários (extrair data de started_at)
          const dateKey = session.started_at.split('T')[0]
          if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, { date: dateKey, minutes: 0, sessions: 0 })
          }
          const dailyData = dailyMap.get(dateKey)!
          dailyData.minutes += minutes
          dailyData.sessions++

          // Por matéria
          const subjectName = session.subjects?.name || 'Sem matéria'
          const subjectColor = session.subjects?.color || '#22C55E'
          if (!subjectMap.has(subjectName)) {
            subjectMap.set(subjectName, {
              subject: subjectName,
              color: subjectColor,
              minutes: 0,
              sessions: 0,
              percentage: 0
            })
          }
          const subjectData = subjectMap.get(subjectName)
          subjectData.minutes += minutes
          subjectData.sessions++

          // ✅ NOVO: Processar tipos de estudo e questões
          const studyType = session.study_type || 'conteudo'
          if (studyType === 'conteudo') {
            typeMinutes.conteudo += minutes
            typeSessions.conteudo++
          } else if (studyType === 'questoes') {
            typeMinutes.questoes += minutes
            typeSessions.questoes++
            // Contar questões da sessão
            if (session.completed_questions) {
              totalQuestions += session.completed_questions
              totalCorrect += session.correct_questions || 0
            }
          } else if (studyType === 'revisao') {
            typeMinutes.revisao += minutes
            typeSessions.revisao++
          }
        })
      }

      // Processar tentativas de questões
      if (questionAttempts && questionAttempts.length > 0) {
        console.log('[useReports] 🔍 Processando questões com filtro de subject:', subjectId)
        let filteredCount = 0
        questionAttempts.forEach((attempt: any) => {
          // Filter by subject if specified
          if (subjectId && attempt.questions?.subject_id !== subjectId) {
            console.log('[useReports] ⏭️ Pulando questão - subject_id:', attempt.questions?.subject_id, '!==', subjectId)
            return
          }

          filteredCount++
          totalQuestions++
          if (attempt.is_correct) {
            totalCorrect++
          }

          // Agrupar por matéria
          const subjectName = attempt.questions?.subjects?.name || 'Sem matéria'
          const subjectColor = attempt.questions?.subjects?.color || '#22C55E'

          if (!questionMap.has(subjectName)) {
            questionMap.set(subjectName, {
              subject: subjectName,
              color: subjectColor,
              total: 0,
              correct: 0,
              wrong: 0,
              rate: 0
            })
          }

          const qData = questionMap.get(subjectName)
          qData.total++
          if (attempt.is_correct) {
            qData.correct++
          }
        })
        console.log('[useReports] ✅ Questões processadas:', filteredCount, 'de', questionAttempts.length)
        console.log('[useReports] 📊 Total de questões:', totalQuestions, 'Corretas:', totalCorrect)
      }

      // Processar exercícios IA salvos
      if (savedExercises && savedExercises.length > 0) {
        console.log('[useReports] 📊 Processando', savedExercises.length, 'exercícios IA...')
        savedExercises.forEach((exercise: any) => {
          // Adicionar questões dos exercícios ao total geral
          const questionsToAdd = exercise.total_questions || 0
          const correctToAdd = exercise.correct_answers || 0

          console.log('[useReports] 📝 Exercício IA:', exercise.title, '- Questões:', questionsToAdd, 'Corretas:', correctToAdd)

          totalQuestions += questionsToAdd
          totalCorrect += correctToAdd

          // Adicionar à lista de exercícios (SEM depender de subjects por enquanto)
          exercisesList.push({
            subject: 'Exercícios IA', // Temporário: sempre este nome
            color: '#8B5CF6', // Roxo para IA
            title: exercise.title,
            totalQuestions: exercise.total_questions,
            correctAnswers: exercise.correct_answers,
            score: exercise.score_percentage,
            createdAt: exercise.created_at
          })
        })
        console.log('[useReports] 📊 Exercícios processados:', exercisesList.length)
      }

      // Processar sessões anteriores
      if (previousSessions) {
        previousSessions.forEach(session => {
          const minutes = Math.floor((session.duration || 0) / 60)
          previousTotalMinutes += minutes
        })
      }

      // Calcular porcentagens por matéria
      subjectMap.forEach(subject => {
        subject.percentage = totalMinutes > 0 ? Math.round((subject.minutes / totalMinutes) * 100) : 0
      })

      // Calcular métricas
      const days = period === 'all' ? 30 : parseInt(period.replace('days', ''))
      const dailyAvg = totalMinutes / days
      const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
      const weeklyTrend = calculateTrend(totalMinutes, previousTotalMinutes)

      console.log('[useReports] 🎯 MÉTRICAS FINAIS:')
      console.log('[useReports] 📊 Total de Questões:', totalQuestions)
      console.log('[useReports] ✅ Total Corretas:', totalCorrect)
      console.log('[useReports] 🎯 Taxa de Acerto:', successRate, '%')
      console.log('[useReports] 📚 Matérias processadas:', subjectMap.size)

      // Progresso da meta
      let goalProgress = 0
      if (goal?.daily_hours) {
        const targetMinutesPerDay = goal.daily_hours * 60
        const actualMinutesPerDay = dailyAvg
        goalProgress = Math.min(Math.round((actualMinutesPerDay / targetMinutesPerDay) * 100), 100)
      }

      // Estatísticas de revisões
      let revisionPending = 0
      let revisionCompleted = 0
      let revisionSkipped = 0

      if (revisions) {
        revisions.forEach(rev => {
          if (rev.status === 'pending') revisionPending++
          else if (rev.status === 'completed') revisionCompleted++
          else if (rev.status === 'skipped') revisionSkipped++
        })
      }

      const totalRevisions = revisionPending + revisionCompleted + revisionSkipped
      const revisionCompletionRate = totalRevisions > 0
        ? Math.round((revisionCompleted / totalRevisions) * 100)
        : 0

      return {
        stats: {
          totalHours: formatHours(totalMinutes),
          totalMinutes,
          dailyAverage: formatHours(Math.round(dailyAvg)),
          totalQuestions,
          successRate,
          weeklyTrend,
          monthlyComparison: weeklyTrend,
          goalProgress
        },
        bySubject: Array.from(subjectMap.values()).sort((a, b) => b.minutes - a.minutes),
        questionsBySubject: Array.from(questionMap.values()).map(item => {
          item.wrong = item.total - item.correct
          item.rate = Math.round((item.correct / item.total) * 100)
          return item
        }).sort((a, b) => b.total - a.total),
        exercisesBySubject: exercisesList,
        studyTypes: {
          conteudo: typeMinutes.conteudo,
          conteudoSessions: typeSessions.conteudo,
          questoes: typeMinutes.questoes,
          questoesSessions: typeSessions.questoes,
          revisao: typeMinutes.revisao,
          revisaoSessions: typeSessions.revisao
        },
        dailyData: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
        revisionStats: {
          pending: revisionPending,
          completed: revisionCompleted,
          skipped: revisionSkipped,
          completionRate: revisionCompletionRate
        }
      }
    })
  }

  const exportToCSV = (data: ReportData) => {
    const csvRows = []

    // Header
    csvRows.push('Relatório de Estudos - PraPassar\n')

    // Estatísticas gerais
    csvRows.push('\nEstatísticas Gerais')
    csvRows.push('Métrica,Valor')
    csvRows.push(`Tempo Total,${data.stats.totalHours}`)
    csvRows.push(`Média Diária,${data.stats.dailyAverage}`)
    csvRows.push(`Total de Questões,${data.stats.totalQuestions}`)
    csvRows.push(`Taxa de Acerto,${data.stats.successRate}%`)

    // Por matéria
    csvRows.push('\nTempo por Matéria')
    csvRows.push('Matéria,Tempo,Sessões,Porcentagem')
    data.bySubject.forEach(item => {
      const hours = Math.floor(item.minutes / 60)
      const mins = item.minutes % 60
      csvRows.push(`${item.subject},${hours}h ${mins}min,${item.sessions},${item.percentage}%`)
    })

    // Tipos de Estudo
    csvRows.push('\nTempo por Tipo de Estudo')
    csvRows.push('Tipo,Tempo (minutos),Sessões')
    csvRows.push(`Conteúdo,${data.studyTypes.conteudo},${data.studyTypes.conteudoSessions}`)
    csvRows.push(`Questões,${data.studyTypes.questoes},${data.studyTypes.questoesSessions}`)
    csvRows.push(`Revisão,${data.studyTypes.revisao},${data.studyTypes.revisaoSessions}`)

    // Questões por matéria
    if (data.questionsBySubject.length > 0) {
      csvRows.push('\nDesempenho em Questões')
      csvRows.push('Matéria,Total,Acertos,Erros,Taxa de Acerto')
      data.questionsBySubject.forEach(item => {
        csvRows.push(`${item.subject},${item.total},${item.correct},${item.wrong},${item.rate}%`)
      })
    }

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-estudos-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    isLoading,
    error,
    formatHours,
    loadReportData,
    exportToCSV
  }
}

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
    } else if (period === '30days') {
      startDate.setDate(today.getDate() - 30)
      previousStartDate.setDate(today.getDate() - 60)
    } else if (period === '90days') {
      startDate.setDate(today.getDate() - 90)
      previousStartDate.setDate(today.getDate() - 180)
    } else {
      startDate = new Date('2000-01-01')
      previousStartDate = new Date('2000-01-01')
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      previousStartDate: previousStartDate.toISOString().split('T')[0],
      previousEndDate: startDate.toISOString().split('T')[0]
    }
  }

  const loadReportData = async (period: string = '30days'): Promise<ReportData | null> => {
    if (!user.value) return null

    return await withLoading(async () => {
      const { startDate, endDate, previousStartDate, previousEndDate } = getDateRange(period)

      // Buscar sessões do período atual (da tabela study_sessions)
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*, subjects(name, color)')
        .eq('user_id', user.value.id)
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .order('started_at', { ascending: true })

      // Buscar sessões do período anterior para comparação
      const { data: previousSessions } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.value.id)
        .gte('started_at', previousStartDate)
        .lt('started_at', previousEndDate)

      // Buscar estatísticas de revisões
      const { data: revisions } = await supabase
        .from('revisions')
        .select('status')
        .eq('user_id', user.value.id)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)

      // Buscar meta do usuário
      const { data: goal } = await supabase
        .from('study_goals')
        .select('daily_hours, target_date')
        .eq('user_id', user.value.id)
        .single()

      if (!sessions || sessions.length === 0) {
        return {
          stats: {
            totalHours: '0h',
            totalMinutes: 0,
            dailyAverage: '0h',
            totalQuestions: 0,
            successRate: 0,
            weeklyTrend: 0,
            monthlyComparison: 0,
            goalProgress: 0
          },
          bySubject: [],
          questionsBySubject: [],
          studyTypes: {
            conteudo: 0,
            conteudoSessions: 0,
            questoes: 0,
            questoesSessions: 0,
            revisao: 0,
            revisaoSessions: 0
          },
          dailyData: [],
          revisionStats: {
            pending: 0,
            completed: 0,
            skipped: 0,
            completionRate: 0
          }
        }
      }

      // Processar dados
      let totalMinutes = 0
      let totalQuestions = 0
      let totalCorrect = 0
      let previousTotalMinutes = 0

      const subjectMap = new Map<string, any>()
      const questionMap = new Map<string, any>()
      const typeMinutes = { conteudo: 0, questoes: 0, revisao: 0 }
      const typeSessions = { conteudo: 0, questoes: 0, revisao: 0 }
      const dailyMap = new Map<string, DailyStudyData>()

      // Processar sessões atuais
      sessions.forEach(session => {
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

        // NOTA: study_sessions não tem campos de questões ou tipos de estudo
        // Essas features ficam para study_schedules (calendário)
      })

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
        studyTypes: {
          // NOTA: study_sessions não tem tipos de estudo
          // Para ter essa funcionalidade, seria necessário adicionar um campo 'type' na tabela
          // Por enquanto, retornamos o total em 'conteudo' já que timer não especifica tipo
          conteudo: totalMinutes,
          conteudoSessions: sessions.length,
          questoes: 0,
          questoesSessions: 0,
          revisao: 0,
          revisaoSessions: 0
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

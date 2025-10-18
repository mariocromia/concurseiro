import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  // 1. Authentication
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado',
    })
  }

  // 2. Business Logic
  const supabase = await serverSupabaseClient<Database>(event)

  // Get active timer with subject info
  const { data: timer, error } = await supabase
    .from('study_timers')
    .select('*, subjects(name, color, icon)')
    .eq('user_id', user.id)
    .eq('is_running', true)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Erro ao buscar timer: ${error.message}`,
    })
  }

  // No active timer
  if (!timer) {
    return {
      hasActiveTimer: false,
      timer: null,
    }
  }

  // Calculate elapsed time SERVER-SIDE
  const now = new Date()
  const startTime = new Date(timer.start_time)
  const currentElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
  const totalElapsedSeconds = (timer.elapsed_seconds || 0) + currentElapsed

  // Format time
  const hours = Math.floor(totalElapsedSeconds / 3600)
  const minutes = Math.floor((totalElapsedSeconds % 3600) / 60)
  const seconds = totalElapsedSeconds % 60
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // 3. Return
  return {
    hasActiveTimer: true,
    timer: {
      id: timer.id,
      startTime: timer.start_time,
      elapsedSeconds: totalElapsedSeconds,
      formattedTime,
      isRunning: true,
      subjectId: timer.subject_id,
      studyType: timer.study_type,
      plannedQuestions: timer.planned_questions,
      activityName: timer.activity_name,
      subject: timer.subjects ? {
        name: timer.subjects.name,
        color: timer.subjects.color,
        icon: timer.subjects.icon,
      } : null,
    },
  }
})

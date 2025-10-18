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

  // 2. Validation
  const body = await readBody(event)
  const { timer_id, notes, completed_questions, correct_questions } = body

  if (!timer_id) {
    throw createError({
      statusCode: 400,
      message: 'timer_id é obrigatório',
    })
  }

  // 3. Business Logic
  const supabase = await serverSupabaseClient<Database>(event)

  // Get timer data
  const { data: timer, error: timerError } = await supabase
    .from('study_timers')
    .select('*')
    .eq('id', timer_id)
    .eq('user_id', user.id)
    .eq('is_running', true)
    .maybeSingle()

  if (timerError) {
    throw createError({
      statusCode: 500,
      message: `Erro ao buscar timer: ${timerError.message}`,
    })
  }

  if (!timer) {
    throw createError({
      statusCode: 404,
      message: 'Timer não encontrado ou já foi encerrado',
    })
  }

  // Calculate total elapsed time
  const now = new Date()
  const startTime = new Date(timer.start_time)
  const currentElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
  const totalSeconds = (timer.elapsed_seconds || 0) + currentElapsed

  // Format time
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const totalFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  // Save to study_sessions
  const { error: sessionError } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      subject_id: timer.subject_id,
      started_at: timer.start_time,
      ended_at: now.toISOString(),
      duration: totalSeconds,
      notes: notes || null,
    })

  if (sessionError) {
    throw createError({
      statusCode: 500,
      message: `Erro ao salvar sessão: ${sessionError.message}`,
    })
  }

  // Save to study_schedules (for calendar)
  const scheduleData: any = {
    user_id: user.id,
    subject_id: timer.subject_id || null,
    scheduled_date: new Date(timer.start_time).toISOString().split('T')[0],
    scheduled_time: new Date(timer.start_time).toTimeString().split(' ')[0].substring(0, 5),
    planned_duration: Math.floor(totalSeconds / 60),
    study_type: timer.study_type,
    planned_questions: timer.planned_questions,
    status: 'completed',
    completed_at: now.toISOString(),
    actual_duration: Math.floor(totalSeconds / 60),
    completed_questions: completed_questions || null,
    correct_questions: correct_questions || null,
    notes: notes || null,
    is_recurring: false,
  }

  const { error: scheduleError } = await supabase
    .from('study_schedules')
    .insert(scheduleData)

  if (scheduleError) {
    console.warn('⚠️ Erro ao salvar no calendário:', scheduleError)
  }

  // Schedule R1-R7 revisions
  if (timer.subject_id) {
    try {
      const dayOffsets = [1, 7, 14, 30, 60, 120, 240]
      const revisions = dayOffsets.map((days, idx) => {
        const revisionDate = new Date(now)
        revisionDate.setDate(revisionDate.getDate() + days)
        return {
          user_id: user.id,
          subject_id: timer.subject_id!,
          page_id: null,
          revision_number: idx + 1,
          scheduled_date: revisionDate.toISOString(),
          status: 'pending' as const,
        }
      })

      await supabase.from('revisions').insert(revisions)
    } catch (e) {
      console.warn('⚠️ Falha ao agendar revisões:', e)
    }
  }

  // Update subject total_study_time
  if (timer.subject_id) {
    const { data: subject } = await supabase
      .from('subjects')
      .select('total_study_time')
      .eq('id', timer.subject_id)
      .single()

    const currentTime = subject?.total_study_time || 0
    await supabase
      .from('subjects')
      .update({ total_study_time: currentTime + totalSeconds })
      .eq('id', timer.subject_id)
  }

  // Mark timer as stopped and delete
  await supabase
    .from('study_timers')
    .update({
      is_running: false,
      end_time: now.toISOString(),
      elapsed_seconds: totalSeconds,
    })
    .eq('id', timer_id)

  // Delete timer record (cleanup)
  await supabase
    .from('study_timers')
    .delete()
    .eq('id', timer_id)

  // 4. Return
  return {
    success: true,
    timer: {
      id: timer_id,
      totalSeconds,
      totalFormatted,
      startedAt: timer.start_time,
      endedAt: now.toISOString(),
    },
  }
})

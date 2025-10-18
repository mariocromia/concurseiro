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
  const { subject_id, study_type, planned_questions, activity_name } = body

  if (!study_type || !['conteudo', 'questoes', 'revisao'].includes(study_type)) {
    throw createError({
      statusCode: 400,
      message: 'Tipo de estudo inválido. Use: conteudo, questoes ou revisao',
    })
  }

  // 3. Business Logic
  const supabase = await serverSupabaseClient<Database>(event)

  // Check for existing active timer
  const { data: existingTimer, error: checkError } = await supabase
    .from('study_timers')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_running', true)
    .maybeSingle()

  if (checkError) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao verificar timer existente',
    })
  }

  // If timer exists, return it instead of creating new one
  if (existingTimer) {
    const now = new Date()
    const startTime = new Date(existingTimer.start_time)
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000) + (existingTimer.elapsed_seconds || 0)

    return {
      success: true,
      alreadyExists: true,
      timer: {
        id: existingTimer.id,
        startTime: existingTimer.start_time,
        elapsedSeconds,
        isRunning: true,
        subjectId: existingTimer.subject_id,
        studyType: existingTimer.study_type,
      },
    }
  }

  // Create new timer
  const now = new Date()
  const { data: newTimer, error: insertError } = await supabase
    .from('study_timers')
    .insert({
      user_id: user.id,
      subject_id: subject_id || null,
      study_type,
      planned_questions: planned_questions || null,
      activity_name: activity_name || null,
      start_time: now.toISOString(),
      is_running: true,
      elapsed_seconds: 0,
    })
    .select()
    .single()

  if (insertError) {
    throw createError({
      statusCode: 500,
      message: `Erro ao criar timer: ${insertError.message}`,
    })
  }

  // 4. Return
  return {
    success: true,
    alreadyExists: false,
    timer: {
      id: newTimer.id,
      startTime: newTimer.start_time,
      elapsedSeconds: 0,
      isRunning: true,
      subjectId: newTimer.subject_id,
      studyType: newTimer.study_type,
    },
  }
})

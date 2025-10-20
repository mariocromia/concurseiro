// ============================================
// API: Salvar resultado de exercício IA
// ============================================

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  console.log('[API exercises/save] ===== INÍCIO =====')

  // Usar serverSupabaseClient do Nuxt (gerencia autenticação automaticamente)
  const client = await serverSupabaseClient(event)

  // ✅ CORREÇÃO: Usar getSession() ao invés de getUser() (mesma solução dos relatórios)
  const { data: sessionData, error: sessionError } = await client.auth.getSession()
  const userId = sessionData?.session?.user?.id

  console.log('[API exercises/save] User ID:', userId)

  if (sessionError || !userId) {
    console.error('[API exercises/save] ❌ Erro de autenticação:', sessionError)
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // Ler body
  const body = await readBody(event)
  console.log('[API exercises/save] Body recebido:', JSON.stringify(body, null, 2))

  const {
    subject_id,
    title,
    total_questions,
    correct_answers,
    score_percentage,
    questions_data
  } = body

  // Validação básica
  if (!title || !total_questions || correct_answers === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Dados incompletos. Necessário: title, total_questions, correct_answers'
    })
  }

  // Calcular score se não fornecido
  const score = score_percentage || Math.round((correct_answers / total_questions) * 100)

  console.log('[API exercises/save] Dados a inserir:', {
    user_id: userId,
    subject_id: subject_id || null,
    title,
    total_questions,
    correct_answers,
    score_percentage: score
  })

  try {
    // Inserir na tabela saved_exercise_results
    const { data, error } = await client
      .from('saved_exercise_results')
      .insert({
        user_id: userId,
        subject_id: subject_id || null,
        title,
        total_questions,
        correct_answers,
        score_percentage: score,
        questions_data: questions_data || {}
      })
      .select()
      .single()

    if (error) {
      console.error('[API exercises/save] ❌ Erro Supabase:', error)
      console.error('[API exercises/save] Error details:', JSON.stringify(error, null, 2))
      throw createError({
        statusCode: 500,
        message: `Erro ao salvar exercício: ${error.message}`
      })
    }

    console.log('[API exercises/save] ✅ Exercício salvo com sucesso:', data?.id)

    return {
      success: true,
      data
    }
  } catch (err: any) {
    console.error('[API exercises/save] Erro:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Erro ao salvar exercício'
    })
  }
})

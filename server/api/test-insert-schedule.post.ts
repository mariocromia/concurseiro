// ============================================
// 🧪 ENDPOINT DE TESTE - INSERÇÃO DIRETA NO study_schedules
// ============================================
// Este endpoint é APENAS para diagnóstico
// Deve ser REMOVIDO após identificar o problema

import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  console.log('🧪 === TESTE DE INSERÇÃO DIRETA ===')

  try {
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError)
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    console.log('✅ Usuário autenticado:', user.id)

    // Tentar inserir um registro de teste mínimo
    const testData = {
      user_id: user.id,
      title: 'TESTE - Inserção Direta',
      scheduled_date: new Date().toISOString().split('T')[0], // Data de hoje

      // Tentar APENAS com campos antigos primeiro
      scheduled_time: '14:00',
      planned_duration: 60,
      study_type: 'conteudo',
      status: 'pending'
    }

    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2))

    const { data, error: insertError } = await supabase
      .from('study_schedules')
      .insert(testData)
      .select()

    if (insertError) {
      console.error('❌ ERRO ao inserir:', insertError)
      return {
        success: false,
        error: {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        }
      }
    }

    console.log('✅ SUCESSO! Dados inseridos:', data)

    return {
      success: true,
      message: 'Registro de teste criado com sucesso!',
      data: data
    }

  } catch (err: any) {
    console.error('❌ EXCEPTION:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Internal server error'
    })
  }
})

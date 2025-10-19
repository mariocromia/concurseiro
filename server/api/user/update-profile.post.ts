import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { updateProfileSchema, validateBody } from '../../utils/validation-schemas'

/**
 * POST /api/user/update-profile
 * Updates user profile (name, phone, avatar)
 *
 * @author Claude Code
 * @date 2025-10-19
 */
export default defineEventHandler(async (event) => {
  console.log('\n=== [UPDATE PROFILE] INÍCIO DA REQUISIÇÃO ===')

  // 1. Authentication - Verificar se o usuário está autenticado
  console.log('[UPDATE PROFILE] Verificando autenticação...')
  const user = await serverSupabaseUser(event)

  console.log('[UPDATE PROFILE] User object COMPLETO:', user)
  console.log('[UPDATE PROFILE] User keys:', user ? Object.keys(user) : [])

  // O Supabase pode retornar user.id ou user.sub (padrão JWT)
  const userId = user?.id || user?.sub

  console.log('[UPDATE PROFILE] Resultado da autenticação:', {
    authenticated: !!user,
    userId: user?.id || 'UNDEFINED',
    userSub: user?.sub || 'UNDEFINED',
    finalUserId: userId || 'UNDEFINED',
    userEmail: user?.email || 'UNDEFINED',
    userIdType: typeof user?.id,
    userSubType: typeof user?.sub
  })

  if (!user) {
    console.error('[UPDATE PROFILE] ❌ ERRO: Usuário não autenticado')
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // Verificação crítica do UUID
  if (!userId || userId === 'undefined' || typeof userId !== 'string') {
    console.error('[UPDATE PROFILE] ❌ ERRO CRÍTICO: User ID inválido!', {
      userId: user.id,
      userSub: user.sub,
      finalUserId: userId,
      type: typeof userId,
      stringified: JSON.stringify(userId)
    })
    throw createError({
      statusCode: 400,
      message: 'ID de usuário inválido'
    })
  }

  console.log('[UPDATE PROFILE] ✅ Usuário autenticado:', {
    id: userId,
    email: user.email
  })

  // 2. Validation - Pegar e validar os dados do body
  console.log('[UPDATE PROFILE] Lendo body da requisição...')
  const body = await readBody(event)
  console.log('[UPDATE PROFILE] ✅ Body recebido:', {
    hasFullName: !!body.full_name,
    fullName: body.full_name,
    hasPhone: !!body.phone,
    phone: body.phone,
    hasAvatarUrl: !!body.avatar_url,
    avatarUrl: body.avatar_url?.substring(0, 50) + '...' // Truncate URL
  })

  console.log('[UPDATE PROFILE] Validando dados com Zod...')
  const validated = validateBody(updateProfileSchema, body)
  console.log('[UPDATE PROFILE] ✅ Dados validados:', {
    full_name: validated.full_name,
    phone: validated.phone || 'NULL',
    avatar_url: validated.avatar_url?.substring(0, 50) + '...' || 'NULL'
  })

  try {
    console.log('[UPDATE PROFILE] Criando cliente Supabase...')
    const supabase = await serverSupabaseClient(event)
    console.log('[UPDATE PROFILE] ✅ Cliente Supabase criado')

    // 3. Update user metadata in Supabase Auth (para aparecer no useSupabaseUser())
    console.log('[UPDATE PROFILE] 🔄 Atualizando Auth metadata...')
    console.log('[UPDATE PROFILE] Auth payload:', {
      name: validated.full_name,
      phone: validated.phone || 'NULL',
      avatar_url: validated.avatar_url || 'NULL'
    })

    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: {
        name: validated.full_name,
        avatar_url: validated.avatar_url,
        phone: validated.phone
      }
    })

    if (authError) {
      console.error('[UPDATE PROFILE] ❌ ERRO ao atualizar Auth:', {
        message: authError.message,
        status: authError.status,
        name: authError.name
      })
      throw createError({
        statusCode: 500,
        message: 'Erro ao atualizar autenticação: ' + authError.message
      })
    }

    console.log('[UPDATE PROFILE] ✅ Auth metadata atualizado!')
    console.log('[UPDATE PROFILE] Auth data:', authData?.user?.id)

    // 4. Update users table - Salvar no banco de dados
    console.log('[UPDATE PROFILE] 🔄 Atualizando tabela users...')
    console.log('[UPDATE PROFILE] Database update payload:', {
      user_id: userId,
      full_name: validated.full_name,
      phone: validated.phone || 'NULL',
      avatar_url: validated.avatar_url || 'NULL',
      updated_at: new Date().toISOString()
    })

    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .update({
        full_name: validated.full_name,
        phone: validated.phone,
        avatar_url: validated.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (dbError) {
      console.error('[UPDATE PROFILE] ❌ ERRO ao atualizar banco:', {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint
      })
      throw createError({
        statusCode: 500,
        message: 'Erro ao salvar no banco de dados: ' + dbError.message
      })
    }

    console.log('[UPDATE PROFILE] ✅✅✅ Banco de dados atualizado!')
    console.log('[UPDATE PROFILE] Dados salvos:', {
      id: dbData.id,
      full_name: dbData.full_name,
      phone: dbData.phone,
      avatar_url: dbData.avatar_url?.substring(0, 50) + '...'
    })

    // 5. Return success with updated data
    console.log('[UPDATE PROFILE] 🎉 PROCESSO COMPLETO!')
    console.log('=== [UPDATE PROFILE] FIM DA REQUISIÇÃO ===\n')

    return {
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: dbData
    }
  } catch (error: any) {
    console.error('[UPDATE PROFILE] ❌❌❌ ERRO CAPTURADO:', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorStatusCode: error.statusCode,
      errorName: error.name,
      fullError: JSON.stringify(error, null, 2)
    })

    // Se já é um createError, apenas re-throw
    if (error.statusCode) {
      throw error
    }

    // Caso contrário, criar um novo erro
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao atualizar perfil'
    })
  }
})

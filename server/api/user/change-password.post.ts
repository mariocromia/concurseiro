import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { changePasswordSchema, validateBody } from '~/server/utils/validation-schemas'

/**
 * POST /api/user/change-password
 * Changes user password with validation
 */
export default defineEventHandler(async (event) => {
  // 1. Authentication
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // 2. Validation
  const body = await readBody(event)
  const validated = validateBody(changePasswordSchema, body)

  try {
    const supabase = await serverSupabaseClient(event)

    // 3. Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validated.current_password
    })

    if (signInError) {
      throw createError({
        statusCode: 401,
        message: 'Senha atual incorreta'
      })
    }

    // 4. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validated.new_password
    })

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: updateError.message
      })
    }

    // 5. Return success
    return {
      success: true,
      message: 'Senha alterada com sucesso'
    }
  } catch (error: any) {
    console.error('Error changing password:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao alterar senha'
    })
  }
})

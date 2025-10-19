import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { updateProfileSchema, validateBody } from '../../utils/validation-schemas'

/**
 * POST /api/user/update-profile
 * Updates user profile (name and avatar)
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
  const validated = validateBody(updateProfileSchema, body)

  try {
    const supabase = await serverSupabaseClient(event)

    // 3. Update user metadata in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: {
        name: validated.full_name,
        avatar_url: validated.avatar_url
      }
    })

    if (authError) {
      throw createError({
        statusCode: 500,
        message: authError.message
      })
    }

    // 4. Update users table if it exists
    const { error: dbError } = await supabase
      .from('users')
      .update({
        full_name: validated.full_name,
        avatar_url: validated.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (dbError) {
      console.error('Error updating users table:', dbError)
      // Don't throw - auth update succeeded
    }

    // 5. Return success
    return {
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        full_name: validated.full_name,
        avatar_url: validated.avatar_url
      }
    }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar perfil'
    })
  }
})

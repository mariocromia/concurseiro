import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { updatePreferencesSchema, validateBody } from '~/server/utils/validation-schemas'

/**
 * POST /api/user/update-preferences
 * Updates user preferences (theme, notifications)
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
  const validated = validateBody(updatePreferencesSchema, body)

  try {
    const supabase = await serverSupabaseClient(event)

    // 3. Update users table preferences
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (validated.push_notifications_enabled !== undefined) {
      updateData.push_notifications_enabled = validated.push_notifications_enabled
    }

    if (validated.email_notifications_enabled !== undefined) {
      updateData.email_notifications_enabled = validated.email_notifications_enabled
    }

    const { error: dbError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (dbError) {
      throw createError({
        statusCode: 500,
        message: dbError.message
      })
    }

    // 4. Return success
    return {
      success: true,
      message: 'Preferências atualizadas com sucesso',
      data: validated
    }
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar preferências'
    })
  }
})

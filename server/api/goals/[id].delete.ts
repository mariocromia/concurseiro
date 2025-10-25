import { serverSupabaseClient } from '#supabase/server'

// DELETE /api/goals/[id] - Deleta uma meta
export default defineEventHandler(async (event) => {
  try {
    // 1. Authentication
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    // 2. Get goal ID from params
    const goalId = getRouterParam(event, 'id')

    if (!goalId) {
      throw createError({ statusCode: 400, message: 'ID da meta é obrigatório' })
    }

    // 3. Delete goal (cascade will delete checklist items automatically)


    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Erro ao deletar meta: ${error.message}`
      })
    }

    return {
      success: true,
      message: 'Meta deletada com sucesso!'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

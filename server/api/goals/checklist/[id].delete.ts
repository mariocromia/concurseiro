import { serverSupabaseClient } from '#supabase/server'

// DELETE /api/goals/checklist/[id] - Remove um item do checklist
export default defineEventHandler(async (event) => {
  try {
    // 1. Authentication
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    // 2. Get item ID from params
    const itemId = getRouterParam(event, 'id')

    if (!itemId) {
      throw createError({ statusCode: 400, message: 'ID do item é obrigatório' })
    }

    // 3. Verify ownership through goal


    const { data: item, error: fetchError } = await supabase
      .from('goal_checklist_items')
      .select(`
        id,
        goal_id,
        goal:goals!inner(user_id)
      `)
      .eq('id', itemId)
      .single()

    if (fetchError || !item) {
      throw createError({
        statusCode: 404,
        message: 'Item do checklist não encontrado'
      })
    }

    // Verify ownership
    if (item.goal.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        message: 'Acesso negado'
      })
    }

    const goalId = item.goal_id

    // 4. Delete item
    const { error: deleteError } = await supabase
      .from('goal_checklist_items')
      .delete()
      .eq('id', itemId)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao deletar item: ${deleteError.message}`
      })
    }

    // 5. Fetch updated goal (trigger will update status)
    const { data: updatedGoal, error: goalError } = await supabase
      .from('goals')
      .select(`
        *,
        subject:subjects(id, name, color, icon),
        checklist_items:goal_checklist_items(
          id,
          description,
          is_completed,
          order_index,
          completed_at,
          created_at
        )
      `)
      .eq('id', goalId)
      .single()

    if (goalError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar meta atualizada: ${goalError.message}`
      })
    }

    return {
      success: true,
      message: 'Item removido com sucesso!',
      data: updatedGoal
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

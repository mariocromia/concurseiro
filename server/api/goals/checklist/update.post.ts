// POST /api/goals/checklist/update - Atualiza a descrição de um item do checklist
export default defineEventHandler(async (event) => {
  try {
    // 1. Authentication
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    // 2. Validation
    const body = await readBody(event)

    if (!body.item_id) {
      throw createError({ statusCode: 400, message: 'ID do item é obrigatório' })
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      throw createError({ statusCode: 400, message: 'Descrição não pode ser vazia' })
    }

    // 3. Verify ownership


    const { data: item, error: fetchError } = await supabase
      .from('goal_checklist_items')
      .select(`
        id,
        goal_id,
        goal:goals!inner(user_id)
      `)
      .eq('id', body.item_id)
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

    // 4. Update item
    const { error: updateError } = await supabase
      .from('goal_checklist_items')
      .update({ description: body.description.trim() })
      .eq('id', body.item_id)

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao atualizar item: ${updateError.message}`
      })
    }

    // 5. Fetch updated goal
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
      .eq('id', item.goal_id)
      .single()

    if (goalError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar meta atualizada: ${goalError.message}`
      })
    }

    return {
      success: true,
      message: 'Item atualizado com sucesso!',
      data: updatedGoal
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

import { serverSupabaseClient } from '#supabase/server'

// POST /api/goals/checklist/add - Adiciona um novo item ao checklist
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

    if (!body.goal_id) {
      throw createError({ statusCode: 400, message: 'ID da meta é obrigatório' })
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      throw createError({ statusCode: 400, message: 'Descrição do item é obrigatória' })
    }

    // 3. Verify goal ownership


    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('id, user_id')
      .eq('id', body.goal_id)
      .eq('user_id', user.id)
      .single()

    if (goalError || !goal) {
      throw createError({
        statusCode: 404,
        message: 'Meta não encontrada'
      })
    }

    // 4. Get current max order_index
    const { data: items, error: itemsError } = await supabase
      .from('goal_checklist_items')
      .select('order_index')
      .eq('goal_id', body.goal_id)
      .order('order_index', { ascending: false })
      .limit(1)

    if (itemsError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar itens: ${itemsError.message}`
      })
    }

    const maxOrderIndex = items && items.length > 0 ? items[0].order_index : -1
    const newOrderIndex = maxOrderIndex + 1

    // 5. Create new checklist item
    const { data: newItem, error: createError } = await supabase
      .from('goal_checklist_items')
      .insert({
        goal_id: body.goal_id,
        description: body.description.trim(),
        is_completed: false,
        order_index: newOrderIndex
      })
      .select()
      .single()

    if (createError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao criar item: ${createError.message}`
      })
    }

    // 6. Fetch updated goal with all items
    const { data: updatedGoal, error: fetchError } = await supabase
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
      .eq('id', body.goal_id)
      .single()

    if (fetchError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar meta atualizada: ${fetchError.message}`
      })
    }

    return {
      success: true,
      message: 'Item adicionado com sucesso!',
      data: updatedGoal,
      new_item: newItem
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

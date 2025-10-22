// POST /api/goals - Cria uma nova meta
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

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw createError({ statusCode: 400, message: 'Nome da meta é obrigatório' })
    }

    if (!body.subject_id) {
      throw createError({ statusCode: 400, message: 'Matéria é obrigatória' })
    }

    if (!body.target_date) {
      throw createError({ statusCode: 400, message: 'Data de conclusão é obrigatória' })
    }

    // Validate target_date is not in the past
    const targetDate = new Date(body.target_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    targetDate.setHours(0, 0, 0, 0)

    if (targetDate < today) {
      throw createError({ statusCode: 400, message: 'A data de conclusão não pode ser anterior a hoje' })
    }

    if (!body.checklist_items || !Array.isArray(body.checklist_items) || body.checklist_items.length === 0) {
      throw createError({ statusCode: 400, message: 'Pelo menos um item do checklist é obrigatório' })
    }

    // Validate checklist items
    for (const item of body.checklist_items) {
      if (!item.description || typeof item.description !== 'string' || item.description.trim().length === 0) {
        throw createError({ statusCode: 400, message: 'Todos os itens do checklist devem ter uma descrição' })
      }
    }

    // 3. Create goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        subject_id: body.subject_id,
        name: body.name.trim(),
        target_date: body.target_date,
        status: 'in_progress'
      })
      .select()
      .single()

    if (goalError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao criar meta: ${goalError.message}`
      })
    }

    // 4. Create checklist items
    const checklistItemsToInsert = body.checklist_items.map((item: any, index: number) => ({
      goal_id: goal.id,
      description: item.description.trim(),
      is_completed: false,
      order_index: index
    }))

    const { error: itemsError } = await supabase
      .from('goal_checklist_items')
      .insert(checklistItemsToInsert)

    if (itemsError) {
      // Rollback: delete the goal if items creation fails
      await supabase.from('goals').delete().eq('id', goal.id)

      throw createError({
        statusCode: 500,
        message: `Erro ao criar itens do checklist: ${itemsError.message}`
      })
    }

    // 5. Fetch complete goal with items
    const { data: completeGoal, error: fetchError } = await supabase
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
      .eq('id', goal.id)
      .single()

    if (fetchError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar meta criada: ${fetchError.message}`
      })
    }

    return {
      success: true,
      message: 'Meta criada com sucesso!',
      data: completeGoal
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

// PUT /api/goals/[id] - Atualiza uma meta existente
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

    // 3. Validation
    const body = await readBody(event)

    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      throw createError({ statusCode: 400, message: 'Nome da meta não pode ser vazio' })
    }

    if (body.target_date !== undefined) {
      const targetDate = new Date(body.target_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      targetDate.setHours(0, 0, 0, 0)

      if (targetDate < today) {
        throw createError({ statusCode: 400, message: 'A data de conclusão não pode ser anterior a hoje' })
      }
    }

    // 4. Update goal


    // First, verify the goal belongs to the user
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('id')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGoal) {
      throw createError({
        statusCode: 404,
        message: 'Meta não encontrada'
      })
    }

    // Prepare update data
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.subject_id !== undefined) updateData.subject_id = body.subject_id
    if (body.target_date !== undefined) updateData.target_date = body.target_date

    // Update goal
    const { error: updateError } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao atualizar meta: ${updateError.message}`
      })
    }

    // 5. Fetch updated goal with all details
    const { data: updatedGoal, error: getError } = await supabase
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

    if (getError) {
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar meta atualizada: ${getError.message}`
      })
    }

    return {
      success: true,
      message: 'Meta atualizada com sucesso!',
      data: updatedGoal
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

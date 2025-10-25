import { serverSupabaseClient } from '#supabase/server'

// POST /api/goals/checklist/toggle - Marca/desmarca um item do checklist
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

    console.log('🔷 [Toggle Checklist] User ID:', user.id)
    console.log('🔷 [Toggle Checklist] Item ID:', body.item_id)

    if (!body.item_id) {
      throw createError({ statusCode: 400, message: 'ID do item é obrigatório' })
    }

    // 3. Get current item state
    const { data: item, error: fetchError } = await supabase
      .from('goal_checklist_items')
      .select(`
        id,
        is_completed,
        goal_id
      `)
      .eq('id', body.item_id)
      .single()

    console.log('🔷 [Toggle Checklist] Item fetch result:', { item, fetchError })

    if (fetchError || !item) {
      console.error('❌ [Toggle Checklist] Failed to fetch item:', fetchError)
      throw createError({
        statusCode: 404,
        message: 'Item do checklist não encontrado'
      })
    }

    // Verify ownership by checking the goal
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('id, user_id')
      .eq('id', item.goal_id)
      .eq('user_id', user.id)
      .single()

    console.log('🔷 [Toggle Checklist] Goal ownership check:', { goal, goalError })

    if (goalError || !goal) {
      console.error('❌ [Toggle Checklist] Access denied:', goalError)
      throw createError({
        statusCode: 403,
        message: 'Acesso negado'
      })
    }

    // 4. Toggle item completion
    const newCompletionState = !item.is_completed
    const updateData: any = {
      is_completed: newCompletionState
    }

    // Set completed_at timestamp if marking as complete, null otherwise
    if (newCompletionState) {
      updateData.completed_at = new Date().toISOString()
    } else {
      updateData.completed_at = null
    }

    console.log('🔷 [Toggle Checklist] Update data:', updateData)

    const { error: updateError } = await supabase
      .from('goal_checklist_items')
      .update(updateData)
      .eq('id', body.item_id)

    console.log('🔷 [Toggle Checklist] Update result:', { updateError })

    if (updateError) {
      console.error('❌ [Toggle Checklist] Update failed:', updateError)
      throw createError({
        statusCode: 500,
        message: `Erro ao atualizar item: ${updateError.message}`
      })
    }

    console.log('✅ [Toggle Checklist] Item updated successfully')

    // 5. Fetch updated goal with all items (trigger will update goal status)
    const { data: updatedGoal, error: goalFetchError } = await supabase
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

    console.log('🔷 [Toggle Checklist] Fetched updated goal:', { updatedGoal, goalFetchError })

    if (goalFetchError) {
      console.error('❌ [Toggle Checklist] Failed to fetch updated goal:', goalFetchError)
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar meta atualizada: ${goalFetchError.message}`
      })
    }

    console.log('✅ [Toggle Checklist] Success! Returning updated goal')

    return {
      success: true,
      message: newCompletionState ? 'Item marcado como concluído!' : 'Item desmarcado',
      data: updatedGoal
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

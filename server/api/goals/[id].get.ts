import { serverSupabaseClient } from '#supabase/server'

// GET /api/goals/[id] - Busca uma meta específica com todos os detalhes
export default defineEventHandler(async (event) => {
  try {
    // 1. Authentication
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔷 [Goal by ID API] Authentication check:', { userId: user?.id, authError })

    if (authError || !user) {
      console.error('❌ [Goal by ID API] Unauthorized')
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 2. Get goal ID from params
    const goalId = getRouterParam(event, 'id')

    console.log('🔷 [Goal by ID API] Fetching goal:', goalId, 'for user:', user.id)

    if (!goalId) {
      console.error('❌ [Goal by ID API] Missing goal ID')
      throw createError({ statusCode: 400, message: 'ID da meta é obrigatório' })
    }

    // 3. Fetch goal from database
    const { data, error } = await supabase
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
      .eq('user_id', user.id)
      .single()

    console.log('🔷 [Goal by ID API] Query result:', {
      hasData: !!data,
      error,
      goalName: data?.name
    })

    if (error) {
      console.error('❌ [Goal by ID API] Database error:', error)
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          message: 'Meta não encontrada'
        })
      }
      throw createError({
        statusCode: 500,
        message: `Database error: ${error.message}`
      })
    }

    // 4. Calculate progress
    const totalItems = data.checklist_items?.length || 0
    const completedItems = data.checklist_items?.filter((item: any) => item.is_completed).length || 0
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    // Calculate days remaining
    const targetDate = new Date(data.target_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    targetDate.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Sort checklist items by order_index
    if (data.checklist_items) {
      data.checklist_items.sort((a: any, b: any) => a.order_index - b.order_index)
    }

    const responseData = {
      ...data,
      total_items: totalItems,
      completed_items: completedItems,
      progress_percentage: progressPercentage,
      days_remaining: daysRemaining
    }

    console.log('✅ [Goal by ID API] Returning goal:', {
      id: responseData.id,
      name: responseData.name,
      totalItems,
      completedItems,
      progressPercentage
    })

    return {
      success: true,
      data: responseData
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

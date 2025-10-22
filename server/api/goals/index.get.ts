// GET /api/goals - Lista todas as metas do usuário
export default defineEventHandler(async (event) => {
  try {
    // 1. Authentication
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 2. Get query params for filtering
    const query = getQuery(event)
    const status = query.status as string | undefined

    // 3. Fetch goals from database

    let queryBuilder = supabase
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply status filter if provided
    if (status && ['in_progress', 'completed', 'overdue'].includes(status)) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        message: `Database error: ${error.message}`
      })
    }

    // 4. Process data to calculate progress
    const goalsWithProgress = data.map((goal: any) => {
      const totalItems = goal.checklist_items?.length || 0
      const completedItems = goal.checklist_items?.filter((item: any) => item.is_completed).length || 0
      const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      // Calculate days remaining
      const targetDate = new Date(goal.target_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      targetDate.setHours(0, 0, 0, 0)
      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...goal,
        total_items: totalItems,
        completed_items: completedItems,
        progress_percentage: progressPercentage,
        days_remaining: daysRemaining
      }
    })

    return {
      success: true,
      data: goalsWithProgress
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})

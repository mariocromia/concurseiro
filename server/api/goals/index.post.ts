import { serverSupabaseClient } from '#supabase/server'

// POST /api/goals - Cria uma nova meta
export default defineEventHandler(async (event) => {
  try {
    console.log('🔷 [POST /api/goals] Iniciando criação de meta...')

    // 1. Authentication
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔷 [POST /api/goals] User ID:', user?.id)
    console.log('🔷 [POST /api/goals] Auth Error:', authError)

    if (authError || !user) {
      console.error('❌ [POST /api/goals] Erro de autenticação:', authError)
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    // 2. Validation
    const body = await readBody(event)
    console.log('🔷 [POST /api/goals] Request Body:', JSON.stringify(body, null, 2))

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      console.error('❌ [POST /api/goals] Nome da meta não fornecido')
      throw createError({ statusCode: 400, message: 'Nome da meta é obrigatório' })
    }

    if (!body.subject_id) {
      throw createError({ statusCode: 400, message: 'Matéria é obrigatória' })
    }

    // Validate subject exists and belongs to user
    console.log('🔷 [POST /api/goals] Validando matéria:', body.subject_id)
    const { data: subject, error: subjectError } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('id', body.subject_id)
      .eq('user_id', user.id)
      .single()

    console.log('🔷 [POST /api/goals] Subject encontrada:', subject)
    console.log('🔷 [POST /api/goals] Subject Error:', subjectError)

    if (subjectError || !subject) {
      console.error('❌ [POST /api/goals] Matéria inválida ou não pertence ao usuário')
      throw createError({
        statusCode: 400,
        message: 'Matéria inválida ou não encontrada. Por favor, selecione uma matéria válida.'
      })
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
    console.log('🔷 [POST /api/goals] Inserindo meta na tabela goals...')
    const goalData = {
      user_id: user.id,
      subject_id: body.subject_id,
      name: body.name.trim(),
      target_date: body.target_date,
      status: 'in_progress'
    }
    console.log('🔷 [POST /api/goals] Goal Data:', JSON.stringify(goalData, null, 2))

    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single()

    console.log('🔷 [POST /api/goals] Goal criada:', goal)
    console.log('🔷 [POST /api/goals] Goal Error:', goalError)

    if (goalError) {
      console.error('❌ [POST /api/goals] Erro ao criar meta:', goalError)
      throw createError({
        statusCode: 500,
        message: `Erro ao criar meta: ${goalError.message}`
      })
    }

    // 4. Create checklist items
    console.log('🔷 [POST /api/goals] Inserindo itens do checklist...')
    const checklistItemsToInsert = body.checklist_items.map((item: any, index: number) => ({
      goal_id: goal.id,
      description: item.description.trim(),
      is_completed: false,
      order_index: index
    }))
    console.log('🔷 [POST /api/goals] Checklist Items:', JSON.stringify(checklistItemsToInsert, null, 2))

    const { data: insertedItems, error: itemsError } = await supabase
      .from('goal_checklist_items')
      .insert(checklistItemsToInsert)
      .select()

    console.log('🔷 [POST /api/goals] Items inseridos:', insertedItems)
    console.log('🔷 [POST /api/goals] Items Error:', itemsError)

    if (itemsError) {
      console.error('❌ [POST /api/goals] Erro ao criar itens do checklist:', itemsError)
      // Rollback: delete the goal if items creation fails
      await supabase.from('goals').delete().eq('id', goal.id)

      throw createError({
        statusCode: 500,
        message: `Erro ao criar itens do checklist: ${itemsError.message}`
      })
    }

    // 5. Fetch complete goal with items
    console.log('🔷 [POST /api/goals] Buscando meta completa com itens...')
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

    console.log('🔷 [POST /api/goals] Complete Goal:', JSON.stringify(completeGoal, null, 2))
    console.log('🔷 [POST /api/goals] Fetch Error:', fetchError)

    if (fetchError) {
      console.error('❌ [POST /api/goals] Erro ao buscar meta criada:', fetchError)
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar meta criada: ${fetchError.message}`
      })
    }

    console.log('✅ [POST /api/goals] Meta criada com sucesso!')
    return {
      success: true,
      message: 'Meta criada com sucesso!',
      data: completeGoal
    }
  } catch (error: any) {
    console.error('❌ [POST /api/goals] ERRO FATAL:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      fullError: error
    })

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error',
      data: {
        originalError: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    })
  }
})

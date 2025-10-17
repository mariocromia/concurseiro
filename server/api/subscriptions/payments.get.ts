import { serverSupabaseClient } from '#supabase/server'

// GET /api/subscriptions/payments - Listar histórico de pagamentos
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  const query = getQuery(event)
  const limit = Number(query.limit) || 10
  const offset = Number(query.offset) || 0

  try {
    const { data: payments, error, count } = await supabase
      .from('payments')
      .select('*, subscription:subscriptions(*, plan:subscription_plans(*))', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return {
      success: true,
      data: payments,
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    }
  } catch (error: any) {
    console.error('Erro ao buscar pagamentos:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar histórico de pagamentos'
    })
  }
})

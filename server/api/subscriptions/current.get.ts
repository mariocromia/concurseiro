import { serverSupabaseClient } from '#supabase/server'

// GET /api/subscriptions/current - Obter assinatura atual do usuário
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  try {
    // Buscar assinatura ativa
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('user_id', user.id)
      .in('status', ['active', 'trial', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Buscar próximo pagamento
    let nextPayment = null
    if (subscription) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('subscription_id', subscription.id)
        .in('status', ['pending', 'confirmed'])
        .order('due_date', { ascending: true })
        .limit(1)
        .single()

      nextPayment = payment
    }

    return {
      success: true,
      data: {
        subscription: subscription || null,
        nextPayment
      }
    }
  } catch (error: any) {
    console.error('Erro ao buscar assinatura:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar assinatura'
    })
  }
})

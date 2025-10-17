import { serverSupabaseClient } from '#supabase/server'

// POST /api/subscriptions/cancel - Cancelar assinatura
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const asaas = useAsaas()
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  const body = await readBody(event)
  const { subscriptionId, cancelAtPeriodEnd = true, reason } = body

  try {
    // Buscar assinatura
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      throw createError({
        statusCode: 404,
        message: 'Assinatura não encontrada'
      })
    }

    // Cancelar no Asaas
    if (subscription.asaas_subscription_id) {
      await asaas.deleteSubscription(subscription.asaas_subscription_id)
    }

    // Atualizar status
    const updateData: any = {
      cancel_at_period_end: cancelAtPeriodEnd,
      canceled_at: new Date().toISOString()
    }

    if (!cancelAtPeriodEnd) {
      updateData.status = 'canceled'
      updateData.current_period_end = new Date().toISOString()
    }

    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Registrar mudança
    await supabase
      .from('subscription_changes')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        from_plan_id: subscription.plan_id,
        to_plan_id: subscription.plan_id,
        change_type: 'cancel',
        effective_date: cancelAtPeriodEnd
          ? subscription.current_period_end
          : new Date().toISOString(),
        reason
      })

    return {
      success: true,
      data: updatedSubscription,
      message: cancelAtPeriodEnd
        ? 'Assinatura será cancelada ao final do período'
        : 'Assinatura cancelada imediatamente'
    }
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao cancelar assinatura'
    })
  }
})

import { serverSupabaseClient } from '#supabase/server'

// POST /api/subscriptions/change-plan - Fazer upgrade/downgrade de plano
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
  const { newPlanId } = body

  if (!newPlanId) {
    throw createError({
      statusCode: 400,
      message: 'ID do novo plano é obrigatório'
    })
  }

  try {
    // Buscar assinatura atual
    const { data: currentSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (subError || !currentSubscription) {
      throw createError({
        statusCode: 404,
        message: 'Assinatura ativa não encontrada'
      })
    }

    // Buscar novo plano
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', newPlanId)
      .single()

    if (planError || !newPlan) {
      throw createError({
        statusCode: 404,
        message: 'Novo plano não encontrado'
      })
    }

    // Determinar tipo de mudança
    const changeType = newPlan.price > currentSubscription.plan.price
      ? 'upgrade'
      : 'downgrade'

    // Buscar cliente Asaas
    const { data: asaasCustomer } = await supabase
      .from('asaas_customers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!asaasCustomer) {
      throw createError({
        statusCode: 404,
        message: 'Cliente Asaas não encontrado'
      })
    }

    // Cancelar assinatura antiga no Asaas
    if (currentSubscription.asaas_subscription_id) {
      await asaas.deleteSubscription(currentSubscription.asaas_subscription_id)
    }

    // Calcular próxima data de cobrança
    const now = new Date()
    const nextDueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Criar nova assinatura no Asaas
    const asaasSubscriptionData = await asaas.createSubscription({
      customer: asaasCustomer.asaas_customer_id,
      billingType: 'CREDIT_CARD',
      value: newPlan.price,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura ${newPlan.display_name}`,
      externalReference: user.id
    })

    // Atualizar assinatura antiga
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: now.toISOString()
      })
      .eq('id', currentSubscription.id)

    // Criar nova assinatura
    const { data: newSubscription, error: newSubError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: newPlanId,
        asaas_subscription_id: asaasSubscriptionData.id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: nextDueDate.toISOString()
      })
      .select('*, plan:subscription_plans(*)')
      .single()

    if (newSubError) {
      throw newSubError
    }

    // Registrar mudança
    await supabase
      .from('subscription_changes')
      .insert({
        user_id: user.id,
        subscription_id: newSubscription.id,
        from_plan_id: currentSubscription.plan_id,
        to_plan_id: newPlanId,
        change_type: changeType,
        effective_date: now.toISOString()
      })

    return {
      success: true,
      data: newSubscription,
      message: `Plano alterado com sucesso para ${newPlan.display_name}`
    }
  } catch (error: any) {
    console.error('Erro ao alterar plano:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao alterar plano'
    })
  }
})

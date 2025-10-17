import { serverSupabaseClient } from '#supabase/server'
import { createSubscriptionSchema, validateBody } from '../../utils/validation-schemas'

// POST /api/subscriptions/create - Criar nova assinatura
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const asaas = useAsaas()

  const body = await readBody(event)
  const {
    planId,
    customerData,
    paymentMethod,
    creditCardData,
    couponCode,
    affiliateId
  } = validateBody(createSubscriptionSchema, body)

  // Buscar usuário autenticado
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  try {
    // 1. Buscar plano
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      throw createError({
        statusCode: 404,
        message: 'Plano não encontrado'
      })
    }

    // 2. Verificar se já tem cliente Asaas
    let { data: asaasCustomer } = await supabase
      .from('asaas_customers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // 3. Criar ou atualizar cliente no Asaas
    if (!asaasCustomer) {
      const asaasCustomerData = await asaas.createCustomer({
        name: customerData.name,
        email: customerData.email,
        cpfCnpj: customerData.cpfCnpj,
        phone: customerData.phone,
        mobilePhone: customerData.mobilePhone,
        address: customerData.address,
        addressNumber: customerData.addressNumber,
        province: customerData.province,
        postalCode: customerData.postalCode,
        externalReference: user.id
      })

      // Salvar cliente no banco
      const { data: newCustomer, error: customerError } = await supabase
        .from('asaas_customers')
        .insert({
          user_id: user.id,
          asaas_customer_id: asaasCustomerData.id,
          name: customerData.name,
          email: customerData.email,
          cpf_cnpj: customerData.cpfCnpj,
          phone: customerData.phone,
          address: {
            street: customerData.address,
            number: customerData.addressNumber,
            province: customerData.province,
            postalCode: customerData.postalCode
          }
        })
        .select()
        .single()

      if (customerError) {
        throw new Error('Erro ao salvar cliente: ' + customerError.message)
      }

      asaasCustomer = newCustomer
    }

    // 4. Calcular valor com desconto do cupom
    let finalPrice = plan.price
    if (couponCode && affiliateId) {
      finalPrice = plan.price * 0.80 // 20% de desconto
    }

    // 5. Calcular datas
    const now = new Date()
    const trialEnd = plan.trial_days > 0
      ? new Date(now.getTime() + plan.trial_days * 24 * 60 * 60 * 1000)
      : null

    const nextDueDate = trialEnd
      ? new Date(trialEnd.getTime() + 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // 6. Criar assinatura no Asaas
    const asaasSubscriptionData = await asaas.createSubscription({
      customer: asaasCustomer.asaas_customer_id,
      billingType: paymentMethod || 'CREDIT_CARD',
      value: finalPrice,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      cycle: 'MONTHLY',
      description: `Assinatura ${plan.display_name}${couponCode ? ` (Cupom: ${couponCode})` : ''}`,
      externalReference: user.id,
      discount: couponCode ? {
        value: plan.price * 0.20,
        type: 'PERCENTAGE',
        dueDateLimitDays: 0
      } : undefined
    })

    // 7. Salvar assinatura no banco
    const subscriptionStatus = plan.trial_days > 0 ? 'trial' : 'pending'

    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        asaas_subscription_id: asaasSubscriptionData.id,
        status: subscriptionStatus,
        trial_start: trialEnd ? now.toISOString() : null,
        trial_end: trialEnd ? trialEnd.toISOString() : null,
        current_period_start: now.toISOString(),
        current_period_end: nextDueDate.toISOString()
      })
      .select()
      .single()

    if (subscriptionError) {
      throw new Error('Erro ao salvar assinatura: ' + subscriptionError.message)
    }

    // 8. Se houver cupom, criar registro de referral
    if (couponCode && affiliateId) {
      await supabase
        .from('affiliate_referrals')
        .insert({
          affiliate_id: affiliateId,
          user_id: user.id,
          subscription_id: subscription.id,
          coupon_code: couponCode,
          status: plan.trial_days > 0 ? 'trial' : 'active'
        })

      // Incrementar contador de uso do cupom
      await supabase
        .from('affiliate_coupons')
        .update({ usage_count: supabase.raw('usage_count + 1') })
        .eq('affiliate_id', affiliateId)
        .eq('code', couponCode)
    }

    // 9. Se houver dados de cartão, criar primeiro pagamento
    let payment = null
    if (creditCardData && !trialEnd) {
      const paymentData = await asaas.createPayment({
        customer: asaasCustomer.asaas_customer_id,
        billingType: 'CREDIT_CARD',
        value: finalPrice,
        dueDate: nextDueDate.toISOString().split('T')[0],
        description: `Pagamento ${plan.display_name}${couponCode ? ` (Cupom: ${couponCode})` : ''}`,
        externalReference: subscription.id,
        creditCard: {
          holderName: creditCardData.holderName,
          number: creditCardData.number,
          expiryMonth: creditCardData.expiryMonth,
          expiryYear: creditCardData.expiryYear,
          ccv: creditCardData.ccv
        },
        creditCardHolderInfo: {
          name: customerData.name,
          email: customerData.email,
          cpfCnpj: customerData.cpfCnpj,
          postalCode: customerData.postalCode,
          addressNumber: customerData.addressNumber,
          phone: customerData.phone
        }
      })

      // Salvar pagamento
      const { data: newPayment } = await supabase
        .from('payments')
        .insert({
          subscription_id: subscription.id,
          user_id: user.id,
          asaas_payment_id: paymentData.id,
          amount: finalPrice,
          status: paymentData.status?.toLowerCase() || 'pending',
          payment_method: 'credit_card',
          due_date: nextDueDate.toISOString().split('T')[0],
          invoice_url: paymentData.invoiceUrl,
          bank_slip_url: paymentData.bankSlipUrl
        })
        .select()
        .single()

      payment = newPayment

      // Se houver cupom e pagamento confirmado, criar comissão
      if (couponCode && affiliateId && paymentData.status === 'CONFIRMED') {
        const commissionAmount = finalPrice * 0.20
        await supabase
          .from('affiliate_commissions')
          .insert({
            affiliate_id: affiliateId,
            referral_id: (await supabase.from('affiliate_referrals').select('id').eq('user_id', user.id).eq('affiliate_id', affiliateId).single()).data?.id,
            payment_id: newPayment.id,
            amount: commissionAmount,
            payment_amount: finalPrice,
            commission_rate: 20.00,
            status: 'available',
            available_at: new Date().toISOString()
          })
      }
    }

    return {
      success: true,
      data: {
        subscription,
        payment,
        trial: !!trialEnd,
        trialEnd: trialEnd?.toISOString()
      }
    }
  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao criar assinatura'
    })
  }
})

import { serverSupabaseClient } from '#supabase/server'

// POST /api/webhooks/asaas - Receber webhooks do Asaas
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)

  console.log('Webhook Asaas recebido:', JSON.stringify(body, null, 2))

  try {
    // Salvar webhook no banco
    const { data: webhook, error: webhookError } = await supabase
      .from('asaas_webhooks')
      .insert({
        event_type: body.event,
        asaas_event_id: body.id,
        payload: body,
        processed: false
      })
      .select()
      .single()

    if (webhookError) {
      console.error('Erro ao salvar webhook:', webhookError)
      throw webhookError
    }

    // Processar webhook baseado no tipo de evento
    try {
      switch (body.event) {
        case 'PAYMENT_CREATED':
        case 'PAYMENT_UPDATED':
        case 'PAYMENT_CONFIRMED':
        case 'PAYMENT_RECEIVED':
          await handlePaymentWebhook(supabase, body.payment)
          break

        case 'PAYMENT_OVERDUE':
          await handlePaymentOverdue(supabase, body.payment)
          break

        case 'PAYMENT_DELETED':
        case 'PAYMENT_RESTORED':
        case 'PAYMENT_REFUNDED':
          await handlePaymentWebhook(supabase, body.payment)
          break

        case 'PAYMENT_AWAITING_RISK_ANALYSIS':
        case 'PAYMENT_APPROVED_BY_RISK_ANALYSIS':
        case 'PAYMENT_REPROVED_BY_RISK_ANALYSIS':
          await handlePaymentWebhook(supabase, body.payment)
          break

        default:
          console.log('Tipo de evento não tratado:', body.event)
      }

      // Marcar como processado
      await supabase
        .from('asaas_webhooks')
        .update({
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('id', webhook.id)

      return {
        success: true,
        message: 'Webhook processado com sucesso'
      }
    } catch (processingError: any) {
      console.error('Erro ao processar webhook:', processingError)

      // Salvar erro no webhook
      await supabase
        .from('asaas_webhooks')
        .update({
          processed: false,
          error_message: processingError.message
        })
        .eq('id', webhook.id)

      throw processingError
    }
  } catch (error: any) {
    console.error('Erro no webhook:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao processar webhook'
    })
  }
})

// Funções auxiliares para processar webhooks
async function handlePaymentWebhook(supabase: any, paymentData: any) {
  console.log('Processando pagamento:', paymentData.id)

  // Buscar pagamento pelo ID do Asaas
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('asaas_payment_id', paymentData.id)
    .single()

  // Mapear status do Asaas para nosso sistema
  const statusMap: Record<string, string> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    RECEIVED: 'received',
    OVERDUE: 'overdue',
    REFUNDED: 'refunded',
    RECEIVED_IN_CASH: 'received',
    REFUND_REQUESTED: 'refunded',
    CHARGEBACK_REQUESTED: 'refunded',
    CHARGEBACK_DISPUTE: 'refunded',
    AWAITING_CHARGEBACK_REVERSAL: 'refunded'
  }

  const newStatus = statusMap[paymentData.status] || 'pending'

  if (payment) {
    // Atualizar pagamento existente
    await supabase
      .from('payments')
      .update({
        status: newStatus,
        payment_date: paymentData.paymentDate || null,
        invoice_url: paymentData.invoiceUrl || null,
        bank_slip_url: paymentData.bankSlipUrl || null,
        metadata: paymentData
      })
      .eq('id', payment.id)

    // Se pagamento foi confirmado/recebido, atualizar assinatura
    if (newStatus === 'confirmed' || newStatus === 'received') {
      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', payment.subscription_id)

      // Verificar se há referral para este pagamento e criar comissão
      const { data: referral } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('subscription_id', payment.subscription_id)
        .single()

      if (referral) {
        // Atualizar status do referral
        await supabase
          .from('affiliate_referrals')
          .update({
            status: 'active',
            first_payment_at: referral.first_payment_at || new Date().toISOString(),
            last_payment_at: new Date().toISOString(),
            total_paid: supabase.raw(`total_paid + ${payment.amount}`)
          })
          .eq('id', referral.id)

        // Verificar se já existe comissão para este pagamento
        const { data: existingCommission } = await supabase
          .from('affiliate_commissions')
          .select('*')
          .eq('payment_id', payment.id)
          .single()

        if (!existingCommission) {
          // Criar comissão (20% sobre valor pago)
          const commissionAmount = payment.amount * 0.20
          await supabase
            .from('affiliate_commissions')
            .insert({
              affiliate_id: referral.affiliate_id,
              referral_id: referral.id,
              payment_id: payment.id,
              amount: commissionAmount,
              payment_amount: payment.amount,
              commission_rate: 20.00,
              status: 'available',
              available_at: new Date().toISOString()
            })

          console.log(`Comissão criada: R$ ${commissionAmount} para afiliado ${referral.affiliate_id}`)
        }
      }
    }
  } else {
    console.log('Pagamento não encontrado no banco:', paymentData.id)
  }
}

async function handlePaymentOverdue(supabase: any, paymentData: any) {
  console.log('Pagamento vencido:', paymentData.id)

  // Buscar pagamento
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('asaas_payment_id', paymentData.id)
    .single()

  if (payment) {
    // Atualizar status do pagamento
    await supabase
      .from('payments')
      .update({ status: 'overdue' })
      .eq('id', payment.id)

    // Atualizar status da assinatura
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('id', payment.subscription_id)
  }
}

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// POST /api/affiliates/withdraw - Solicitar saque
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  const { amount, cpf, pix_key } = body

  if (!amount || !cpf) {
    throw createError({
      statusCode: 400,
      message: 'Valor e CPF são obrigatórios'
    })
  }

  // Validar valor mínimo
  if (amount < 50) {
    throw createError({
      statusCode: 400,
      message: 'Valor mínimo para saque é R$ 50,00'
    })
  }

  try {
    // Buscar dados do afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (affiliateError || !affiliate) {
      throw createError({
        statusCode: 404,
        message: 'Você não é um afiliado'
      })
    }

    // Verificar saldo disponível
    if (affiliate.available_balance < amount) {
      throw createError({
        statusCode: 400,
        message: 'Saldo insuficiente para saque'
      })
    }

    // Verificar se CPF confere
    if (affiliate.cpf !== cpf) {
      throw createError({
        statusCode: 400,
        message: 'CPF não corresponde ao cadastrado'
      })
    }

    // Criar solicitação de saque
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('affiliate_withdrawals')
      .insert({
        affiliate_id: affiliate.id,
        amount,
        cpf,
        pix_key: pix_key || cpf,
        status: 'pending'
      })
      .select()
      .single()

    if (withdrawalError) {
      throw withdrawalError
    }

    // Atualizar status das comissões para withdrawn
    await supabase
      .from('affiliate_commissions')
      .update({ status: 'withdrawn' })
      .eq('affiliate_id', affiliate.id)
      .eq('status', 'available')

    // TODO: Enviar email notificando admin sobre novo saque

    return {
      success: true,
      withdrawal,
      message: 'Solicitação de saque enviada com sucesso!'
    }
  } catch (error: any) {
    console.error('Erro ao solicitar saque:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao solicitar saque'
    })
  }
})

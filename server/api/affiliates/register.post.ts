import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// POST /api/affiliates/register - Cadastrar como afiliado
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

  const { coupon_code, cpf } = body

  if (!coupon_code || !cpf) {
    throw createError({
      statusCode: 400,
      message: 'Cupom e CPF são obrigatórios'
    })
  }

  try {
    // Verificar se usuário já é afiliado
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingAffiliate) {
      throw createError({
        statusCode: 400,
        message: 'Você já é um afiliado'
      })
    }

    // Verificar se cupom já existe
    const { data: existingCoupon } = await supabase
      .from('affiliates')
      .select('*')
      .ilike('coupon_code', coupon_code)
      .single()

    if (existingCoupon) {
      throw createError({
        statusCode: 400,
        message: 'Este nome de cupom já está em uso'
      })
    }

    // Gerar link de rastreamento
    const tracking_link = `https://seuapp.com/register?ref=${coupon_code}`

    // Criar afiliado
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .insert({
        user_id: user.id,
        coupon_code: coupon_code.toUpperCase(),
        tracking_link,
        cpf,
        status: 'active'
      })
      .select()
      .single()

    if (affiliateError) {
      throw affiliateError
    }

    // Criar cupom na tabela de cupons
    await supabase
      .from('affiliate_coupons')
      .insert({
        affiliate_id: affiliate.id,
        code: coupon_code.toUpperCase(),
        discount_percentage: 20.00,
        active: true
      })

    // TODO: Enviar email de boas-vindas com cupom e link

    return {
      success: true,
      affiliate,
      message: 'Cadastro de afiliado realizado com sucesso!'
    }
  } catch (error: any) {
    console.error('Erro ao cadastrar afiliado:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao cadastrar afiliado'
    })
  }
})

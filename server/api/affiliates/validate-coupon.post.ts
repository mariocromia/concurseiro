import { serverSupabaseClient } from '#supabase/server'

// POST /api/affiliates/validate-coupon - Validar cupom de desconto
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)

  const { coupon_code } = body

  if (!coupon_code) {
    throw createError({
      statusCode: 400,
      message: 'Cupom é obrigatório'
    })
  }

  try {
    // Buscar cupom
    const { data: coupon, error: couponError } = await supabase
      .from('affiliate_coupons')
      .select('*')
      .ilike('code', coupon_code)
      .eq('active', true)
      .single()

    if (couponError || !coupon) {
      return {
        valid: false,
        message: 'Cupom inválido ou não encontrado'
      }
    }

    // Buscar afiliado usando service role para evitar RLS
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('id', coupon.affiliate_id)
      .single()

    if (affiliateError || !affiliate) {
      return {
        valid: false,
        message: 'Afiliado não encontrado'
      }
    }

    // Verificar se afiliado está ativo
    if (affiliate.status !== 'active') {
      return {
        valid: false,
        message: 'Cupom não está mais ativo'
      }
    }

    return {
      valid: true,
      coupon: {
        code: coupon.code,
        discount_percentage: coupon.discount_percentage,
        affiliate_id: coupon.affiliate_id
      }
    }
  } catch (error: any) {
    console.error('Erro ao validar cupom:', error)
    return {
      valid: false,
      message: 'Erro ao validar cupom'
    }
  }
})

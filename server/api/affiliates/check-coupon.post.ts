import { serverSupabaseClient } from '#supabase/server'

// POST /api/affiliates/check-coupon - Verificar disponibilidade de cupom
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
    const { data: existingCoupon } = await supabase
      .from('affiliates')
      .select('*')
      .ilike('coupon_code', coupon_code)
      .single()

    return {
      available: !existingCoupon,
      message: existingCoupon ? 'Cupom já está em uso' : 'Cupom disponível'
    }
  } catch (error: any) {
    console.error('Erro ao verificar cupom:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao verificar cupom'
    })
  }
})

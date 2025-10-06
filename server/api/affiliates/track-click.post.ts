import { serverSupabaseClient } from '#supabase/server'

// POST /api/affiliates/track-click - Rastrear clique em link de afiliado
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)

  const { ref_code } = body

  if (!ref_code) {
    throw createError({
      statusCode: 400,
      message: 'Código de referência é obrigatório'
    })
  }

  try {
    // Buscar afiliado pelo cupom
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('*')
      .ilike('coupon_code', ref_code)
      .single()

    if (affiliateError || !affiliate) {
      throw createError({
        statusCode: 404,
        message: 'Afiliado não encontrado'
      })
    }

    // Obter informações da requisição
    const headers = event.node.req.headers
    const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || event.node.req.socket?.remoteAddress
    const userAgent = headers['user-agent']
    const referer = headers['referer'] || headers['referrer']

    // Registrar clique
    await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        ip_address: Array.isArray(ip) ? ip[0] : ip,
        user_agent: userAgent,
        referer: referer,
        converted: false
      })

    return {
      success: true,
      affiliate_id: affiliate.id
    }
  } catch (error: any) {
    console.error('Erro ao rastrear clique:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao rastrear clique'
    })
  }
})

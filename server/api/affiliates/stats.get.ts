import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/affiliates/stats - Obter estatísticas do afiliado
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
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

    // Buscar referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        subscriptions (
          status,
          current_period_end
        )
      `)
      .eq('affiliate_id', affiliate.id)

    if (referralsError) {
      throw referralsError
    }

    // Buscar comissões
    const { data: commissions, error: commissionsError } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })

    if (commissionsError) {
      throw commissionsError
    }

    // Buscar saques
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('affiliate_withdrawals')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })

    if (withdrawalsError) {
      throw withdrawalsError
    }

    // Buscar cliques
    const { count: totalClicks } = await supabase
      .from('affiliate_clicks')
      .select('*', { count: 'exact', head: true })
      .eq('affiliate_id', affiliate.id)

    // Calcular estatísticas
    const trialReferrals = referrals?.filter(r => r.status === 'trial') || []
    const activeReferrals = referrals?.filter(r => r.status === 'active') || []
    const canceledReferrals = referrals?.filter(r => ['canceled', 'expired'].includes(r.status)) || []

    const availableCommissions = commissions?.filter(c => c.status === 'available') || []
    const pendingCommissions = commissions?.filter(c => c.status === 'pending') || []

    const conversionRate = totalClicks && totalClicks > 0
      ? ((referrals?.length || 0) / totalClicks * 100).toFixed(2)
      : '0.00'

    return {
      affiliate: {
        id: affiliate.id,
        coupon_code: affiliate.coupon_code,
        tracking_link: affiliate.tracking_link,
        status: affiliate.status,
        total_earnings: affiliate.total_earnings,
        available_balance: affiliate.available_balance,
        withdrawn_balance: affiliate.withdrawn_balance
      },
      stats: {
        total_clicks: totalClicks || 0,
        total_referrals: referrals?.length || 0,
        trial_referrals: trialReferrals.length,
        active_referrals: activeReferrals.length,
        canceled_referrals: canceledReferrals.length,
        conversion_rate: conversionRate
      },
      referrals: referrals || [],
      commissions: commissions || [],
      withdrawals: withdrawals || [],
      summary: {
        pending_commissions: pendingCommissions.reduce((sum, c) => sum + parseFloat(c.amount), 0),
        available_commissions: availableCommissions.reduce((sum, c) => sum + parseFloat(c.amount), 0),
        pending_withdrawals: withdrawals?.filter(w => w.status === 'pending').length || 0
      }
    }
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar estatísticas'
    })
  }
})

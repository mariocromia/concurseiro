import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * GET /api/affiliates/stats
 *
 * Query Parameters:
 * - period: 'today' | 'week' | 'month' | 'custom' (default: 'month')
 * - start_date: ISO date string (for custom period)
 * - end_date: ISO date string (for custom period)
 * - status: 'all' | 'trial' | 'active' | 'canceled' (default: 'all')
 */
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  // Parse query parameters
  const query = getQuery(event)
  const period = (query.period as string) || 'month'
  const status = (query.status as string) || 'all'
  const startDate = query.start_date as string
  const endDate = query.end_date as string

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

    // Calculate date range based on period
    const now = new Date()
    let dateFilter = ''

    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = today.toISOString()
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = weekAgo.toISOString()
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = monthAgo.toISOString()
    } else if (period === 'custom' && startDate) {
      dateFilter = new Date(startDate).toISOString()
    }

    // Build referrals query
    let referralsQuery = supabase
      .from('affiliate_referrals')
      .select(`
        *,
        users (
          email,
          full_name
        ),
        subscriptions (
          status,
          current_period_end,
          subscription_plans (
            name,
            price
          )
        )
      `)
      .eq('affiliate_id', affiliate.id)

    // Apply filters
    if (dateFilter) {
      referralsQuery = referralsQuery.gte('created_at', dateFilter)
    }

    if (period === 'custom' && endDate) {
      referralsQuery = referralsQuery.lte('created_at', new Date(endDate).toISOString())
    }

    if (status !== 'all') {
      referralsQuery = referralsQuery.eq('status', status)
    }

    const { data: referrals, error: referralsError } = await referralsQuery.order('created_at', { ascending: false })

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

    // Calculate statistics
    const trialReferrals = referrals?.filter(r => r.status === 'trial') || []
    const activeReferrals = referrals?.filter(r => r.status === 'active') || []
    const paidReferrals = commissions?.filter(c => c.status === 'paid') || []
    const canceledReferrals = referrals?.filter(r => ['canceled', 'expired'].includes(r.status)) || []

    const availableCommissions = commissions?.filter(c => c.status === 'available') || []
    const pendingCommissions = commissions?.filter(c => c.status === 'pending') || []

    const conversionRate = totalClicks && totalClicks > 0
      ? ((referrals?.length || 0) / totalClicks * 100).toFixed(2)
      : '0.00'

    // Generate chart data - Daily conversions for last 30 days
    const chartData = generateChartData(referrals || [], commissions || [])

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
      totals: {
        total_referrals: referrals?.length || 0,
        active_referrals: activeReferrals.length,
        paid_referrals: paidReferrals.length,
        total_commission: affiliate.total_earnings,
        available_balance: affiliate.available_balance
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
      chart_data: chartData,
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

/**
 * Generate chart data for conversions and commissions
 */
function generateChartData(referrals: any[], commissions: any[]) {
  // Last 30 days data
  const days = 30
  const now = new Date()
  const dailyConversions = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]

    const conversionsOnDay = referrals.filter(r => {
      const refDate = new Date(r.created_at).toISOString().split('T')[0]
      return refDate === dateStr
    }).length

    dailyConversions.push({
      date: dateStr,
      conversions: conversionsOnDay
    })
  }

  // Status distribution (for pie chart)
  const trialCount = referrals.filter(r => r.status === 'trial').length
  const activeCount = referrals.filter(r => r.status === 'active').length
  const canceledCount = referrals.filter(r => ['canceled', 'expired'].includes(r.status)).length
  const paidCount = commissions.filter(c => c.status === 'paid').length

  return {
    daily_conversions: dailyConversions,
    status_distribution: {
      pending: trialCount,
      active: activeCount,
      paid: paidCount,
      canceled: canceledCount
    }
  }
}

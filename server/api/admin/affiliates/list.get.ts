import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/admin/affiliates/list - Listar todos afiliados (admin)
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  // Verificar se é admin
  if (user.email !== 'mariocromia@gmail.com') {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado'
    })
  }

  try {
    // Buscar todos afiliados com estatísticas
    const { data: affiliates, error } = await supabase
      .from('affiliates')
      .select(`
        *,
        users:user_id (
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Para cada afiliado, buscar estatísticas
    const affiliatesWithStats = await Promise.all(
      (affiliates || []).map(async (affiliate) => {
        // Contar referrals
        const { count: totalReferrals } = await supabase
          .from('affiliate_referrals')
          .select('*', { count: 'exact', head: true })
          .eq('affiliate_id', affiliate.id)

        const { count: activeReferrals } = await supabase
          .from('affiliate_referrals')
          .select('*', { count: 'exact', head: true })
          .eq('affiliate_id', affiliate.id)
          .eq('status', 'active')

        const { count: trialReferrals } = await supabase
          .from('affiliate_referrals')
          .select('*', { count: 'exact', head: true })
          .eq('affiliate_id', affiliate.id)
          .eq('status', 'trial')

        // Contar comissões pendentes
        const { count: pendingCommissions } = await supabase
          .from('affiliate_commissions')
          .select('*', { count: 'exact', head: true })
          .eq('affiliate_id', affiliate.id)
          .eq('status', 'pending')

        // Contar cliques
        const { count: totalClicks } = await supabase
          .from('affiliate_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('affiliate_id', affiliate.id)

        return {
          ...affiliate,
          stats: {
            total_referrals: totalReferrals || 0,
            active_referrals: activeReferrals || 0,
            trial_referrals: trialReferrals || 0,
            pending_commissions: pendingCommissions || 0,
            total_clicks: totalClicks || 0,
            conversion_rate: totalClicks && totalClicks > 0
              ? ((totalReferrals || 0) / totalClicks * 100).toFixed(2)
              : '0.00'
          }
        }
      })
    )

    return {
      affiliates: affiliatesWithStats
    }
  } catch (error: any) {
    console.error('Erro ao listar afiliados:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao listar afiliados'
    })
  }
})

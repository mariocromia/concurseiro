import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/admin/affiliates/withdrawals - Listar solicitações de saque (admin)
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
    const { data: withdrawals, error } = await supabase
      .from('affiliate_withdrawals')
      .select(`
        *,
        affiliates (
          id,
          coupon_code,
          user_id,
          users:user_id (
            email
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      withdrawals: withdrawals || []
    }
  } catch (error: any) {
    console.error('Erro ao listar saques:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao listar saques'
    })
  }
})

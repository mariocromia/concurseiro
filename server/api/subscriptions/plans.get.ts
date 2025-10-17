import { serverSupabaseClient } from '#supabase/server'

// GET /api/subscriptions/plans - Listar planos disponíveis
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  const { data: plans, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('price', { ascending: true })

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar planos',
      data: error
    })
  }

  return {
    success: true,
    data: plans
  }
})

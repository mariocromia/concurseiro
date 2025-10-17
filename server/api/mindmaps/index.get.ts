import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/mindmaps - Listar mapas mentais do usuário
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  const query = getQuery(event)
  const search = query.search as string

  let queryBuilder = supabase
    .from('mindmaps')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (search) {
    queryBuilder = queryBuilder.ilike('title', `%${search}%`)
  }

  const { data: mindmaps, error } = await queryBuilder

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar mapas mentais',
      data: error
    })
  }

  return {
    success: true,
    data: mindmaps
  }
})

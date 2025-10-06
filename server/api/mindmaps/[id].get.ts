import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/mindmaps/:id - Buscar mapa mental específico com nós
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Usuário não autenticado'
    })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID do mapa mental é obrigatório'
    })
  }

  try {
    // Buscar mapa mental
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (mindmapError) throw mindmapError

    if (!mindmap) {
      throw createError({
        statusCode: 404,
        message: 'Mapa mental não encontrado'
      })
    }

    // Buscar nós
    const { data: nodes, error: nodesError } = await supabase
      .from('mindmap_nodes')
      .select('*')
      .eq('mindmap_id', id)

    if (nodesError) throw nodesError

    return {
      success: true,
      data: {
        ...mindmap,
        nodes: nodes || []
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar mapa mental'
    })
  }
})

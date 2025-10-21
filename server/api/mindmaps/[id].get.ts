import { serverSupabaseClient } from '#supabase/server'

// GET /api/mindmaps/:id - Buscar mapa mental específico com nós
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  // Usar getUser() ao invés de serverSupabaseUser() para garantir que o user.id existe
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
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
    console.log('[GET-MINDMAP] Buscando mindmap ID:', id)
    console.log('[GET-MINDMAP] User ID:', user.id)

    // Buscar mapa mental
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    console.log('[GET-MINDMAP] Mindmap encontrado:', !!mindmap)
    console.log('[GET-MINDMAP] Mindmap error:', mindmapError)

    if (mindmapError) throw mindmapError

    if (!mindmap) {
      throw createError({
        statusCode: 404,
        message: 'Mapa mental não encontrado'
      })
    }

    // Buscar nós
    console.log('[GET-MINDMAP] Buscando nós para mindmap_id:', id)
    const { data: nodes, error: nodesError } = await supabase
      .from('mindmap_nodes')
      .select('*')
      .eq('mindmap_id', id)

    console.log('[GET-MINDMAP] Nós encontrados:', nodes?.length || 0)
    console.log('[GET-MINDMAP] Nós error:', nodesError)
    if (nodes && nodes.length > 0) {
      console.log('[GET-MINDMAP] Primeiro nó:', JSON.stringify(nodes[0], null, 2))
    }

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

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// POST /api/mindmaps/:id/nodes - Adicionar/atualizar nós do mapa mental
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
  const body = await readBody(event)
  const { nodes } = body

  if (!id || !nodes || !Array.isArray(nodes)) {
    throw createError({
      statusCode: 400,
      message: 'Dados inválidos'
    })
  }

  try {
    // Verificar se o mapa pertence ao usuário
    const { data: mindmap } = await supabase
      .from('mindmaps')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!mindmap) {
      throw createError({
        statusCode: 404,
        message: 'Mapa mental não encontrado'
      })
    }

    // Deletar nós existentes e inserir novos (upsert completo)
    await supabase
      .from('mindmap_nodes')
      .delete()
      .eq('mindmap_id', id)

    if (nodes.length > 0) {
      const nodesData = nodes.map(node => ({
        id: node.id || undefined,
        mindmap_id: id,
        parent_id: node.parent_id || null,
        text: node.text,
        position_x: node.position_x || 0,
        position_y: node.position_y || 0,
        color: node.color || '#3b82f6'
      }))

      const { error: insertError } = await supabase
        .from('mindmap_nodes')
        .insert(nodesData)

      if (insertError) throw insertError
    }

    return {
      success: true,
      message: 'Nós atualizados com sucesso'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar nós'
    })
  }
})

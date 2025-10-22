import { serverSupabaseClient } from '#supabase/server'

// POST /api/mindmaps/:id/nodes - Adicionar/atualizar nós do mapa mental
export default defineEventHandler(async (event) => {
  console.log('==========================================')
  console.log('[NODES-POST] ENDPOINT CHAMADO!')
  console.log('==========================================')

  const supabase = await serverSupabaseClient(event)

  // Usar getUser() ao invés de serverSupabaseUser() para garantir que o user.id existe
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log('[NODES-POST] User ID:', user?.id)

  if (authError || !user) {
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

    // Deletar nós existentes
    await supabase
      .from('mindmap_nodes')
      .delete()
      .eq('mindmap_id', id)

    if (nodes.length > 0) {
      console.log('[NODES-POST] Salvando', nodes.length, 'nós para mindmap', id)

      // Mapear old ID -> new ID
      const idMapping: Record<string, string> = {}

      // PASSO 1: Inserir nós raiz (sem parent)
      const rootNodes = nodes.filter(node => !node.parent_id || node.parent_id === null)
      console.log('[NODES-POST] Inserindo', rootNodes.length, 'nós raiz...')

      if (rootNodes.length > 0) {
        const rootData = rootNodes.map(node => ({
          mindmap_id: id,
          parent_id: null,
          text: node.text || 'Sem texto',
          position_x: node.position_x || 0,
          position_y: node.position_y || 0,
          color: node.color || '#3b82f6'
        }))

        const { error: rootError, data: rootInserted } = await supabase
          .from('mindmap_nodes')
          .insert(rootData)
          .select()

        if (rootError) {
          console.error('[NODES-POST] ERRO ao inserir nós raiz:', rootError)
          throw rootError
        }

        // Mapear old IDs -> new IDs
        rootNodes.forEach((oldNode, index) => {
          if (rootInserted && rootInserted[index]) {
            idMapping[oldNode.id] = rootInserted[index].id
          }
        })

        console.log('[NODES-POST] ✅', rootInserted?.length || 0, 'nós raiz inseridos')
      }

      // PASSO 2: Inserir nós filhos (com parent)
      const childNodes = nodes.filter(node => node.parent_id && node.parent_id !== null)
      console.log('[NODES-POST] Inserindo', childNodes.length, 'nós filhos...')

      if (childNodes.length > 0) {
        const childData = childNodes.map(node => ({
          mindmap_id: id,
          parent_id: idMapping[node.parent_id] || null, // Mapear para novo ID
          text: node.text || 'Sem texto',
          position_x: node.position_x || 0,
          position_y: node.position_y || 0,
          color: node.color || '#3b82f6'
        }))

        const { error: childError, data: childInserted } = await supabase
          .from('mindmap_nodes')
          .insert(childData)
          .select()

        if (childError) {
          console.error('[NODES-POST] ERRO ao inserir nós filhos:', childError)
          throw childError
        }

        console.log('[NODES-POST] ✅', childInserted?.length || 0, 'nós filhos inseridos')
      }

      console.log('[NODES-POST] ✅ TOTAL:', nodes.length, 'nós salvos com sucesso!')
    }

    return {
      success: true,
      message: 'Nós atualizados com sucesso'
    }
  } catch (error: any) {
    console.error('[NODES-POST] ERRO CATCH:', error)
    console.error('[NODES-POST] ERRO DETALHES:', JSON.stringify(error, null, 2))

    // Mensagem de erro específica para colunas inexistentes
    const errorMsg = error.message || 'Erro ao atualizar nós'
    if (errorMsg.includes('column') && errorMsg.includes('does not exist')) {
      throw createError({
        statusCode: 500,
        message: `⚠️ BANCO DE DADOS DESATUALIZADO: Execute o arquivo database/EXECUTE_SOMENTE_ESTE_SQL.sql no Supabase SQL Editor. Erro original: ${errorMsg}`
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: `${errorMsg}. Detalhes: ${JSON.stringify(error.details || error.hint || 'Sem detalhes')}`
    })
  }
})

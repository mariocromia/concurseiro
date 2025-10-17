import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createMindmapSchema, validateBody } from '~/server/utils/validation-schemas'

// POST /api/mindmaps - Criar novo mapa mental
export default defineEventHandler(async (event) => {
  console.log('[CREATE-MINDMAP] Iniciando handler...')

  try {
    const supabase = await serverSupabaseClient(event)
    console.log('[CREATE-MINDMAP] Supabase client obtido')

    const user = await serverSupabaseUser(event)
    console.log('[CREATE-MINDMAP] User:', user ? user.id : 'Não autenticado')

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Usuário não autenticado'
      })
    }

    const body = await readBody(event)
    const { title, description, nodes } = validateBody(createMindmapSchema, body)

    console.log('[CREATE-MINDMAP] Título:', title)
    console.log('[CREATE-MINDMAP] Quantidade de nós:', nodes?.length || 0)

    // Criar mapa mental
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .insert({
        user_id: user.id,
        title,
        description: description || null
      })
      .select()
      .single()

    if (mindmapError) {
      console.error('[CREATE-MINDMAP] Erro ao criar mindmap:', mindmapError)
      throw mindmapError
    }

    console.log('[CREATE-MINDMAP] Mindmap criado:', mindmap.id)

    // Criar nós se fornecidos
    if (nodes && nodes.length > 0) {
      console.log('[CREATE-MINDMAP] Iniciando criação de nós...')

      // Verificar se algum nó tem ID (significa que veio da IA)
      const hasIds = nodes.some((n: any) => n.id)

      if (!hasIds) {
        // Caso simples: nós sem IDs (criação em branco), inserir direto
        console.log('[CREATE-MINDMAP] Nós sem IDs, inserindo diretamente...')
        const nodesWithMindmapId = nodes.map((node: any) => ({
          mindmap_id: mindmap.id,
          parent_id: node.parent_id || null,
          text: node.text,
          position_x: node.position_x || 0,
          position_y: node.position_y || 0,
          color: node.color || '#3b82f6'
        }))

        const { error: nodesError } = await supabase
          .from('mindmap_nodes')
          .insert(nodesWithMindmapId)

        if (nodesError) {
          console.error('[CREATE-MINDMAP] Erro ao inserir nós:', nodesError)
          throw nodesError
        }

        console.log('[CREATE-MINDMAP] Nós criados com sucesso!')
      } else {
        // Caso complexo: nós com IDs temporários (da IA), precisa mapear
        console.log('[CREATE-MINDMAP] Nós com IDs, mapeando...')
        const idMap = new Map<string, string>()
        const nodesToInsert: any[] = []

        // Primeira passada: criar nós sem parent_id (nós raiz)
        for (const node of nodes) {
          if (!node.parent_id) {
            nodesToInsert.push({
              mindmap_id: mindmap.id,
              parent_id: null,
              text: node.text,
              position_x: node.position_x || 0,
              position_y: node.position_y || 0,
              color: node.color || '#3b82f6'
            })
          }
        }

      // Inserir nós raiz e mapear IDs
      if (nodesToInsert.length > 0) {
        const { data: insertedRootNodes, error: rootError } = await supabase
          .from('mindmap_nodes')
          .insert(nodesToInsert)
          .select()

        if (rootError) throw rootError

        // Mapear IDs temporários para UUIDs reais
        let rootIndex = 0
        for (const node of nodes) {
          if (!node.parent_id && insertedRootNodes) {
            idMap.set(node.id, insertedRootNodes[rootIndex].id)
            rootIndex++
          }
        }
      }

      // Segunda passada: criar nós filhos (com parent_id)
      const childNodesToInsert: any[] = []
      for (const node of nodes) {
        if (node.parent_id) {
          // Converter parent_id temporário para UUID real
          const realParentId = idMap.get(node.parent_id)

          childNodesToInsert.push({
            mindmap_id: mindmap.id,
            parent_id: realParentId || null,
            text: node.text,
            position_x: node.position_x || 0,
            position_y: node.position_y || 0,
            color: node.color || '#3b82f6'
          })
        }
      }

      // Inserir nós filhos em lotes, mapeando IDs
      if (childNodesToInsert.length > 0) {
        const { data: insertedChildNodes, error: childError } = await supabase
          .from('mindmap_nodes')
          .insert(childNodesToInsert)
          .select()

        if (childError) throw childError

        // Mapear IDs dos filhos também
        let childIndex = 0
        for (const node of nodes) {
          if (node.parent_id && insertedChildNodes) {
            idMap.set(node.id, insertedChildNodes[childIndex].id)
            childIndex++
          }
        }
      }

      // Se houver nós em níveis mais profundos (netos, bisnetos, etc.)
      const remainingNodes = nodes.filter((n: any) => {
        return n.parent_id && !idMap.has(n.parent_id) && idMap.has(n.parent_id) === false
      })

      // Inserir nós restantes recursivamente até não haver mais
      let hasMoreNodes = true
      let safetyCounter = 0
      while (hasMoreNodes && safetyCounter < 10) {
        const nodesToInsertNow: any[] = []
        const nodesWithMappedParent: any[] = []

        for (const node of nodes) {
          // Pular nós já inseridos
          if (idMap.has(node.id)) continue

          // Verificar se o parent já foi mapeado
          if (node.parent_id && idMap.has(node.parent_id)) {
            nodesWithMappedParent.push(node)
            nodesToInsertNow.push({
              mindmap_id: mindmap.id,
              parent_id: idMap.get(node.parent_id),
              text: node.text,
              position_x: node.position_x || 0,
              position_y: node.position_y || 0,
              color: node.color || '#3b82f6'
            })
          }
        }

        if (nodesToInsertNow.length === 0) {
          hasMoreNodes = false
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('mindmap_nodes')
            .insert(nodesToInsertNow)
            .select()

          if (insertError) throw insertError

          // Mapear novos IDs
          nodesWithMappedParent.forEach((node, index) => {
            if (inserted) {
              idMap.set(node.id, inserted[index].id)
            }
          })
        }

        safetyCounter++
      }

      console.log('[CREATE-MINDMAP] Nós com IDs mapeados e criados com sucesso!')
      }
    }

    console.log('[CREATE-MINDMAP] Sucesso! Mapa criado:', mindmap.id)

    return {
      success: true,
      data: mindmap
    }
  } catch (error: any) {
    console.error('[CREATE-MINDMAP] Erro ao criar mapa mental:', error)
    console.error('[CREATE-MINDMAP] Stack:', error.stack)
    console.error('[CREATE-MINDMAP] Detalhes:', JSON.stringify(error, null, 2))

    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao criar mapa mental'
    })
  }
})

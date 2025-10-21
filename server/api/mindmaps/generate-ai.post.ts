// POST /api/mindmaps/generate-ai - Gerar mapa mental com IA a partir de subject/chapter
import { serverSupabaseClient } from '#supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  console.log('[GENERATE-AI] ========================================')
  console.log('[GENERATE-AI] Iniciando handler...')
  console.log('[GENERATE-AI] URL:', event.node.req.url)
  console.log('[GENERATE-AI] Method:', event.node.req.method)

  try {
    console.log('[GENERATE-AI] Obtendo Supabase client e user...')
    const supabase = await serverSupabaseClient(event)

    // Usar getUser() ao invés de serverSupabaseUser() para garantir que o user.id existe
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('[GENERATE-AI] User completo:', JSON.stringify(user, null, 2))
    console.log('[GENERATE-AI] User ID:', user?.id)
    console.log('[GENERATE-AI] User ID type:', typeof user?.id)
    console.log('[GENERATE-AI] Auth error:', authError)

    if (authError || !user) {
      console.error('[GENERATE-AI] Usuário não autenticado!')
      console.error('[GENERATE-AI] Auth error:', authError)
      throw createError({
        statusCode: 401,
        message: 'Usuário não autenticado'
      })
    }

    if (!user.id) {
      console.error('[GENERATE-AI] User existe mas não tem ID!')
      console.error('[GENERATE-AI] User object:', user)
      throw createError({
        statusCode: 401,
        message: 'Erro de autenticação: user.id está undefined'
      })
    }

    console.log('[GENERATE-AI] Lendo body da requisição...')
    const body = await readBody(event)
    console.log('[GENERATE-AI] Body recebido:', JSON.stringify(body, null, 2))

    const { chapter_id, title } = body

    console.log('[GENERATE-AI] Parâmetros extraídos:')
    console.log('[GENERATE-AI]   - chapter_id:', chapter_id, '(type:', typeof chapter_id, ')')
    console.log('[GENERATE-AI]   - title:', title, '(type:', typeof title, ')')

    // Validação: chapter_id é OBRIGATÓRIO
    if (!chapter_id) {
      console.error('[GENERATE-AI] ❌ chapter_id não informado!')
      throw createError({
        statusCode: 400,
        message: 'É necessário selecionar um capítulo para gerar o mapa mental.'
      })
    }

    // Validação: title é OBRIGATÓRIO
    if (!title || title.trim() === '') {
      console.error('[GENERATE-AI] ❌ title não informado!')
      throw createError({
        statusCode: 400,
        message: 'É necessário informar um título para o mapa mental.'
      })
    }

    console.log('[GENERATE-AI] ✅ Validação OK! Prosseguindo...')

    // Buscar informações do capítulo
    console.log('[GENERATE-AI] Buscando informações do capítulo:', chapter_id)
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('id, title, subject_id')
      .eq('id', chapter_id)
      .single()

    if (chapterError || !chapter) {
      console.error('[GENERATE-AI] Erro ao buscar capítulo:', chapterError)
      throw createError({
        statusCode: 404,
        message: 'Capítulo não encontrado. Por favor, selecione um capítulo válido.'
      })
    }

    console.log('[GENERATE-AI] ✅ Capítulo encontrado:', chapter.title)

    // Buscar conteúdo das páginas do capítulo
    console.log('[GENERATE-AI] Buscando páginas do capítulo:', chapter_id)
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('title, content')
      .eq('chapter_id', chapter_id)
      .order('title')

    console.log('[GENERATE-AI] Resultado da busca de páginas:', { count: pages?.length, error: pagesError })

    if (pagesError) {
      console.error('[GENERATE-AI] Erro ao buscar páginas do capítulo:', pagesError)
      throw createError({
        statusCode: 500,
        message: `Erro ao buscar páginas do capítulo: ${pagesError.message}`
      })
    }

    if (!pages || pages.length === 0) {
      throw createError({
        statusCode: 404,
        message: `O capítulo "${chapter.title}" não possui páginas com conteúdo. Adicione conteúdo ao capítulo antes de gerar o mapa mental.`
      })
    }

    const contentText = pages.map(p => `${p.title || 'Sem título'}\n${p.content || ''}`).join('\n\n')
    console.log('[GENERATE-AI] ✅ Conteúdo de', pages.length, 'páginas carregado do capítulo "' + chapter.title + '"')
    console.log('[GENERATE-AI] Tamanho do conteúdo:', contentText.length, 'caracteres')

    // Sem verificação de assinatura - recurso liberado para todos os usuários
    console.log('[GENERATE-AI] ✅ Acesso autorizado para todos os usuários!')

    // Gerar mapa mental com IA
    const config = useRuntimeConfig()
    const apiKey = config.googleAiApiKey

    console.log('[GENERATE-AI] API Key configurada?', !!apiKey)
    console.log('[GENERATE-AI] API Key (primeiros 10 chars):', apiKey?.substring(0, 10))

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'API Key do Google AI não configurada'
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    console.log('[GENERATE-AI] Gerando mapa mental com IA...')

    const prompt = `Analise o seguinte conteúdo e crie uma estrutura hierárquica de mapa mental organizada logicamente.

CONTEÚDO:
${contentText.substring(0, 5000)}

Retorne APENAS um JSON válido (sem markdown, sem explicações) no seguinte formato:
{
  "nodes": [
    {
      "id": "1",
      "text": "Ideia principal",
      "parent_id": null,
      "level": 0
    },
    {
      "id": "2",
      "text": "Subtópico 1",
      "parent_id": "1",
      "level": 1
    }
  ]
}

Regras:
- O nó raiz (level 0) sempre tem parent_id null
- IDs devem ser strings numéricas sequenciais
- Organize em no máximo 3-4 níveis de profundidade
- Crie entre 8-20 nós no total
- Seja conciso nos textos (máximo 50 caracteres por nó)
- Agrupe ideias relacionadas sob um mesmo pai`

    const result = await model.generateContent(prompt)
    const response = result.response
    const responseText = response.text()

    console.log('[GENERATE-AI] Resposta da IA recebida')

    // Limpar resposta (remover markdown se houver)
    let cleanText = responseText.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '')
    }

    const aiData = JSON.parse(cleanText)

    // Validar estrutura
    if (!aiData.nodes || !Array.isArray(aiData.nodes)) {
      throw new Error('Estrutura de resposta inválida')
    }

    // Calcular posições baseadas na hierarquia
    const nodesWithPositions = calculateNodePositions(aiData.nodes)

    console.log('[GENERATE-AI] Nós com posições calculadas:', nodesWithPositions.length)

    // Criar mapa mental no banco
    const { data: mindmap, error: mindmapError } = await supabase
      .from('mindmaps')
      .insert({
        user_id: user.id,
        subject_id: chapter.subject_id, // Adicionar subject_id do capítulo
        title,
        description: chapter_id ? 'Gerado por IA a partir de capítulo' : 'Gerado por IA a partir de matéria completa'
      })
      .select()
      .single()

    if (mindmapError) {
      console.error('[GENERATE-AI] Erro ao criar mindmap:', mindmapError)
      throw mindmapError
    }

    console.log('[GENERATE-AI] Mindmap criado:', mindmap.id)

    // Criar nós no banco com mapeamento de IDs
    const idMap = new Map<string, string>()
    const nodesToInsert: any[] = []

    // Primeira passada: nós raiz
    for (const node of nodesWithPositions) {
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

    // Inserir nós raiz
    if (nodesToInsert.length > 0) {
      const { data: insertedRootNodes, error: rootError } = await supabase
        .from('mindmap_nodes')
        .insert(nodesToInsert)
        .select()

      if (rootError) throw rootError

      // Mapear IDs temporários para UUIDs reais
      let rootIndex = 0
      for (const node of nodesWithPositions) {
        if (!node.parent_id && insertedRootNodes) {
          idMap.set(node.id, insertedRootNodes[rootIndex].id)
          rootIndex++
        }
      }
    }

    // Inserir nós filhos recursivamente
    let hasMoreNodes = true
    let safetyCounter = 0
    while (hasMoreNodes && safetyCounter < 10) {
      const nodesToInsertNow: any[] = []
      const nodesWithMappedParent: any[] = []

      for (const node of nodesWithPositions) {
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

    console.log('[GENERATE-AI] Sucesso! Mapa criado:', mindmap.id)

    console.log('[GENERATE-AI] ========================================')
    console.log('[GENERATE-AI] SUCESSO! Retornando mapa mental:', mindmap.id)
    console.log('[GENERATE-AI] ========================================')

    return {
      success: true,
      data: mindmap
    }
  } catch (error: any) {
    console.error('[GENERATE-AI] ========================================')
    console.error('[GENERATE-AI] ERRO CAPTURADO!')
    console.error('[GENERATE-AI] Tipo:', error.constructor.name)
    console.error('[GENERATE-AI] Message:', error.message)
    console.error('[GENERATE-AI] StatusCode:', error.statusCode)
    console.error('[GENERATE-AI] Stack:', error.stack)
    console.error('[GENERATE-AI] Error completo:', JSON.stringify(error, null, 2))
    console.error('[GENERATE-AI] ========================================')

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao gerar mapa mental com IA'
    })
  }
})

// Função para calcular posições dos nós
function calculateNodePositions(nodes: any[]) {
  const positioned: any[] = []

  // Organizar nós por nível
  const nodesByLevel: { [key: number]: any[] } = {}
  nodes.forEach(node => {
    const level = node.level || 0
    if (!nodesByLevel[level]) nodesByLevel[level] = []
    nodesByLevel[level].push(node)
  })

  // Calcular posições
  Object.keys(nodesByLevel).sort((a, b) => Number(a) - Number(b)).forEach(levelKey => {
    const level = Number(levelKey)
    const levelNodes = nodesByLevel[level]

    levelNodes.forEach((node, index) => {
      const x = level * 300 // Espaçamento horizontal por nível
      const y = index * 150 - (levelNodes.length * 75) + 200 // Centralizar verticalmente

      positioned.push({
        ...node,
        position_x: x,
        position_y: y,
        color: getColorByLevel(level)
      })
    })
  })

  return positioned
}

// Cores por nível
function getColorByLevel(level: number): string {
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
  return colors[level % colors.length]
}

// POST /api/mindmaps/generate-from-text - Gerar estrutura de mapa mental a partir de texto usando IA
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  console.log('[GENERATE] Handler iniciado')

  try {
    console.log('[GENERATE] Lendo body...')
    const body = await readBody(event)
    const { text } = body

    console.log('[GENERATE] Recebido texto:', text?.substring(0, 50) + '...')

    if (!text || text.trim().length === 0) {
      console.log('[GENERATE] Texto vazio')
      throw createError({
        statusCode: 400,
        message: 'Texto é obrigatório'
      })
    }

    const config = useRuntimeConfig()
    const apiKey = config.public.googleAiApiKey

    console.log('[GENERATE] API Key configurada:', apiKey ? 'Sim' : 'Não')

    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'API Key do Google AI não configurada'
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    console.log('[GENERATE] Modelo Gemini inicializado')

    const prompt = `Analise o seguinte texto e crie uma estrutura hierárquica de mapa mental organizada logicamente.

TEXTO:
${text}

Retorne APENAS um JSON válido (sem markdown, sem explicações) no seguinte formato:
{
  "title": "Título principal do mapa mental",
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
- Crie entre 5-15 nós no total
- Seja conciso nos textos (máximo 50 caracteres por nó)
- Agrupe ideias relacionadas sob um mesmo pai`

    console.log('[GENERATE] Gerando conteúdo com IA...')
    const result = await model.generateContent(prompt)
    const response = result.response
    const responseText = response.text()

    console.log('[GENERATE] Resposta da IA recebida:', responseText.substring(0, 100) + '...')

    // Limpar resposta (remover markdown se houver)
    let cleanText = responseText.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '')
    }

    console.log('[GENERATE] Texto limpo:', cleanText.substring(0, 100) + '...')

    const data = JSON.parse(cleanText)

    console.log('[GENERATE] JSON parseado:', JSON.stringify(data).substring(0, 100) + '...')

    // Validar estrutura
    if (!data.title || !data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Estrutura de resposta inválida')
    }

    // Calcular posições baseadas na hierarquia
    const nodesWithPositions = calculateNodePositions(data.nodes)

    console.log('[GENERATE] Nós com posições calculadas:', nodesWithPositions.length)

    return {
      success: true,
      data: {
        title: data.title,
        nodes: nodesWithPositions
      }
    }
  } catch (error: any) {
    console.error('[GENERATE] Erro ao gerar mapa mental:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao processar texto com IA'
    })
  }
})

// Função para calcular posições dos nós
function calculateNodePositions(nodes: any[]) {
  const positioned: any[] = []
  const levelCounts: { [key: number]: number } = {}

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
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
  return colors[level % colors.length]
}

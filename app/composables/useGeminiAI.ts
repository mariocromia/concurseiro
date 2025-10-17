/**
 * Gemini AI Composable - Client-side wrapper
 *
 * Security: All AI calls go through server-side proxy
 * No API keys exposed to client
 * Rate limiting and auth handled server-side
 *
 * @author Claude Code
 * @date 2025-10-16 (Security Update)
 */

export const useGeminiAI = () => {
  const client = useSupabaseClient()

  /**
   * Internal: Call Gemini proxy with proper error handling
   */
  const callProxy = async (prompt: string, options: {
    model?: string
    temperature?: number
    maxTokens?: number
    systemInstruction?: string
  } = {}) => {
    try {
      const response = await $fetch('/api/ai/gemini-proxy', {
        method: 'POST',
        body: {
          prompt,
          model: options.model || 'gemini-pro',
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2048,
          systemInstruction: options.systemInstruction
        }
      })

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate AI response')
      }

      return response.data.text
    } catch (error: any) {
      // Handle rate limiting
      if (error.statusCode === 429) {
        throw new Error('Você atingiu o limite de requisições de IA. Aguarde alguns minutos e tente novamente.')
      }

      // Handle auth errors
      if (error.statusCode === 401) {
        throw new Error('Você precisa estar logado para usar a IA.')
      }

      // Handle subscription errors
      if (error.statusCode === 403) {
        throw new Error('Features de IA requerem plano Pro. Faça upgrade para desbloquear.')
      }

      // Generic error
      console.error('Erro ao chamar IA:', error)
      throw new Error(error.message || 'Erro ao gerar resposta da IA. Tente novamente.')
    }
  }

  /**
   * Gerar texto com Gemini
   */
  const generateText = async (prompt: string, context?: string) => {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt
    return await callProxy(fullPrompt)
  }

  /**
   * Gerar resumo de conteúdo
   */
  const summarize = async (content: string, maxLength = 200) => {
    const prompt = `Resuma o seguinte conteúdo em no máximo ${maxLength} palavras, mantendo as informações mais importantes:

${content}`

    return await callProxy(prompt)
  }

  /**
   * Gerar questões de estudo
   */
  const generateQuestions = async (content: string, quantity = 5) => {
    const prompt = `Com base no seguinte conteúdo, crie ${quantity} questões de múltipla escolha para estudo, com 4 alternativas cada (A, B, C, D) e indique a resposta correta:

${content}

Formato:
1. [Pergunta]
A) [Alternativa]
B) [Alternativa]
C) [Alternativa]
D) [Alternativa]
Resposta: [Letra correta]`

    return await callProxy(prompt, { temperature: 0.8 })
  }

  /**
   * Gerar flashcards
   */
  const generateFlashcards = async (content: string, quantity = 10) => {
    const prompt = `Com base no seguinte conteúdo, crie ${quantity} flashcards para estudo. Cada flashcard deve ter uma frente (pergunta/conceito) e verso (resposta/definição):

${content}

Formato JSON:
[
  {
    "front": "Pergunta ou conceito",
    "back": "Resposta ou definição"
  }
]`

    const response = await callProxy(prompt, { temperature: 0.7 })

    // Tentar extrair JSON da resposta
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Erro ao parsear flashcards:', e)
    }

    return response
  }

  /**
   * Explicar conceito
   */
  const explainConcept = async (
    concept: string,
    level: 'simples' | 'intermediario' | 'avancado' = 'intermediario'
  ) => {
    const levels = {
      simples: 'de forma simples e didática, como se estivesse explicando para um iniciante',
      intermediario: 'de forma clara e objetiva',
      avancado: 'de forma técnica e aprofundada'
    }

    const prompt = `Explique o conceito de "${concept}" ${levels[level]}.`

    return await callProxy(prompt)
  }

  /**
   * Criar mapa mental
   */
  const generateMindMap = async (topic: string) => {
    const prompt = `Crie um mapa mental sobre "${topic}" em formato de lista hierárquica com tópicos e subtópicos:

Formato:
- Tópico Principal
  - Subtópico 1
    - Detalhe 1
    - Detalhe 2
  - Subtópico 2
    - Detalhe 1`

    return await callProxy(prompt, { temperature: 0.8 })
  }

  /**
   * Corrigir redação/texto
   */
  const correctText = async (text: string) => {
    const prompt = `Analise o texto abaixo e forneça:
1. Correções gramaticais e ortográficas
2. Sugestões de melhoria na estrutura
3. Pontuação da qualidade (0-10)

Texto:
${text}

Formato:
CORREÇÕES:
[lista de correções]

SUGESTÕES:
[sugestões de melhoria]

PONTUAÇÃO: [0-10]`

    return await callProxy(prompt, { temperature: 0.5 })
  }

  /**
   * Gerar plano de estudos
   */
  const generateStudyPlan = async (subject: string, duration: string, level: string) => {
    const prompt = `Crie um plano de estudos detalhado para "${subject}" com duração de ${duration}, considerando nível ${level}.

Inclua:
- Objetivos de aprendizagem
- Cronograma semanal
- Tópicos a serem estudados
- Recursos recomendados
- Forma de avaliação do progresso`

    return await callProxy(prompt, { temperature: 0.7 })
  }

  /**
   * Chat com contexto (para conversação)
   */
  const chat = async (messages: { role: 'user' | 'assistant'; content: string }[]) => {
    // Construir contexto a partir do histórico
    const context = messages
      .slice(0, -1)
      .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
      .join('\n\n')

    const lastMessage = messages[messages.length - 1]
    const systemInstruction = 'Você é um assistente de estudos especializado em concursos e vestibulares. Ajude o usuário com suas dúvidas de forma clara e didática.'

    const fullPrompt = context
      ? `Histórico da conversa:\n${context}\n\nPergunta atual do usuário:\n${lastMessage.content}`
      : lastMessage.content

    return await callProxy(fullPrompt, { systemInstruction, temperature: 0.7 })
  }

  /**
   * Enviar mensagem ao assistente (wrapper simplificado)
   */
  const sendMessage = async (message: string, conversationHistory: any[] = []) => {
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    return await chat(messages)
  }

  return {
    generateText,
    summarize,
    generateQuestions,
    generateFlashcards,
    explainConcept,
    generateMindMap,
    correctText,
    generateStudyPlan,
    chat,
    sendMessage
  }
}

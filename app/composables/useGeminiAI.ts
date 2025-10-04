import { GoogleGenerativeAI } from '@google/generative-ai'

export const useGeminiAI = () => {
  const config = useRuntimeConfig()

  const genAI = new GoogleGenerativeAI(config.public.googleAiApiKey)

  /**
   * Gerar texto com Gemini
   */
  const generateText = async (prompt: string, context?: string) => {
    try {
      // Usar modelo gemini-2.0-flash-exp que é compatível
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp'
      })

      const fullPrompt = context
        ? `${context}\n\n${prompt}`
        : prompt

      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Erro ao gerar texto com Gemini:', error)
      throw error
    }
  }

  /**
   * Gerar resumo de conteúdo
   */
  const summarize = async (content: string, maxLength = 200) => {
    const prompt = `Resuma o seguinte conteúdo em no máximo ${maxLength} palavras, mantendo as informações mais importantes:

${content}`

    return await generateText(prompt)
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

    return await generateText(prompt)
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

    const response = await generateText(prompt)

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
  const explainConcept = async (concept: string, level: 'simples' | 'intermediario' | 'avancado' = 'intermediario') => {
    const levels = {
      simples: 'de forma simples e didática, como se estivesse explicando para um iniciante',
      intermediario: 'de forma clara e objetiva',
      avancado: 'de forma técnica e aprofundada'
    }

    const prompt = `Explique o conceito de "${concept}" ${levels[level]}.`

    return await generateText(prompt)
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

    return await generateText(prompt)
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

    return await generateText(prompt)
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

    return await generateText(prompt)
  }

  /**
   * Chat com contexto (para conversação)
   */
  const chat = async (messages: { role: 'user' | 'assistant', content: string }[]) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response

    return response.text()
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
    chat
  }
}

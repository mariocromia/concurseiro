/**
 * Gemini AI Composable - Legacy wrapper for backward compatibility
 *
 * Security: All AI calls go through server-side proxy
 * No API keys exposed to client
 *
 * @author Claude Code
 * @date 2025-10-18 (Security Fix)
 */

export const useGemini = () => {
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
      // Get the baseURL from window.location for client-side requests
      const baseURL = typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'

      const url = `${baseURL}/api/ai/gemini-proxy`

      const response: any = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: options.model || 'gemini-2.0-flash-exp',
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2048,
          systemInstruction: options.systemInstruction
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: any = new Error(errorData.message || `HTTP error! status: ${response.status}`)
        error.statusCode = response.status
        error.status = response.status
        error.data = errorData
        throw error
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate AI response')
      }

      return data.data.text
    } catch (error: any) {
      // Handle rate limiting
      if (error.statusCode === 429 || error.status === 429) {
        throw new Error('Você atingiu o limite de requisições de IA. Aguarde alguns minutos e tente novamente.')
      }

      // Handle auth errors
      if (error.statusCode === 401 || error.status === 401) {
        throw new Error('Você precisa estar logado para usar a IA.')
      }

      // Handle subscription errors
      if (error.statusCode === 403 || error.status === 403) {
        throw new Error('Recurso disponível apenas no plano Pro. Faça upgrade para desbloquear recursos de IA.')
      }

      // Generic error
      console.error('Erro ao chamar IA:', error)
      throw new Error(error.data?.message || error.message || 'Erro ao gerar resposta da IA. Tente novamente.')
    }
  }

  const generateSummary = async (content: string, chapterTitle?: string) => {
    try {
      const prompt = `Você é um assistente educacional especializado em criar resumos de estudo.

${chapterTitle ? `Título do capítulo: ${chapterTitle}\n` : ''}
Conteúdo:
${content}

Por favor, crie um resumo estruturado e completo deste conteúdo, destacando:
1. Principais conceitos
2. Pontos-chave
3. Informações importantes para memorização

Formate o resumo de forma clara e organizada.`

      return await callProxy(prompt)
    } catch (error) {
      console.error('Erro ao gerar resumo:', error)
      throw error
    }
  }

  const generateExercises = async (
    content: string,
    quantity: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    chapterTitle?: string
  ) => {
    try {
      const difficultyMap = {
        easy: 'fácil (conceitos básicos)',
        medium: 'médio (aplicação de conceitos)',
        hard: 'difícil (análise crítica e síntese)'
      }

      const prompt = `Você é um professor especializado em criar questões de concurso e vestibular.

${chapterTitle ? `Título do capítulo: ${chapterTitle}\n` : ''}
Conteúdo:
${content}

Crie ${quantity} questões de múltipla escolha com nível de dificuldade ${difficultyMap[difficulty]}.

Para cada questão, forneça:
1. O enunciado da questão
2. 5 alternativas (A, B, C, D, E)
3. A resposta correta
4. Uma explicação detalhada

Formate a resposta como um JSON válido com a seguinte estrutura:
{
  "exercises": [
    {
      "question": "texto da questão",
      "options": {
        "A": "alternativa A",
        "B": "alternativa B",
        "C": "alternativa C",
        "D": "alternativa D",
        "E": "alternativa E"
      },
      "correct_answer": "A",
      "explanation": "explicação detalhada"
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`

      const text = await callProxy(prompt, { temperature: 0.8 })

      // Extrair JSON do texto
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Resposta da IA não está no formato JSON esperado')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed.exercises
    } catch (error) {
      console.error('Erro ao gerar exercícios:', error)
      throw error
    }
  }

  const generateFlashcards = async (
    content: string,
    quantity: number = 10,
    chapterTitle?: string
  ) => {
    try {
      const prompt = `Você é um especialista em criar flashcards para estudo efetivo.

${chapterTitle ? `Título do capítulo: ${chapterTitle}\n` : ''}
Conteúdo:
${content}

Crie ${quantity} flashcards (cartões de perguntas e respostas) baseados neste conteúdo.

Cada flashcard deve ter:
1. Uma pergunta clara e objetiva (frente do cartão)
2. Uma resposta concisa e informativa (verso do cartão)

As perguntas devem cobrir os conceitos mais importantes do conteúdo.

Formate a resposta como um JSON válido com a seguinte estrutura:
{
  "flashcards": [
    {
      "question": "pergunta",
      "answer": "resposta"
    }
  ]
}

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois.`

      const text = await callProxy(prompt)

      // Extrair JSON do texto
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Resposta da IA não está no formato JSON esperado')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed.flashcards
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error)
      throw error
    }
  }

  const chat = async (messages: Array<{ role: string; content: string }>, context?: string) => {
    try {
      // Construir histórico de chat
      let prompt = ''

      if (context) {
        prompt += `Contexto do conteúdo sendo estudado:\n${context}\n\n`
      }

      prompt += 'Histórico da conversa:\n\n'

      messages.forEach(msg => {
        const role = msg.role === 'user' ? 'Estudante' : 'Assistente'
        prompt += `${role}: ${msg.content}\n\n`
      })

      prompt += 'Responda como um assistente educacional prestativo e didático.'

      return await callProxy(prompt)
    } catch (error) {
      console.error('Erro no chat com IA:', error)
      throw error
    }
  }

  const explainSelection = async (selectedText: string, fullContext: string) => {
    try {
      const prompt = `Você é um professor especializado em explicar conceitos de forma didática.

Contexto completo:
${fullContext}

Texto selecionado pelo aluno:
"${selectedText}"

Por favor, forneça uma explicação detalhada e didática sobre o texto selecionado, considerando o contexto completo.
Inclua:
1. Explicação do conceito
2. Exemplos práticos
3. Como isso se relaciona com o tema maior
4. Dicas para memorização`

      return await callProxy(prompt)
    } catch (error) {
      console.error('Erro ao explicar seleção:', error)
      throw error
    }
  }

  return {
    generateSummary,
    generateExercises,
    generateFlashcards,
    chat,
    explainSelection
  }
}

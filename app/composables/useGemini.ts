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
   * Using $fetch for automatic authentication handling
   */
  const callProxy = async (prompt: string, options: {
    model?: string
    temperature?: number
    maxTokens?: number
    systemInstruction?: string
  } = {}) => {
    console.log('[useGemini] Calling proxy with $fetch')

    try {
      const data = await $fetch('/api/ai/gemini-proxy', {
        method: 'POST',
        body: {
          prompt,
          model: options.model || 'gemini-2.0-flash-exp',
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2048,
          systemInstruction: options.systemInstruction
        }
      })

      console.log('[useGemini] Response data:', data)

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate AI response')
      }

      return data.data.text
    } catch (error: any) {
      console.error('[useGemini] Error:', error)

      // Create a new error object with proper status codes
      // Never modify the original error object as it may be read-only
      const statusCode = error.data?.statusCode || error.statusCode || 500

      // Create a new error with the status code
      const newError = new Error(error.message || 'Failed to call AI proxy')
      ;(newError as any).statusCode = statusCode
      ;(newError as any).status = statusCode
      ;(newError as any).data = error.data

      throw newError
    }
  }

  const generateSummary = async (content: string, chapterTitle?: string) => {
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
  }

  const generateExercises = async (
    content: string,
    quantity: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    chapterTitle?: string
  ) => {
    console.log('[generateExercises] Starting with:', { quantity, difficulty, contentLength: content.length })

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
    console.log('[generateExercises] Received text:', text?.substring(0, 200))

    // Extrair JSON do texto
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Resposta da IA não está no formato JSON esperado')
    }

    const parsed = JSON.parse(jsonMatch[0])
    console.log('[generateExercises] Parsed exercises:', parsed.exercises?.length)
    return parsed.exercises
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

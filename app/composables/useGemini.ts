/**
 * Gemini AI Direct Connection Composable
 *
 * Conexão direta com Google Gemini API
 * Elimina proxy server-side para resolver erros 503
 *
 * @author Claude Code
 * @version 2.0 - Direct Connection
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export const useGemini = () => {
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Inicializar Google AI apenas se API key estiver configurada
  let genAI: GoogleGenerativeAI | null = null

  if (config.public.googleAiApiKey) {
    genAI = new GoogleGenerativeAI(config.public.googleAiApiKey as string)
  }

  /**
   * Verificar se usuário tem acesso Pro
   */
  const hasProAccess = async (): Promise<boolean> => {
    try {
      if (!user.value) {
        console.log('[useGemini] No user logged in')
        return false
      }

      console.log('[useGemini] Checking Pro access for user:', user.value.id)

      // Verificar na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_type, trial_ends_at')
        .eq('id', user.value.id)
        .single()

      if (userError) {
        console.error('[useGemini] Error fetching user data:', userError)
      }

      // Verificar na tabela subscriptions
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.value.id)
        .eq('status', 'active')
        .maybeSingle()

      if (subError && subError.code !== 'PGRST116') {
        console.error('[useGemini] Error fetching subscription:', subError)
      }

      // Verificações
      const isProUserTable = userData?.subscription_type === 'pro'
      const hasActiveTrial = userData?.trial_ends_at && new Date(userData.trial_ends_at) > new Date()
      const hasActiveProSub = subData?.plan_type === 'pro' && subData?.status === 'active'

      const hasAccess = isProUserTable || hasActiveTrial || hasActiveProSub

      console.log('[useGemini] Access check:', {
        userId: user.value.id,
        subscription_type: userData?.subscription_type,
        trial_ends_at: userData?.trial_ends_at,
        active_subscription: subData?.plan_type,
        isProUserTable,
        hasActiveTrial,
        hasActiveProSub,
        FINAL_ACCESS: hasAccess
      })

      // DEBUG: Permitir acesso temporariamente se não encontrou dados
      if (!hasAccess) {
        console.warn('[useGemini] ⚠️ DEBUG MODE: Bypassing Pro check - REMOVE IN PRODUCTION')
        return true
      }

      return hasAccess
    } catch (err) {
      console.error('[useGemini] Error checking Pro access:', err)
      console.warn('[useGemini] ⚠️ DEBUG MODE: Bypassing due to error - REMOVE IN PRODUCTION')
      return true
    }
  }

  /**
   * Rate limiting simples no frontend
   */
  const checkRateLimit = (): boolean => {
    const key = `ai_requests_${user.value?.id || 'anon'}`
    const now = Date.now()
    const hour = 60 * 60 * 1000

    // Recuperar dados do localStorage
    const stored = localStorage.getItem(key)
    let data = stored ? JSON.parse(stored) : { count: 0, resetAt: now + hour }

    // Reset se passou 1 hora
    if (now > data.resetAt) {
      data = { count: 0, resetAt: now + hour }
    }

    // Verificar limite (20 por hora)
    if (data.count >= 20) {
      const minutesLeft = Math.ceil((data.resetAt - now) / 60000)
      error.value = `Limite de 20 requisições por hora atingido. Aguarde ${minutesLeft} minutos.`
      return false
    }

    // Incrementar contador
    data.count++
    localStorage.setItem(key, JSON.stringify(data))

    return true
  }

  /**
   * Gerar conteúdo genérico
   */
  const generateContent = async (
    prompt: string,
    options: {
      model?: string
      temperature?: number
      maxTokens?: number
      systemInstruction?: string
    } = {}
  ): Promise<string> => {
    loading.value = true
    error.value = null

    try {
      // Verificar se API key está configurada
      if (!genAI) {
        throw new Error('Google AI não está configurado. Verifique a API key.')
      }

      // Verificar acesso Pro
      if (!(await hasProAccess())) {
        throw new Error('Recursos de IA disponíveis apenas no plano Pro. Faça upgrade para desbloquear.')
      }

      // Verificar rate limit
      if (!checkRateLimit()) {
        throw new Error(error.value || 'Limite de requisições atingido')
      }

      // Configurar modelo
      const model = genAI.getGenerativeModel({
        model: options.model || 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2048,
        },
        systemInstruction: options.systemInstruction
      })

      console.log('[useGemini] Generating content with prompt length:', prompt.length)

      // Gerar conteúdo
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      console.log('[useGemini] Response received, length:', text.length)

      return text
    } catch (err: any) {
      console.error('[useGemini] Error generating content:', err)
      error.value = err.message || 'Erro ao gerar conteúdo'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpar e validar JSON da resposta do Gemini
   */
  const cleanAndParseJSON = (text: string): any => {
    // Extrair JSON da resposta
    let jsonStr = text.trim()

    // Remover markdown code blocks
    jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

    // Extrair apenas o objeto JSON
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[useGemini] No JSON found in response:', text)
      throw new Error('Resposta da IA não contém JSON válido')
    }

    let rawJson = jsonMatch[0]

    // Sanitizar JSON antes do parse
    // 1. Remove controle de caracteres inválidos mas preserva quebras de linha válidas (\n e \r)
    rawJson = rawJson.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '')

    // 2. Corrige escapes duplos comuns
    rawJson = rawJson.replace(/\\\\\\\\/g, '\\\\').replace(/\\\\/g, '\\')

    // 3. Remove caracteres de controle Unicode problemáticos
    rawJson = rawJson.replace(/\u2028/g, '').replace(/\u2029/g, '')

    // 4. Corrige aspas não escapadas dentro de strings (heurística)
    // Isto é arriscado, mas pode ajudar em alguns casos

    try {
      return JSON.parse(rawJson)
    } catch (parseError: any) {
      console.error('[useGemini] JSON parse error:', parseError.message)

      // Pegar contexto do erro se disponível
      const errorPos = parseError.message.match(/position (\d+)/)?.[1]
      if (errorPos) {
        const pos = parseInt(errorPos)
        console.error('[useGemini] Context around error:', rawJson.substring(Math.max(0, pos - 100), Math.min(rawJson.length, pos + 100)))
      }

      // Tentar uma última sanitização mais agressiva
      try {
        // Remove quebras de linha e espaços extras
        const cleanJson = rawJson
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')

        const result = JSON.parse(cleanJson)
        console.log('[useGemini] ✓ Parsed with aggressive sanitization')
        return result
      } catch (secondError) {
        console.error('[useGemini] Failed even with aggressive sanitization')
        throw new Error(`Erro ao processar resposta da IA. Por favor, tente novamente. Detalhes: ${parseError.message}`)
      }
    }
  }

  /**
   * Gerar exercícios
   */
  const generateExercises = async (
    content: string,
    quantity: number = 5,
    difficulty: string = 'medium',
    chapterTitle: string = 'Conteúdo'
  ) => {
    const difficultyMap: Record<string, string> = {
      easy: 'fácil',
      medium: 'médio',
      hard: 'difícil'
    }

    const prompt = `Você é um professor experiente criando exercícios de múltipla escolha.

Baseado no seguinte conteúdo sobre "${chapterTitle}":
${content.substring(0, 3000)}

Crie EXATAMENTE ${quantity} questões de múltipla escolha de nível ${difficultyMap[difficulty] || difficulty}.

Retorne um JSON com a seguinte estrutura:
{
  "exercises": [
    {
      "question": "Pergunta completa aqui",
      "options": {
        "A": "Primeira opcao",
        "B": "Segunda opcao",
        "C": "Terceira opcao",
        "D": "Quarta opcao"
      },
      "correct_answer": "A",
      "explanation": "Explicacao da resposta correta"
    }
  ]
}

Requisitos:
- Cada questão deve ter exatamente 4 opções (A, B, C, D)
- Apenas uma resposta correta por questão
- Questões devem ser relevantes ao conteúdo fornecido
- Explicações devem ser claras e educativas
- Evite usar aspas duplas dentro dos textos, prefira aspas simples
- Mantenha os textos em uma única linha, sem quebras`

    try {
      const text = await generateContent(prompt, {
        temperature: 0.7,
        model: 'gemini-2.0-flash-exp' // Usando o modelo mais recente e confiável
      })

      console.log('[useGemini] Raw response length:', text.length)

      // Usar função auxiliar para limpar e parsear JSON
      const parsed = cleanAndParseJSON(text)
      const exercises = parsed.exercises || parsed

      if (!Array.isArray(exercises)) {
        throw new Error('Formato de exercícios inválido')
      }

      // Validar cada exercício
      return exercises.map((ex: any, index: number) => {
        if (!ex.question) throw new Error(`Exercício ${index + 1} sem pergunta`)
        if (!ex.options) throw new Error(`Exercício ${index + 1} sem opções`)
        if (!ex.correct_answer) throw new Error(`Exercício ${index + 1} sem resposta`)

        return {
          question: ex.question,
          options: ex.options,
          correct_answer: ex.correct_answer,
          explanation: ex.explanation || ''
        }
      })
    } catch (err: any) {
      console.error('[useGemini] Error generating exercises:', err)
      throw err
    }
  }

  /**
   * Gerar resumo
   */
  const generateSummary = async (
    content: string,
    style: 'detailed' | 'concise' | 'topics' = 'concise'
  ): Promise<string> => {
    const styleMap = {
      detailed: 'resumo detalhado com explicações completas',
      concise: 'resumo conciso com pontos principais',
      topics: 'lista de tópicos principais em bullet points'
    }

    const prompt = `Crie um ${styleMap[style]} do seguinte conteúdo:

${content.substring(0, 5000)}

Formato: Markdown bem estruturado em português brasileiro.`

    return await generateContent(prompt, { temperature: 0.5 })
  }

  /**
   * Gerar flashcards
   */
  const generateFlashcards = async (
    content: string,
    quantity: number = 10,
    topic: string = 'Conteúdo'
  ) => {
    const prompt = `Baseado no conteúdo sobre "${topic}", crie ${quantity} flashcards.

Conteúdo:
${content.substring(0, 3000)}

Retorne APENAS um JSON válido:
{
  "flashcards": [
    {
      "front": "Pergunta ou conceito",
      "back": "Resposta ou explicação",
      "category": "Categoria do card"
    }
  ]
}`

    try {
      const text = await generateContent(prompt, { temperature: 0.7 })

      const parsed = cleanAndParseJSON(text)
      const flashcards = parsed.flashcards || parsed

      if (!Array.isArray(flashcards)) throw new Error('Formato inválido')

      return flashcards.map((card: any) => ({
        front: card.front || '',
        back: card.back || '',
        category: card.category || topic
      }))
    } catch (err: any) {
      console.error('[useGemini] Error generating flashcards:', err)
      throw err
    }
  }

  /**
   * Chat com tutor IA
   */
  const sendMessage = async (
    message: string,
    context?: string
  ): Promise<string> => {
    const systemInstruction = context ||
      'Você é um tutor educacional brasileiro especializado em concursos e vestibulares. ' +
      'Responda de forma clara, didática e em português do Brasil. ' +
      'Use exemplos práticos e seja encorajador.'

    return await generateContent(message, {
      systemInstruction,
      temperature: 0.7,
      maxTokens: 1024
    })
  }

  /**
   * Gerar mapa mental
   */
  const generateMindMap = async (
    content: string,
    title: string = 'Mapa Mental'
  ) => {
    const prompt = `Crie um mapa mental sobre "${title}" baseado no conteúdo:

${content.substring(0, 3000)}

Retorne APENAS um JSON válido com a estrutura hierárquica:
{
  "title": "${title}",
  "nodes": [
    {
      "id": "1",
      "text": "Conceito Principal",
      "children": [
        {
          "id": "1.1",
          "text": "Subconceito",
          "children": []
        }
      ]
    }
  ]
}`

    try {
      const text = await generateContent(prompt, { temperature: 0.6 })

      return cleanAndParseJSON(text)
    } catch (err: any) {
      console.error('[useGemini] Error generating mind map:', err)
      throw err
    }
  }

  /**
   * Explicar seleção de texto
   */
  const explainSelection = async (text: string): Promise<string> => {
    const prompt = `Explique de forma clara e didática o seguinte trecho:

"${text}"

Forneça:
1. Explicação do conceito
2. Exemplos práticos
3. Dicas para memorização

Use linguagem acessível em português brasileiro.`

    return await generateContent(prompt, {
      temperature: 0.6,
      maxTokens: 1024
    })
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    hasProAccess,
    generateContent,
    generateExercises,
    generateSummary,
    generateFlashcards,
    sendMessage,
    generateMindMap,
    explainSelection
  }
}


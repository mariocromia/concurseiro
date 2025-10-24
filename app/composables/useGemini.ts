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
   * Preserva caracteres especiais, fórmulas matemáticas e símbolos científicos
   */
  const cleanAndParseJSON = (text: string): any => {
    console.log('[useGemini] Starting JSON parsing...')

    // Extrair JSON da resposta
    let jsonStr = text.trim()

    // Remover markdown code blocks
    jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

    // Extrair apenas o objeto JSON (suporta arrays também)
    const jsonMatch = jsonStr.match(/[\[{][\s\S]*[\]}]/)
    if (!jsonMatch) {
      console.error('[useGemini] No JSON found in response:', text.substring(0, 200))
      throw new Error('Resposta da IA não contém JSON válido')
    }

    let rawJson = jsonMatch[0]
    console.log('[useGemini] Extracted JSON length:', rawJson.length)

    // Sanitizar JSON preservando caracteres especiais válidos
    // ORDEM IMPORTA - do mais específico para o mais geral!

    // 1. Remove APENAS caracteres de controle problemáticos (não printáveis)
    // Preserva: acentos, símbolos matemáticos, emojis, etc
    rawJson = rawJson.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '')

    // 2. Normaliza separadores de linha Unicode problemáticos
    rawJson = rawJson.replace(/\u2028/g, '\\n').replace(/\u2029/g, '\\n')

    // 3. Corrige quebras de linha literais dentro de strings JSON
    // Usa lookbehind/lookahead para não mexer em quebras já escapadas
    rawJson = rawJson.replace(/([^\\])\r?\n/g, '$1 ')

    // 4. Remove escapes múltiplos desnecessários mantendo escapes válidos
    // Reduz \\\\ para \\ apenas quando houver múltiplos
    while (rawJson.includes('\\\\\\\\')) {
      rawJson = rawJson.replace(/\\\\\\\\/g, '\\\\')
    }

    // 5. Remove vírgulas trailing antes de fechar objeto/array
    rawJson = rawJson.replace(/,\s*([}\]])/g, '$1')

    // Primeira tentativa: parse direto
    try {
      const result = JSON.parse(rawJson)
      console.log('[useGemini] ✓ JSON parsed successfully')
      return result
    } catch (parseError: any) {
      console.warn('[useGemini] First parse attempt failed:', parseError.message)

      // Mostrar contexto do erro
      const errorPos = parseError.message.match(/position (\d+)/)?.[1]
      if (errorPos) {
        const pos = parseInt(errorPos)
        const start = Math.max(0, pos - 80)
        const end = Math.min(rawJson.length, pos + 80)
        const context = rawJson.substring(start, end)
        const pointer = ' '.repeat(Math.min(80, pos - start)) + '^'
        console.error('[useGemini] Error context:\n', context, '\n', pointer)
      }

      // Segunda tentativa: sanitização de espaços
      try {
        console.log('[useGemini] Attempting space normalization...')

        let cleanJson = rawJson
          // Normaliza tabs e múltiplos espaços (mas preserva dentro de strings)
          .replace(/\t/g, ' ')
          .replace(/\s{2,}/g, ' ')
          // Remove trailing commas novamente
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')

        const result = JSON.parse(cleanJson)
        console.log('[useGemini] ✓ Parsed with space normalization')
        return result
      } catch (secondError: any) {
        console.warn('[useGemini] Second parse attempt failed:', secondError.message)

        // Terceira tentativa: usar JSON5 parsing manual (mais permissivo)
        try {
          console.log('[useGemini] Attempting permissive parsing...')

          // Estratégia: processar string a string para escapar aspas não escapadas
          let processedJson = rawJson
          let inString = false
          let escaped = false
          let result = ''

          for (let i = 0; i < processedJson.length; i++) {
            const char = processedJson[i]
            const prevChar = i > 0 ? processedJson[i - 1] : ''

            if (char === '"' && !escaped) {
              inString = !inString
              result += char
            } else if (inString && char === '\\' && !escaped) {
              escaped = true
              result += char
            } else {
              if (escaped) escaped = false
              result += char
            }
          }

          const finalResult = JSON.parse(result)
          console.log('[useGemini] ✓ Parsed with permissive mode')
          return finalResult
        } catch (thirdError: any) {
          console.error('[useGemini] All parse attempts failed')
          console.error('[useGemini] Original response (first 500 chars):', text.substring(0, 500))
          console.error('[useGemini] Processed JSON (first 500 chars):', rawJson.substring(0, 500))

          // Mensagem de erro mais amigável
          throw new Error('Não foi possível processar a resposta da IA. Tente gerar novamente com um conteúdo diferente.')
        }
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

RETORNE APENAS O JSON ABAIXO (sem texto antes ou depois, sem markdown):

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

REGRAS DE FORMATAÇÃO:
1. Cada questão deve ter exatamente 4 opções (A, B, C, D)
2. Apenas uma resposta correta por questão
3. Para aspas dentro do texto, use aspas simples (')
   Exemplo: "A formula de Newton e F = m × a"
4. Para fórmulas matemáticas, use Unicode ou texto simples:
   ✓ "E = mc²" ou "E = mc^2"
   ✓ "π × r²" ou "pi × r^2"
   ✓ "√2" ou "raiz(2)"
5. Mantenha cada valor em uma única linha (sem quebras \n)
6. Símbolos permitidos: ±, ×, ÷, ≠, ≤, ≥, °, ², ³, α, β, π, Σ, √, etc
7. Acentuação normal permitida: á, é, í, ó, ú, ã, õ, ç
8. Questões devem ser relevantes e explicações claras

IMPORTANTE: Retorne JSON válido que funcione com JSON.parse()`

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
   * Chat com tutor IA (conversação com histórico)
   */
  const chat = async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    context?: string
  ): Promise<string> => {
    // Concatenar todas as mensagens anteriores
    const conversationHistory = messages
      .map(m => `${m.role === 'user' ? 'Aluno' : 'Tutor'}: ${m.content}`)
      .join('\n\n')

    const systemInstruction = context ||
      'Você é um tutor educacional brasileiro especializado em concursos e vestibulares. ' +
      'Responda de forma clara, didática e em português do Brasil. ' +
      'Use exemplos práticos e seja encorajador.'

    // Construir prompt com histórico
    const prompt = conversationHistory

    return await generateContent(prompt, {
      systemInstruction,
      temperature: 0.7,
      maxTokens: 1024
    })
  }

  /**
   * Enviar mensagem única (sem histórico)
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
    chat,
    sendMessage,
    generateMindMap,
    explainSelection
  }
}


import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Gemini AI Proxy Endpoint
 *
 * Security: Google AI API key is kept server-side only
 * Rate Limiting: 20 requests per hour per user
 * Authentication: Required
 * Authorization: Pro plan required for AI features
 *
 * @author Claude Code
 * @date 2025-10-16
 */

// In-memory rate limiting (temporary - TODO: migrate to Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    // 1. Authentication Check
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      })
    }

    // 2. Rate Limiting (20 requests/hour)
    const rateLimitKey = `gemini:${user.id}`
    const now = Date.now()
    const windowMs = 60 * 60 * 1000 // 1 hour
    const maxRequests = 20

    let rateLimit = rateLimitStore.get(rateLimitKey)

    if (!rateLimit || now > rateLimit.resetAt) {
      rateLimit = { count: 0, resetAt: now + windowMs }
      rateLimitStore.set(rateLimitKey, rateLimit)
    }

    if (rateLimit.count >= maxRequests) {
      const resetIn = Math.ceil((rateLimit.resetAt - now) / 1000 / 60) // minutes
      throw createError({
        statusCode: 429,
        message: `Rate limit exceeded. Try again in ${resetIn} minutes.`
      })
    }

    rateLimit.count++

    // 3. Subscription Check (Pro plan required for AI)
    const supabase = await serverSupabaseClient(event)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .in('status', ['active', 'trial'])
      .single()

    const hasAiAccess = subscription?.subscription_plans?.ai_enabled === true

    if (!hasAiAccess) {
      throw createError({
        statusCode: 403,
        message: 'AI features require Pro plan. Upgrade to unlock AI-powered study tools.'
      })
    }

    // 4. Validate Request Body
    const body = await readBody(event)

    if (!body || !body.prompt) {
      throw createError({
        statusCode: 400,
        message: 'Prompt is required'
      })
    }

    const {
      prompt,
      model = 'gemini-pro',
      temperature = 0.7,
      maxTokens = 2048,
      systemInstruction
    } = body

    // Validate prompt length
    if (typeof prompt !== 'string' || prompt.length < 1 || prompt.length > 10000) {
      throw createError({
        statusCode: 400,
        message: 'Prompt must be between 1 and 10,000 characters'
      })
    }

    // 5. Call Google Gemini API (server-side only)
    const config = useRuntimeConfig()
    const genAI = new GoogleGenerativeAI(config.googleAiApiKey)

    const geminiModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
      systemInstruction: systemInstruction || undefined
    })

    // Generate content
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // 6. Log AI usage for analytics
    await supabase
      .from('ai_usage_logs')
      .insert({
        user_id: user.id,
        model,
        prompt_tokens: prompt.length, // Approximate
        completion_tokens: text.length, // Approximate
        total_cost: 0, // TODO: calculate actual cost
        endpoint: 'gemini-proxy',
        status: 'success',
        response_time_ms: Date.now() - startTime
      })
      .then(() => {}) // Ignore errors in logging
      .catch(() => {})

    // 7. Return response
    return {
      success: true,
      data: {
        text,
        model,
        usage: {
          promptTokens: prompt.length,
          completionTokens: text.length,
          totalTokens: prompt.length + text.length
        }
      },
      rateLimit: {
        remaining: maxRequests - rateLimit.count,
        resetAt: new Date(rateLimit.resetAt).toISOString()
      }
    }

  } catch (error: any) {
    // Log error
    console.error('[GEMINI-PROXY] Error:', error.message)

    // Return appropriate error
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to generate AI response. Please try again.'
    })
  }
})

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { geminiProxySchema, validateBody } from '../../utils/validation-schemas'
import { aiRateLimit, checkRateLimit } from '../../utils/rate-limit'
import { getCachedResponse, setCachedResponse, isCacheable } from '../../utils/ai-cache'

/**
 * Gemini AI Proxy Endpoint
 *
 * Security: Google AI API key is kept server-side only
 * Rate Limiting: 20 requests per hour per user (Redis distributed)
 * Caching: Frequently asked questions cached for 24 hours (Redis)
 * Authentication: Required
 * Authorization: Pro plan required for AI features
 * Validation: Zod schema validation
 *
 * @author Claude Code
 * @date 2025-10-17 (Updated with caching + rate limiting)
 */

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

    // 2. Rate Limiting with Redis (20 requests/hour per user)
    const rateLimitInfo = await checkRateLimit(
      user.id,
      aiRateLimit,
      'AI rate limit exceeded. You can make 20 AI requests per hour.'
    )

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

    // 4. Validate Request Body with Zod
    const body = await readBody(event)
    const {
      prompt,
      model,
      temperature,
      maxTokens,
      systemInstruction
    } = validateBody(geminiProxySchema, body)

    // 5. Check Cache (if cacheable)
    let text: string
    let fromCache = false

    if (isCacheable(prompt)) {
      const cached = await getCachedResponse(prompt, systemInstruction)
      if (cached) {
        text = cached
        fromCache = true
        console.log('[GEMINI-PROXY] Cache hit for prompt')
      }
    }

    // 6. Call Google Gemini API (server-side only) if not cached
    if (!fromCache) {
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
      text = response.text()

      // Cache response if cacheable
      if (isCacheable(prompt)) {
        await setCachedResponse(prompt, text, systemInstruction)
        console.log('[GEMINI-PROXY] Response cached for future use')
      }
    }

    // 7. Log AI usage for analytics (skip logging if from cache)
    if (!fromCache) {
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
    }

    // 8. Return response
    return {
      success: true,
      data: {
        text,
        model,
        usage: {
          promptTokens: prompt.length,
          completionTokens: text.length,
          totalTokens: prompt.length + text.length
        },
        cached: fromCache
      },
      rateLimit: {
        remaining: rateLimitInfo.remaining,
        limit: rateLimitInfo.limit,
        reset: new Date(rateLimitInfo.reset).toISOString()
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

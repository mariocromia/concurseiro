import { serverSupabaseClient } from '#supabase/server'
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
  console.log('[GEMINI-PROXY] Request received')

  // Debug: Log headers and cookies
  console.log('[GEMINI-PROXY] Headers:', Object.fromEntries(
    Object.entries(event.headers).filter(([key]) =>
      key.toLowerCase().includes('cookie') ||
      key.toLowerCase().includes('auth') ||
      key.toLowerCase().includes('supabase')
    )
  ))
  console.log('[GEMINI-PROXY] Event context keys:', Object.keys(event.context))

  try {
    // 1. Get Supabase client first
    const supabase = await serverSupabaseClient(event)

    // 2. Authentication Check - Use supabase.auth.getUser() for complete user object
    const { data: authData, error: authError } = await supabase.auth.getUser()

    console.log('[GEMINI-PROXY] Auth response:', {
      hasUser: !!authData?.user,
      hasError: !!authError,
      errorMessage: authError?.message
    })

    if (authError || !authData?.user) {
      console.error('[GEMINI-PROXY] Auth error:', authError)
      throw createError({
        statusCode: 401,
        message: 'Authentication required - no valid session found'
      })
    }

    const user = authData.user
    console.log('[GEMINI-PROXY] User authenticated:', user.id)
    console.log('[GEMINI-PROXY] User object:', { id: user.id, email: user.email })

    // Validate user ID exists
    if (!user.id) {
      console.error('[GEMINI-PROXY] User ID is undefined despite having user object')
      throw createError({
        statusCode: 401,
        message: 'Invalid user session - missing user ID'
      })
    }

    // 2. Rate Limiting with Redis (20 requests/hour per user)
    // checkRateLimit handles null limiter gracefully
    const rateLimitInfo = await checkRateLimit(
      user.id,
      aiRateLimit,
      'AI rate limit exceeded. You can make 20 AI requests per hour.'
    )

    // 3. Subscription Check (Pro plan required for AI)
    console.log('[GEMINI-PROXY] Checking subscription for user:', user.id)

    // Check both users table (subscription_type) and subscriptions table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscription_type, trial_ends_at')
      .eq('id', user.id)
      .single()

    console.log('[GEMINI-PROXY] User data:', { subscription_type: userData?.subscription_type, trial_ends_at: userData?.trial_ends_at })

    // Check active subscription in subscriptions table
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    console.log('[GEMINI-PROXY] Active subscription:', { plan_type: subscription?.plan_type, status: subscription?.status })

    // User has AI access if:
    // 1. Has subscription_type 'pro' in users table, OR
    // 2. Has active 'pro' subscription in subscriptions table, OR
    // 3. Has valid trial (trial_ends_at > now)
    const now = new Date()
    const trialActive = userData?.trial_ends_at && new Date(userData.trial_ends_at) > now

    const hasAiAccess =
      userData?.subscription_type === 'pro' ||
      subscription?.plan_type === 'pro' ||
      trialActive

    console.log('[GEMINI-PROXY] AI Access:', {
      hasAiAccess,
      userSubscriptionType: userData?.subscription_type,
      activeSubscription: subscription?.plan_type,
      trialActive
    })

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

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN && isCacheable(prompt)) {
      try {
        const cached = await getCachedResponse(prompt, systemInstruction)
        if (cached) {
          text = cached
          fromCache = true
          console.log('[GEMINI-PROXY] Cache hit for prompt')
        }
      } catch (error: any) {
        console.warn('[GEMINI-PROXY] Cache check failed, fetching fresh:', error.message)
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
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN && isCacheable(prompt)) {
        try {
          await setCachedResponse(prompt, text, systemInstruction)
          console.log('[GEMINI-PROXY] Response cached for future use')
        } catch (error: any) {
          console.warn('[GEMINI-PROXY] Cache write failed:', error.message)
        }
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
    // Log error with full details
    console.error('[GEMINI-PROXY] Error caught:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack?.split('\n')[0],
      data: error.data
    })

    // Return appropriate error
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }

    throw createError({
      statusCode: 503,
      message: error.message || 'Failed to generate AI response. Please try again.',
      data: { originalError: error.message }
    })
  }
})

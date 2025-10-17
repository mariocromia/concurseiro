/**
 * Rate Limiting Utility with Upstash Redis
 *
 * Provides distributed rate limiting across all server instances
 * Prevents API abuse and ensures fair usage
 *
 * @author Claude Code
 * @date 2025-10-17
 */

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

// ============================================
// RATE LIMITERS
// ============================================

/**
 * Global API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
  analytics: true,
  prefix: 'ratelimit:global'
})

/**
 * AI Features Rate Limiter
 * 20 requests per hour per user
 */
export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'ratelimit:ai'
})

/**
 * Auth Rate Limiter (Login/Register)
 * 5 requests per 15 minutes per IP
 */
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth'
})

/**
 * Webhook Rate Limiter
 * 1000 requests per minute (for payment webhooks)
 */
export const webhookRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true,
  prefix: 'ratelimit:webhook'
})

/**
 * Write Operations Rate Limiter
 * 50 requests per minute per user
 */
export const writeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'),
  analytics: true,
  prefix: 'ratelimit:write'
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check rate limit and throw error if exceeded
 * @param identifier Unique identifier (IP, user ID, etc.)
 * @param limiter Rate limiter instance
 * @param errorMessage Custom error message
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit,
  errorMessage = 'Too many requests. Please try again later.'
) {
  const { success, limit, reset, remaining } = await limiter.limit(identifier)

  if (!success) {
    const resetDate = new Date(reset)
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)

    throw createError({
      statusCode: 429,
      message: errorMessage,
      data: {
        limit,
        remaining: 0,
        reset: resetDate.toISOString(),
        retryAfter
      }
    })
  }

  return { limit, remaining, reset }
}

/**
 * Get rate limit info without incrementing counter
 * @param identifier Unique identifier
 * @param limiter Rate limiter instance
 */
export async function getRateLimitInfo(identifier: string, limiter: Ratelimit) {
  const key = `${limiter.prefix}:${identifier}`

  try {
    const count = await redis.get<number>(key) || 0
    const ttl = await redis.ttl(key)

    return {
      current: count,
      remaining: Math.max(0, limiter.limit - count),
      reset: Date.now() + (ttl * 1000)
    }
  } catch (error) {
    return {
      current: 0,
      remaining: limiter.limit,
      reset: Date.now()
    }
  }
}

/**
 * Reset rate limit for a specific identifier
 * @param identifier Unique identifier
 * @param limiter Rate limiter instance
 */
export async function resetRateLimit(identifier: string, limiter: Ratelimit) {
  const key = `${limiter.prefix}:${identifier}`
  await redis.del(key)
}

// ============================================
// FALLBACK (In-Memory) - if Redis is not configured
// ============================================

const inMemoryStore = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimitInMemory(
  identifier: string,
  maxRequests: number,
  windowMs: number
) {
  const now = Date.now()
  let record = inMemoryStore.get(identifier)

  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs }
    inMemoryStore.set(identifier, record)
  }

  if (record.count >= maxRequests) {
    const resetIn = Math.ceil((record.resetAt - now) / 1000 / 60)
    throw createError({
      statusCode: 429,
      message: `Rate limit exceeded. Try again in ${resetIn} minutes.`
    })
  }

  record.count++
  return {
    remaining: maxRequests - record.count,
    reset: new Date(record.resetAt).toISOString()
  }
}

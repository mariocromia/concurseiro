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

// Initialize Redis client only if configured
let redis: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
    console.log('[RATE-LIMIT] Redis initialized successfully')
  } else {
    console.warn('[RATE-LIMIT] Redis not configured - rate limiting will be disabled')
  }
} catch (error) {
  console.error('[RATE-LIMIT] Failed to initialize Redis:', error)
  redis = null
}

// ============================================
// RATE LIMITERS
// ============================================

// Create a dummy Redis object that always allows requests when Redis is not configured
const dummyRedis = redis || ({} as Redis)

/**
 * Global API Rate Limiter
 * 100 requests per 15 minutes per IP
 * Disabled if Redis not configured
 */
export const globalRateLimit = redis ? new Ratelimit({
  redis: dummyRedis,
  limiter: Ratelimit.slidingWindow(100, '15 m'),
  analytics: true,
  prefix: 'ratelimit:global'
}) : null

/**
 * AI Features Rate Limiter
 * 20 requests per hour per user
 * Disabled if Redis not configured
 */
export const aiRateLimit = redis ? new Ratelimit({
  redis: dummyRedis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'ratelimit:ai'
}) : null

/**
 * Auth Rate Limiter (Login/Register)
 * 5 requests per 15 minutes per IP
 * Disabled if Redis not configured
 */
export const authRateLimit = redis ? new Ratelimit({
  redis: dummyRedis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth'
}) : null

/**
 * Webhook Rate Limiter
 * 1000 requests per minute (for payment webhooks)
 * Disabled if Redis not configured
 */
export const webhookRateLimit = redis ? new Ratelimit({
  redis: dummyRedis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true,
  prefix: 'ratelimit:webhook'
}) : null

/**
 * Write Operations Rate Limiter
 * 50 requests per minute per user
 * Disabled if Redis not configured
 */
export const writeRateLimit = redis ? new Ratelimit({
  redis: dummyRedis,
  limiter: Ratelimit.slidingWindow(50, '1 m'),
  analytics: true,
  prefix: 'ratelimit:write'
}) : null

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
  limiter: Ratelimit | null,
  errorMessage = 'Too many requests. Please try again later.'
) {
  // If limiter is null (Redis not configured), always allow
  if (!limiter) {
    return { limit: 999999, remaining: 999999, reset: Date.now() + 3600000 }
  }

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

/**
 * AI Response Caching Utility
 *
 * Implements caching for Gemini AI responses using Redis
 * Reduces API calls and costs for frequently asked questions
 *
 * @author Claude Code
 * @date 2025-10-17
 */

import { Redis } from '@upstash/redis'

// Initialize Redis client
let redis: Redis | null = null

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken
    })
  }
} catch (error) {
  console.error('Failed to initialize AI cache Redis:', error)
}

/**
 * Generate cache key from prompt and context
 */
function generateCacheKey(prompt: string, context?: string): string {
  // Create a consistent hash of the prompt + context
  const content = `${prompt}${context || ''}`

  // Simple hash function (in production, use crypto.createHash)
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return `ai:cache:${Math.abs(hash).toString(36)}`
}

/**
 * Get cached AI response
 */
export async function getCachedResponse(
  prompt: string,
  context?: string
): Promise<string | null> {
  if (!redis) return null

  try {
    const key = generateCacheKey(prompt, context)
    const cached = await redis.get(key)

    if (cached && typeof cached === 'string') {
      return cached
    }

    return null
  } catch (error) {
    console.error('Error getting cached response:', error)
    return null
  }
}

/**
 * Cache AI response
 */
export async function setCachedResponse(
  prompt: string,
  response: string,
  context?: string,
  ttlSeconds: number = 86400 // 24 hours default
): Promise<boolean> {
  if (!redis) return false

  try {
    const key = generateCacheKey(prompt, context)
    await redis.setex(key, ttlSeconds, response)
    return true
  } catch (error) {
    console.error('Error caching response:', error)
    return false
  }
}

/**
 * Check if prompt is cacheable
 *
 * Don't cache:
 * - Very short prompts (< 10 chars)
 * - Prompts with current date/time references
 * - Prompts asking for user-specific data
 */
export function isCacheable(prompt: string): boolean {
  if (prompt.length < 10) return false

  const nonCacheablePatterns = [
    /hoje|agora|atual|recente/i,  // Date/time references
    /meu|minha|eu|me/i,           // User-specific
    /criar|gerar|novo/i           // Generative (should be unique)
  ]

  for (const pattern of nonCacheablePatterns) {
    if (pattern.test(prompt)) {
      return false
    }
  }

  return true
}

/**
 * Invalidate cache for a specific prompt
 */
export async function invalidateCachedResponse(
  prompt: string,
  context?: string
): Promise<boolean> {
  if (!redis) return false

  try {
    const key = generateCacheKey(prompt, context)
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Error invalidating cache:', error)
    return false
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalKeys: number
  memoryUsage?: string
} | null> {
  if (!redis) return null

  try {
    // Count keys matching ai:cache:* pattern
    const keys = await redis.keys('ai:cache:*')

    return {
      totalKeys: keys.length
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return null
  }
}

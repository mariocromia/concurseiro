/**
 * Global Rate Limiting Middleware
 *
 * Applies rate limits to all API routes based on IP address
 * Prevents DDoS attacks and API abuse
 *
 * @author Claude Code
 * @date 2025-10-17
 */

import { globalRateLimit, checkRateLimit } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Skip rate limiting for certain paths
  const skipPaths = [
    '/api/_nuxt',
    '/api/health',
    '/_nuxt/',
    '/favicon.ico'
  ]

  if (skipPaths.some(path => url.pathname.startsWith(path))) {
    return
  }

  // Only apply to API routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  // Get client IP address
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] :
             getRequestHeader(event, 'x-real-ip') ||
             '127.0.0.1'

  // Apply global rate limit (100 req per 15 min per IP)
  try {
    await checkRateLimit(
      ip,
      globalRateLimit,
      'Too many requests from your IP. Please try again later.'
    )
  } catch (error) {
    // Rate limit exceeded
    throw error
  }
})

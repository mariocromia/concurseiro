/**
 * Webhook Security Utilities
 *
 * HMAC signature validation for Asaas webhooks
 * IP whitelist validation
 * Request logging for security audit
 *
 * @author Claude Code
 * @date 2025-10-17
 */

import { createHmac } from 'crypto'

// ============================================
// ASAAS WEBHOOK SIGNATURE VALIDATION
// ============================================

/**
 * Verify Asaas webhook signature using HMAC-SHA256
 *
 * Asaas sends signature in header: X-Asaas-Signature
 * Format: t=timestamp,v1=signature
 *
 * @param payload Webhook payload (raw body)
 * @param signature Signature from header
 * @param secret Webhook secret from Asaas dashboard
 * @returns true if signature is valid
 */
export function verifyAsaasWebhookSignature(
  payload: string | object,
  signature: string | null | undefined,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn('[WEBHOOK-SECURITY] Missing signature or secret')
    return false
  }

  try {
    // Convert payload to string if object
    const payloadString = typeof payload === 'string'
      ? payload
      : JSON.stringify(payload)

    // Parse signature format: t=1234567890,v1=abc123...
    const parts = signature.split(',')
    let timestamp: string | null = null
    let receivedSignature: string | null = null

    for (const part of parts) {
      const [key, value] = part.split('=')
      if (key === 't') timestamp = value
      if (key === 'v1') receivedSignature = value
    }

    if (!timestamp || !receivedSignature) {
      console.warn('[WEBHOOK-SECURITY] Invalid signature format')
      return false
    }

    // Check timestamp (prevent replay attacks - max 5 minutes old)
    const now = Math.floor(Date.now() / 1000)
    const webhookTime = parseInt(timestamp, 10)
    const maxAge = 5 * 60 // 5 minutes

    if (now - webhookTime > maxAge) {
      console.warn('[WEBHOOK-SECURITY] Webhook too old:', now - webhookTime, 'seconds')
      return false
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payloadString}`
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex')

    // Compare signatures (constant-time comparison to prevent timing attacks)
    const isValid = timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )

    if (!isValid) {
      console.warn('[WEBHOOK-SECURITY] Invalid signature')
    }

    return isValid

  } catch (error) {
    console.error('[WEBHOOK-SECURITY] Error verifying signature:', error)
    return false
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}

// ============================================
// IP WHITELIST VALIDATION
// ============================================

/**
 * Asaas webhook IP ranges
 * Source: https://docs.asaas.com/reference/webhooks
 *
 * Updated: 2025-10-17
 */
const ASAAS_IP_WHITELIST = [
  '18.231.194.64/27',      // AWS São Paulo
  '52.67.73.224/27',       // AWS São Paulo backup
  '177.72.243.0/27',       // Asaas primary
  '177.72.246.128/27',     // Asaas secondary
]

/**
 * Check if IP is in Asaas whitelist
 * @param ip IP address to check
 * @returns true if IP is whitelisted
 */
export function isAsaasWhitelistedIP(ip: string): boolean {
  // Skip validation in development
  if (process.env.NODE_ENV === 'development' || process.env.SKIP_WEBHOOK_IP_CHECK === 'true') {
    return true
  }

  for (const range of ASAAS_IP_WHITELIST) {
    if (ipInRange(ip, range)) {
      return true
    }
  }

  console.warn('[WEBHOOK-SECURITY] IP not whitelisted:', ip)
  return false
}

/**
 * Check if IP is in CIDR range
 * @param ip IP to check
 * @param cidr CIDR range (e.g., "192.168.1.0/24")
 */
function ipInRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/')
  const mask = ~(2 ** (32 - parseInt(bits)) - 1)

  return (ipToInt(ip) & mask) === (ipToInt(range) & mask)
}

/**
 * Convert IP string to 32-bit integer
 */
function ipToInt(ip: string): number {
  return ip.split('.').reduce((int, octet) => {
    return (int << 8) + parseInt(octet, 10)
  }, 0) >>> 0
}

// ============================================
// SECURITY LOGGING
// ============================================

/**
 * Log webhook security event
 * @param event Event type
 * @param details Event details
 */
export function logWebhookSecurityEvent(
  event: 'signature_valid' | 'signature_invalid' | 'ip_blocked' | 'ip_allowed' | 'replay_attack',
  details: Record<string, any>
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event,
    ...details
  }

  // Log to console (in production, send to monitoring service)
  console.log('[WEBHOOK-SECURITY]', JSON.stringify(logEntry))

  // TODO: In production, send to:
  // - Supabase logging table
  // - Sentry for error tracking
  // - CloudWatch/Datadog for monitoring
}

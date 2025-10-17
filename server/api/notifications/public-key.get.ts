/**
 * Get VAPID public key for push notifications
 *
 * @author Claude Code
 * @date 2025-10-17
 */

export default defineEventHandler(async (event) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY

  if (!publicKey) {
    throw createError({
      statusCode: 500,
      message: 'Push notifications not configured'
    })
  }

  return {
    publicKey
  }
})

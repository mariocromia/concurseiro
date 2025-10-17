/**
 * Push Notifications Utility
 *
 * Web Push notifications for study reminders
 * Uses VAPID protocol (no external service needed)
 *
 * @author Claude Code
 * @date 2025-10-17
 */

import webpush from 'web-push'

// Initialize web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:noreply@prapassar.com'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidEmail,
    vapidPublicKey,
    vapidPrivateKey
  )
}

// ============================================
// TYPES
// ============================================

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
  }>
}

// ============================================
// SEND NOTIFICATION
// ============================================

/**
 * Send push notification to a subscriber
 * @param subscription Push subscription object
 * @param payload Notification content
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('[PUSH] VAPID keys not configured, skipping notification')
    return false
  }

  try {
    const payloadString = JSON.stringify(payload)

    await webpush.sendNotification(subscription, payloadString)

    console.log('[PUSH] Notification sent:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      title: payload.title
    })

    return true
  } catch (error: any) {
    // Handle expired subscriptions
    if (error.statusCode === 410) {
      console.warn('[PUSH] Subscription expired:', subscription.endpoint)
      return false
    }

    console.error('[PUSH] Error sending notification:', error.message)
    return false
  }
}

/**
 * Send notification to multiple subscribers
 * @param subscriptions Array of push subscriptions
 * @param payload Notification content
 */
export async function sendBulkPushNotifications(
  subscriptions: PushSubscription[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number; expired: number }> {
  const results = {
    sent: 0,
    failed: 0,
    expired: 0
  }

  const promises = subscriptions.map(async (subscription) => {
    try {
      const success = await sendPushNotification(subscription, payload)
      if (success) {
        results.sent++
      } else {
        results.expired++
      }
    } catch (error) {
      results.failed++
    }
  })

  await Promise.all(promises)

  console.log('[PUSH] Bulk send complete:', results)

  return results
}

// ============================================
// NOTIFICATION TEMPLATES
// ============================================

/**
 * Create revision reminder notification
 * @param revisionName Revision name (R1, R2, etc.)
 * @param subjectName Subject name
 */
export function createRevisionNotification(
  revisionName: string,
  subjectName: string
): NotificationPayload {
  return {
    title: `⏰ Hora da revisão ${revisionName}!`,
    body: `Não esqueça de revisar: ${subjectName}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: `revision-${revisionName}`,
    data: {
      type: 'revision',
      revisionName,
      subjectName,
      url: '/revisions'
    },
    actions: [
      { action: 'open', title: 'Ver Revisões' },
      { action: 'dismiss', title: 'Depois' }
    ]
  }
}

/**
 * Create study reminder notification
 * @param title Study session title
 */
export function createStudyReminderNotification(
  title: string
): NotificationPayload {
  return {
    title: '📚 Lembrete de Estudo',
    body: title,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'study-reminder',
    data: {
      type: 'study-reminder',
      url: '/study'
    },
    actions: [
      { action: 'open', title: 'Começar' },
      { action: 'snooze', title: 'Adiar 30min' }
    ]
  }
}

/**
 * Create goal achievement notification
 * @param goalName Goal name
 * @param progress Progress percentage
 */
export function createGoalNotification(
  goalName: string,
  progress: number
): NotificationPayload {
  return {
    title: '🎯 Meta Alcançada!',
    body: `Você atingiu ${progress}% da meta: ${goalName}`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'goal-achievement',
    data: {
      type: 'goal',
      goalName,
      progress,
      url: '/metas'
    },
    actions: [
      { action: 'open', title: 'Ver Metas' }
    ]
  }
}

/**
 * Create streak notification
 * @param days Number of consecutive days
 */
export function createStreakNotification(days: number): NotificationPayload {
  return {
    title: '🔥 Sequência Mantida!',
    body: `Parabéns! ${days} dias consecutivos de estudo`,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'streak',
    data: {
      type: 'streak',
      days,
      url: '/dashboard'
    }
  }
}

// ============================================
// VAPID KEY GENERATION (for setup)
// ============================================

/**
 * Generate VAPID keys (run once during setup)
 * Usage: Add this to a setup script
 */
export function generateVapidKeys() {
  const keys = webpush.generateVAPIDKeys()
  return {
    publicKey: keys.publicKey,
    privateKey: keys.privateKey
  }
}

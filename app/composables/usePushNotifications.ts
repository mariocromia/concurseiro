/**
 * Push Notifications Composable
 *
 * Manages Web Push notifications on the client side
 *
 * @author Claude Code
 * @date 2025-10-17
 */

export const usePushNotifications = () => {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const permission = ref<NotificationPermission>('default')

  // Check if push notifications are supported
  onMounted(() => {
    isSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
    permission.value = Notification.permission
  })

  /**
   * Request notification permission
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      console.warn('[PUSH] Push notifications not supported')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      permission.value = result

      if (result === 'granted') {
        console.log('[PUSH] Permission granted')
        return true
      } else {
        console.warn('[PUSH] Permission denied')
        return false
      }
    } catch (error) {
      console.error('[PUSH] Error requesting permission:', error)
      return false
    }
  }

  /**
   * Subscribe to push notifications
   */
  const subscribe = async (): Promise<boolean> => {
    if (!isSupported.value) return false

    try {
      // Request permission first
      if (permission.value !== 'granted') {
        const granted = await requestPermission()
        if (!granted) return false
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Get VAPID public key from server
      const { publicKey } = await $fetch('/api/notifications/public-key')

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      // Send subscription to server
      await $fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: {
          subscription: subscription.toJSON()
        }
      })

      isSubscribed.value = true
      console.log('[PUSH] Subscribed successfully')
      return true

    } catch (error) {
      console.error('[PUSH] Error subscribing:', error)
      return false
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported.value) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        console.warn('[PUSH] No active subscription')
        return false
      }

      // Unsubscribe from browser
      await subscription.unsubscribe()

      // Remove from server
      await $fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        body: {
          endpoint: subscription.endpoint
        }
      })

      isSubscribed.value = false
      console.log('[PUSH] Unsubscribed successfully')
      return true

    } catch (error) {
      console.error('[PUSH] Error unsubscribing:', error)
      return false
    }
  }

  /**
   * Check if user is subscribed
   */
  const checkSubscription = async (): Promise<boolean> => {
    if (!isSupported.value) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      isSubscribed.value = !!subscription
      return isSubscribed.value

    } catch (error) {
      console.error('[PUSH] Error checking subscription:', error)
      return false
    }
  }

  /**
   * Show a test notification (for testing)
   */
  const showTestNotification = () => {
    if (permission.value !== 'granted') {
      console.warn('[PUSH] Permission not granted')
      return
    }

    new Notification('🎉 Notificações Ativadas!', {
      body: 'Você receberá lembretes de revisão e estudo',
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    })
  }

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    checkSubscription,
    showTestNotification
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

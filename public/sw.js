/**
 * Service Worker for Push Notifications
 *
 * Handles push events and notification clicks
 *
 * @author Claude Code
 * @date 2025-10-17
 */

// Service Worker version (increment to force update)
const SW_VERSION = '1.0.0'

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker version', SW_VERSION, 'installed')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker version', SW_VERSION, 'activated')
  event.waitUntil(self.clients.claim())
})

// Push event - receive push notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push received')

  if (!event.data) {
    console.warn('[SW] Push event has no data')
    return
  }

  try {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/badge-72.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: [200, 100, 200],
      requireInteraction: false
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )

  } catch (error) {
    console.error('[SW] Error handling push:', error)
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)

  event.notification.close()

  const notificationData = event.notification.data

  // Handle different actions
  if (event.action === 'dismiss') {
    // Just close notification
    return
  }

  if (event.action === 'snooze') {
    // Snooze for 30 minutes
    console.log('[SW] Snoozing notification')
    // Could send request to server to re-schedule
    return
  }

  // Default action: open app
  const urlToOpen = notificationData.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }

        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag)

  // Could track analytics here
  const notificationData = event.notification.data

  if (notificationData && notificationData.type) {
    // Send analytics event
    console.log('[SW] Notification closed without interaction:', notificationData.type)
  }
})

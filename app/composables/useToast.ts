/**
 * Toast Notification Composable
 *
 * Global toast notification system with auto-dismiss and animations
 *
 * @author Claude Code
 * @date 2025-10-17
 */

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

export const useToast = () => {
  /**
   * Show toast notification
   */
  const show = (
    type: Toast['type'],
    message: string,
    duration: number = 5000
  ) => {
    const id = `toast-${++toastIdCounter}`

    const toast: Toast = {
      id,
      type,
      message,
      duration
    }

    toasts.value.push(toast)

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }

  /**
   * Helper methods for specific toast types
   */
  const success = (message: string, duration?: number) =>
    show('success', message, duration)

  const error = (message: string, duration?: number) =>
    show('error', message, duration)

  const warning = (message: string, duration?: number) =>
    show('warning', message, duration)

  const info = (message: string, duration?: number) =>
    show('info', message, duration)

  /**
   * Dismiss specific toast
   */
  const dismiss = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Clear all toasts
   */
  const clearAll = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    clearAll
  }
}

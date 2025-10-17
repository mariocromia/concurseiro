<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform translate-x-full opacity-0"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto"
        >
          <div
            class="flex items-start gap-3 p-4 rounded-lg shadow-2xl backdrop-blur-sm border max-w-sm"
            :class="toastClasses(toast.type)"
          >
            <!-- Icon -->
            <div class="flex-shrink-0">
              <svg
                v-if="toast.type === 'success'"
                class="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else-if="toast.type === 'error'"
                class="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else-if="toast.type === 'warning'"
                class="w-6 h-6 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg
                v-else
                class="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <!-- Message -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white leading-relaxed">
                {{ toast.message }}
              </p>
            </div>

            <!-- Close Button -->
            <button
              @click="dismiss(toast.id)"
              class="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Toast Container Component
 *
 * Displays toast notifications in the top-right corner
 * Auto-dismisses after specified duration
 *
 * @author Claude Code
 * @date 2025-10-17
 */

import type { Toast } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

const toastClasses = (type: Toast['type']) => {
  const baseClasses = 'bg-dark-800/95 border-2'

  switch (type) {
    case 'success':
      return `${baseClasses} border-green-500/50`
    case 'error':
      return `${baseClasses} border-red-500/50`
    case 'warning':
      return `${baseClasses} border-yellow-500/50`
    case 'info':
      return `${baseClasses} border-blue-500/50`
    default:
      return `${baseClasses} border-gray-500/50`
  }
}
</script>

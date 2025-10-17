/**
 * Universal Loading State Composable
 *
 * Provides consistent loading state management across the application
 * with automatic error handling and timeout
 *
 * @author Claude Code
 * @date 2025-10-17
 */

export interface LoadingState {
  isLoading: boolean
  error: string | null
  success: boolean
}

export const useLoading = () => {
  const state = reactive<LoadingState>({
    isLoading: false,
    error: null,
    success: false
  })

  /**
   * Execute async operation with loading state management
   */
  const withLoading = async <T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string
      errorMessage?: string
      timeout?: number
    }
  ): Promise<T | null> => {
    state.isLoading = true
    state.error = null
    state.success = false

    try {
      // Set timeout if specified
      const timeoutMs = options?.timeout || 30000 // 30 seconds default
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )

      // Race between operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]) as T

      state.success = true
      return result

    } catch (error: any) {
      state.error = options?.errorMessage || error.message || 'An error occurred'
      console.error('Loading operation failed:', error)
      return null

    } finally {
      state.isLoading = false
    }
  }

  /**
   * Reset state
   */
  const reset = () => {
    state.isLoading = false
    state.error = null
    state.success = false
  }

  /**
   * Set error manually
   */
  const setError = (message: string) => {
    state.error = message
    state.isLoading = false
  }

  /**
   * Set success manually
   */
  const setSuccess = () => {
    state.success = true
    state.error = null
    state.isLoading = false
  }

  return {
    ...toRefs(state),
    withLoading,
    reset,
    setError,
    setSuccess
  }
}

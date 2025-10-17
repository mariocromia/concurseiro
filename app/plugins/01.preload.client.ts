/**
 * App Preload Plugin
 * Manages loading state during app initialization
 *
 * Priority: 01 (runs after theme init)
 */

export default defineNuxtPlugin({
  name: 'app-preload',
  enforce: 'pre',

  async setup(nuxtApp) {
    if (!process.client) return

    // Create loading state
    const isAppReady = useState('app-ready', () => false)
    const loadingStage = useState<'init' | 'auth' | 'theme' | 'ready'>('loading-stage', () => 'init')

    // Hide content initially
    document.body.style.visibility = 'hidden'

    try {
      // Stage 1: Theme already initialized by 00.init-theme.client.ts
      loadingStage.value = 'theme'
      await new Promise(resolve => setTimeout(resolve, 100))

      // Stage 2: Wait for auth to be ready
      loadingStage.value = 'auth'
      const client = useSupabaseClient()

      // Get session synchronously if available
      const { data: { session } } = await client.auth.getSession()

      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 100))

      // Stage 3: Ready
      loadingStage.value = 'ready'
      await new Promise(resolve => setTimeout(resolve, 150))

      // Show content
      document.body.style.visibility = 'visible'
      isAppReady.value = true

      console.log('✅ App preload complete, session:', session?.user?.email || 'no session')

    } catch (error) {
      console.error('❌ Preload error:', error)
      // Show content anyway to prevent infinite loading
      document.body.style.visibility = 'visible'
      isAppReady.value = true
    }

    return {
      provide: {
        appReady: isAppReady,
        loadingStage
      }
    }
  }
})

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
      await new Promise(resolve => setTimeout(resolve, 50))

      // Stage 2: Wait for auth to be ready (with timeout)
      loadingStage.value = 'auth'

      // Timeout para evitar travamento infinito
      const authTimeout = new Promise<void>((resolve) => setTimeout(() => {
        console.warn('⚠️ Auth timeout - continuing anyway')
        resolve()
      }, 2000))

      const authCheck = (async () => {
        try {
          const client = useSupabaseClient()
          const { data: { session } } = await client.auth.getSession()
          console.log('✅ Session loaded:', session?.user?.email || 'no session')
        } catch (err) {
          console.warn('⚠️ Auth check error:', err)
        }
      })()

      // Espera auth check OU timeout (o que vier primeiro)
      await Promise.race([authCheck, authTimeout])

      // Stage 3: Ready
      loadingStage.value = 'ready'
      await new Promise(resolve => setTimeout(resolve, 100))

      // Show content
      document.body.style.visibility = 'visible'
      isAppReady.value = true

      console.log('✅ App preload complete')

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

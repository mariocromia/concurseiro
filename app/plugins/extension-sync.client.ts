// Plugin para sincronizar autenticação com a extensão Chrome
export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  // Executar apenas no cliente
  if (process.client) {
    console.log('🔌 Plugin de sincronização com extensão carregado')

    // Enviar sessão atual para extensão ao carregar o app (com delay para garantir que content script carregou)
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        console.log('📤 Enviando sessão para extensão...')
        window.postMessage({
          source: 'concurseiro-app',
          type: 'AUTH_SESSION',
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token
          }
        }, '*')
        console.log('✅ Sessão enviada para extensão')
      } else {
        console.log('ℹ️ Nenhuma sessão ativa para enviar à extensão')
      }
    }, 1000)

    // Receber sessão da extensão (quando usuário faz login na extensão)
    window.addEventListener('message', async (event) => {
      // Log todas as mensagens para debug
      if (event.data?.source) {
        console.log('📬 Mensagem recebida:', event.data)
      }

      if (event.data?.source === 'concurseiro-extension' && event.data?.type === 'AUTH_SESSION_FROM_EXTENSION') {
        console.log('📨 Sessão recebida da extensão')

        try {
          const { access_token, refresh_token } = event.data.session

          // Autenticar no app
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })

          if (error) throw error

          console.log('✅ Autenticado no app via extensão')

          // Redirecionar para dashboard se estiver na página de login
          if (router.currentRoute.value.path === '/login') {
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('❌ Erro ao autenticar via extensão:', error)
        }
      }
    })
  }
})

/**
 * Middleware de Verificação de Admin
 *
 * Protege rotas administrativas verificando se o usuário é admin
 * Admin: mariocromia@gmail.com
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()

  // Lista de emails autorizados como admin
  const ADMIN_EMAILS = ['mariocromia@gmail.com']

  // Se não há usuário autenticado, redireciona para login
  if (!user.value) {
    console.warn('[admin middleware] Usuário não autenticado, redirecionando para /login')
    return navigateTo('/login')
  }

  // Verifica se o email do usuário está na lista de admins
  const isAdmin = ADMIN_EMAILS.includes(user.value.email?.toLowerCase() || '')

  if (!isAdmin) {
    console.warn('[admin middleware] Acesso negado para:', user.value.email)
    console.warn('[admin middleware] Apenas admins podem acessar:', to.path)

    // Redireciona para dashboard com mensagem de erro
    return navigateTo({
      path: '/dashboard',
      query: { error: 'access_denied' }
    })
  }

  console.log('[admin middleware] ✅ Acesso admin autorizado:', user.value.email)
})

/**
 * Composable para verificação de permissões administrativas
 *
 * Centraliza a lógica de verificação de admin
 */

export const useAdmin = () => {
  const user = useSupabaseUser()

  // Lista de emails autorizados como admin
  const ADMIN_EMAILS = ['mariocromia@gmail.com']

  /**
   * Verifica se o usuário atual é admin
   */
  const isAdmin = computed(() => {
    if (!user.value || !user.value.email) return false
    return ADMIN_EMAILS.includes(user.value.email.toLowerCase())
  })

  /**
   * Email do admin atual
   */
  const adminEmail = computed(() => {
    if (!isAdmin.value) return null
    return user.value?.email || null
  })

  /**
   * Redireciona para dashboard se não for admin
   */
  const requireAdmin = () => {
    if (!isAdmin.value) {
      console.warn('[useAdmin] Acesso negado para:', user.value?.email)
      navigateTo({
        path: '/dashboard',
        query: { error: 'access_denied' }
      })
      return false
    }
    return true
  }

  return {
    isAdmin: readonly(isAdmin),
    adminEmail: readonly(adminEmail),
    requireAdmin
  }
}

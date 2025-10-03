export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  console.log('🔐 Auth Middleware - De:', from.path, '→ Para:', to.path)
  console.log('🔐 Usuário:', user.value?.email || 'NÃO AUTENTICADO')

  // Se não estiver logado e tentar acessar rota protegida
  if (!user.value && to.path !== '/login' && to.path !== '/register' && to.path !== '/' && to.path !== '/confirm') {
    console.log('❌ Acesso negado - redirecionando para /login')
    return navigateTo('/login')
  }

  // Se estiver logado e tentar acessar login/register
  if (user.value && (to.path === '/login' || to.path === '/register')) {
    console.log('✅ Já autenticado - redirecionando para /dashboard')
    return navigateTo('/dashboard')
  }

  console.log('✅ Acesso permitido a:', to.path)
})

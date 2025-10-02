export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Se não estiver logado e tentar acessar rota protegida
  if (!user.value && to.path !== '/login' && to.path !== '/register' && to.path !== '/' && to.path !== '/confirm') {
    return navigateTo('/login')
  }

  // Se estiver logado e tentar acessar login/register
  if (user.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})

export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/confirm', '/forgot-password', '/precos', '/checkout']
  const isPublicRoute = publicRoutes.includes(to.path)

  // Auth routes that should redirect if already logged in
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(to.path)

  // Quick check: if going to public route and not an auth route, allow immediately
  if (isPublicRoute && !isAuthRoute) {
    return
  }

  // If not logged in and trying to access protected route
  if (!user.value && !isPublicRoute) {
    return navigateTo('/login')
  }

  // If logged in and trying to access auth routes
  if (user.value && isAuthRoute) {
    return navigateTo('/dashboard')
  }
})

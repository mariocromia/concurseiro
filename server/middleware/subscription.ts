import { serverSupabaseClient } from '#supabase/server'

// Middleware para verificar assinatura ativa
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Rotas públicas que não precisam de assinatura
  const publicRoutes = [
    '/api/auth',
    '/api/subscriptions/plans',
    '/api/subscriptions/create',
    '/api/webhooks',
    '/_nuxt',
    '/login',
    '/register',
    '/forgot-password',
    '/confirm',
    '/precos',
    '/checkout'
  ]

  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

  if (isPublicRoute || !url.pathname.startsWith('/api/')) {
    return
  }

  const user = event.context.user

  if (!user) {
    return
  }

  // Verificar se tem assinatura ativa
  const supabase = await serverSupabaseClient(event)

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plan:subscription_plans(*)')
    .eq('user_id', user.id)
    .in('status', ['active', 'trial'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Adicionar informações da assinatura ao contexto
  event.context.subscription = subscription
  event.context.hasActiveSubscription = !!subscription
  event.context.hasAiAccess = subscription?.plan?.ai_enabled || false
})

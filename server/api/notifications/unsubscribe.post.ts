/**
 * Unsubscribe from push notifications
 *
 * @author Claude Code
 * @date 2025-10-17
 */

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  const body = await readBody(event)
  const { endpoint } = body

  if (!endpoint) {
    throw createError({
      statusCode: 400,
      message: 'Endpoint is required'
    })
  }

  try {
    const supabase = await serverSupabaseClient(event)

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint)

    if (error) throw error

    return { success: true, message: 'Unsubscribed successfully' }

  } catch (error: any) {
    console.error('[PUSH-UNSUBSCRIBE] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to unsubscribe'
    })
  }
})

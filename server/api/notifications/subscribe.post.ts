/**
 * Subscribe to push notifications
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
  const { subscription } = body

  if (!subscription || !subscription.endpoint) {
    throw createError({
      statusCode: 400,
      message: 'Invalid subscription object'
    })
  }

  try {
    const supabase = await serverSupabaseClient(event)

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint)
      .single()

    if (existing) {
      // Update existing subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          subscription_data: subscription,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) throw error

      return { success: true, message: 'Subscription updated' }
    }

    // Create new subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        subscription_data: subscription
      })

    if (error) throw error

    return { success: true, message: 'Subscribed successfully' }

  } catch (error: any) {
    console.error('[PUSH-SUBSCRIBE] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to subscribe'
    })
  }
})

/**
 * Test Pro Plan Detection
 *
 * This test validates that the Pro plan detection logic works correctly
 *
 * Usage: node test/test-pro-plan-detection.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
const envPath = join(__dirname, '..', '.env')
let supabaseUrl = ''
let supabaseKey = ''

try {
  const envFile = readFileSync(envPath, 'utf-8')
  const urlMatch = envFile.match(/SUPABASE_URL=(.+)/)
  const keyMatch = envFile.match(/SUPABASE_KEY=(.+)/)

  if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1].trim()
  if (keyMatch && keyMatch[1]) supabaseKey = keyMatch[1].trim()
} catch (error) {
  console.error('❌ Error reading .env file:', error.message)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const testEmail = 'netsacolas@gmail.com'

async function testProPlanDetection() {
  console.log('🧪 Testing Pro Plan Detection')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // Get user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, subscription_type, trial_ends_at')
    .eq('email', testEmail)
    .single()

  if (userError || !user) {
    console.error('❌ FAIL: User not found')
    process.exit(1)
  }

  console.log(`📧 Testing user: ${user.email}`)
  console.log(`   User ID: ${user.id}`)
  console.log('')

  // Simulate the logic from gemini-proxy.post.ts
  console.log('🔍 Step 1: Check users table')
  const { data: userData } = await supabase
    .from('users')
    .select('subscription_type, trial_ends_at')
    .eq('id', user.id)
    .single()

  console.log(`   subscription_type: ${userData?.subscription_type}`)
  console.log(`   trial_ends_at: ${userData?.trial_ends_at}`)

  // Check active subscription
  console.log('')
  console.log('🔍 Step 2: Check subscriptions table')
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, current_period_end')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  console.log(`   Active subscription: ${subscription ? 'Yes' : 'No'}`)
  if (subscription) {
    console.log(`   plan_type: ${subscription.plan_type}`)
    console.log(`   status: ${subscription.status}`)
  }

  // Calculate AI access (same logic as server)
  console.log('')
  console.log('🔍 Step 3: Calculate AI access')
  const now = new Date()
  const trialActive = userData?.trial_ends_at && new Date(userData.trial_ends_at) > now

  const hasAiAccess =
    userData?.subscription_type === 'pro' ||
    subscription?.plan_type === 'pro' ||
    trialActive

  console.log(`   subscription_type === 'pro': ${userData?.subscription_type === 'pro'}`)
  console.log(`   subscription.plan_type === 'pro': ${subscription?.plan_type === 'pro'}`)
  console.log(`   trial active: ${trialActive}`)
  console.log('')

  // Result
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (hasAiAccess) {
    console.log('✅ PASS: User HAS AI access')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('🎉 SUCCESS! Pro plan detection is working correctly')
    console.log('')
    console.log('📋 Summary:')
    console.log(`   ✅ User: ${user.email}`)
    console.log(`   ✅ Subscription Type: ${userData?.subscription_type}`)
    console.log(`   ✅ AI Access: GRANTED`)
    console.log('')
  } else {
    console.log('❌ FAIL: User DOES NOT have AI access')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('⚠️  User should have AI access but detection failed!')
    console.log('')
    process.exit(1)
  }
}

testProPlanDetection()

/**
 * Set User to Pro Plan
 *
 * This script sets a user to Pro plan by updating the users table
 * and creating an active subscription
 *
 * Usage: node scripts/set-user-pro-plan.mjs <email>
 * Example: node scripts/set-user-pro-plan.mjs netsacolas@gmail.com
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

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_KEY not found in .env file')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error.message)
  process.exit(1)
}

// Get email from command line
const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: node scripts/set-user-pro-plan.mjs <email>')
  console.error('   Example: node scripts/set-user-pro-plan.mjs netsacolas@gmail.com')
  process.exit(1)
}

console.log('🔧 Setting user to Pro plan...')
console.log(`📧 Email: ${email}`)
console.log('')

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function setUserProPlan() {
  try {
    // 1. Find user by email
    console.log('🔍 Finding user...')
    const { data: user, error: userFindError } = await supabase
      .from('users')
      .select('id, email, subscription_type')
      .eq('email', email)
      .single()

    if (userFindError || !user) {
      console.error('❌ User not found:', userFindError?.message || 'No user with this email')
      process.exit(1)
    }

    console.log('✅ User found:', user.id)
    console.log(`   Current subscription_type: ${user.subscription_type}`)
    console.log('')

    // 2. Update users table to 'pro'
    console.log('📝 Updating users table to Pro...')
    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_type: 'pro',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('❌ Error updating users table:', updateError.message)
      process.exit(1)
    }

    console.log('✅ Users table updated successfully')
    console.log('')

    // 3. Check if active subscription already exists
    console.log('🔍 Checking existing subscription...')
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSub) {
      console.log('⚠️  Active subscription already exists, updating it...')
      const { error: updateSubError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: 'pro',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .eq('id', existingSub.id)

      if (updateSubError) {
        console.error('❌ Error updating subscription:', updateSubError.message)
      } else {
        console.log('✅ Subscription updated successfully')
      }
    } else {
      // 4. Create new active subscription
      console.log('📝 Creating new Pro subscription...')
      const now = new Date()
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'pro',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString()
        })

      if (insertError) {
        console.error('❌ Error creating subscription:', insertError.message)
      } else {
        console.log('✅ Subscription created successfully')
      }
    }

    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 SUCCESS! User is now on Pro plan')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   User: ${email}`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Subscription Type: pro`)
    console.log(`   Trial Until: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}`)
    console.log(`   Subscription Valid Until: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`)
    console.log('')
    console.log('✅ AI features are now accessible!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

setUserProPlan()

/**
 * Check Subscriptions Schema
 *
 * This script checks the actual schema of the subscriptions table in Supabase
 *
 * Usage: node scripts/check-subscriptions-schema.mjs
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

async function checkSchema() {
  console.log('🔍 Checking subscriptions table schema...')
  console.log('')

  // Try to get any subscription to see the structure
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(1)

  if (error) {
    console.log('⚠️  Error querying subscriptions:', error.message)
    console.log('   Table might be empty or have different structure')
  }

  if (data && data.length > 0) {
    console.log('✅ Found subscription record. Columns:')
    console.log(JSON.stringify(data[0], null, 2))
  } else {
    console.log('📭 No subscriptions found in database')
  }

  console.log('')
  console.log('🔍 Checking users table...')
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'netsacolas@gmail.com')
    .single()

  if (userError) {
    console.log('❌ Error:', userError.message)
  } else {
    console.log('✅ User data:')
    console.log(JSON.stringify(userData, null, 2))
  }
}

checkSchema()

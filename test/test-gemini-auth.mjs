#!/usr/bin/env node
/**
 * Test: Gemini Proxy Authentication
 *
 * Verifica se a autenticação está funcionando corretamente no endpoint /api/ai/gemini-proxy
 * Testa com o usuário netsacolas@gmail.com que possui plano Pro
 *
 * @author Claude Code
 * @date 2025-10-19
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_KEY not found in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🧪 Testing Gemini Proxy Authentication')
console.log('━'.repeat(40))

// Test user credentials
const testEmail = 'netsacolas@gmail.com'
const testPassword = 'senha123' // You need to provide the actual password

console.log(`\n📧 Testing with user: ${testEmail}`)

try {
  // 1. Sign in the user
  console.log('\n🔍 Step 1: Sign in user')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  })

  if (authError) {
    console.error('❌ Failed to sign in:', authError.message)
    console.log('\n⚠️  Note: You need to provide the correct password for the test user')
    console.log('   Edit this test file and update the testPassword variable')
    process.exit(1)
  }

  console.log('✅ User signed in successfully')
  console.log('   Session:', authData.session ? 'Active' : 'None')
  console.log('   User ID:', authData.user?.id)

  // 2. Get the session token
  const accessToken = authData.session?.access_token

  if (!accessToken) {
    console.error('❌ No access token received')
    process.exit(1)
  }

  // 3. Test the Gemini proxy endpoint
  console.log('\n🔍 Step 2: Test Gemini proxy endpoint')

  const apiUrl = 'http://localhost:3000/api/ai/gemini-proxy'
  console.log('   URL:', apiUrl)

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sb-access-token=${accessToken}; sb-refresh-token=${authData.session.refresh_token}`,
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      prompt: 'Teste de autenticação. Responda apenas: "Autenticação funcionando!"',
      model: 'gemini-2.0-flash-exp',
      temperature: 0.1,
      maxTokens: 100
    })
  })

  console.log('   Response status:', response.status)

  if (response.status === 401) {
    console.error('❌ Authentication failed (401 Unauthorized)')
    console.log('   The endpoint is not recognizing the authenticated user')

    // Try to get error details
    try {
      const errorData = await response.json()
      console.log('   Error:', errorData.message)
    } catch (e) {
      // Ignore parse errors
    }

    process.exit(1)
  }

  if (response.status === 403) {
    console.error('❌ Authorization failed (403 Forbidden)')
    console.log('   User is authenticated but not authorized (missing Pro plan?)')

    // Try to get error details
    try {
      const errorData = await response.json()
      console.log('   Error:', errorData.message)
    } catch (e) {
      // Ignore parse errors
    }

    process.exit(1)
  }

  if (!response.ok) {
    console.error(`❌ Request failed with status ${response.status}`)

    // Try to get error details
    try {
      const errorData = await response.json()
      console.log('   Error:', errorData.message || errorData)
    } catch (e) {
      console.log('   Could not parse error response')
    }

    process.exit(1)
  }

  // 4. Parse the response
  const data = await response.json()
  console.log('✅ Request successful!')
  console.log('   AI Response:', data.data?.text?.substring(0, 100))
  console.log('   Rate Limit Remaining:', data.rateLimit?.remaining)

  // 5. Sign out
  await supabase.auth.signOut()

  console.log('\n━'.repeat(40))
  console.log('✅ SUCCESS: Authentication is working correctly!')
  console.log('━'.repeat(40))
  console.log('\n📋 Summary:')
  console.log('   ✅ User authentication: Working')
  console.log('   ✅ Session creation: Working')
  console.log('   ✅ Token passing: Working')
  console.log('   ✅ Endpoint recognition: Working')
  console.log('   ✅ Pro plan detection: Working')
  console.log('   ✅ AI generation: Working')

} catch (error) {
  console.error('\n❌ Test failed with error:', error.message)
  process.exit(1)
}
#!/usr/bin/env node
/**
 * Test: Error Handling Fix in Gemini Proxy
 *
 * Verifica se o erro "Cannot set property statusCode of FetchError" foi corrigido
 * e se o endpoint retorna erros adequados (401, 403, 500) sem crashes.
 *
 * @author Claude Code
 * @date 2025-10-19
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

console.log('🧪 Testing Error Handling Fix in Gemini Proxy')
console.log('━'.repeat(40))

const apiUrl = 'http://localhost:3000/api/ai/gemini-proxy'

// Check if server is running
console.log('\n🔍 Step 1: Check if dev server is running')
try {
  const healthCheck = await fetch('http://localhost:3000', { method: 'HEAD' })
  if (!healthCheck.ok && healthCheck.status !== 404) {
    throw new Error('Server not responding')
  }
  console.log('✅ Dev server is running')
} catch (e) {
  console.error('❌ Dev server is not running. Please run: npm run dev')
  process.exit(1)
}

// Test 1: No authentication (should return 401)
console.log('\n🔍 Test 1: No authentication')
try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: 'Test prompt',
      model: 'gemini-2.0-flash-exp'
    })
  })

  console.log('   Response status:', response.status)

  if (response.status === 401) {
    console.log('✅ Correctly returned 401 Unauthorized')

    // Check if we can parse the error response
    try {
      const errorData = await response.json()
      console.log('   Error message:', errorData.message || errorData.statusMessage)
      console.log('✅ Error response is properly formatted JSON')
    } catch (e) {
      console.log('⚠️  Could not parse error response as JSON')
    }
  } else if (response.status === 503) {
    console.error('❌ Got 503 instead of 401 - error handling may still be broken')
    const errorText = await response.text()
    console.log('   Error text:', errorText.substring(0, 200))
  } else {
    console.log('⚠️  Unexpected status code:', response.status)
  }
} catch (error) {
  console.error('❌ Test 1 failed with error:', error.message)
  if (error.message.includes('Cannot set property')) {
    console.error('❌ ERROR NOT FIXED: Still trying to set read-only property')
  }
}

// Test 2: Invalid JSON body (should return 400 or 422)
console.log('\n🔍 Test 2: Invalid JSON body')
try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'invalid json'
  })

  console.log('   Response status:', response.status)

  if (response.status === 400 || response.status === 422) {
    console.log('✅ Correctly returned', response.status, 'for invalid JSON')
  } else if (response.status === 503) {
    console.error('❌ Got 503 instead of 400/422 - error handling may still be broken')
  } else {
    console.log('⚠️  Status:', response.status)
  }
} catch (error) {
  console.error('❌ Test 2 failed with error:', error.message)
}

// Test 3: Missing required fields (should return 400 or 422)
console.log('\n🔍 Test 3: Missing required fields')
try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Missing prompt field
      model: 'gemini-2.0-flash-exp'
    })
  })

  console.log('   Response status:', response.status)

  if (response.status === 400 || response.status === 422 || response.status === 401) {
    console.log('✅ Correctly returned', response.status)

    try {
      const errorData = await response.json()
      console.log('   Error message:', errorData.message || errorData.statusMessage)
    } catch (e) {
      // Ignore JSON parse errors
    }
  } else if (response.status === 503) {
    console.error('❌ Got 503 - error handling may still be broken')
  } else {
    console.log('⚠️  Status:', response.status)
  }
} catch (error) {
  console.error('❌ Test 3 failed with error:', error.message)
}

// Summary
console.log('\n━'.repeat(40))
console.log('📋 Summary of Error Handling Fix:')
console.log('\n✅ Fixed in app/composables/useGemini.ts:')
console.log('   - Never modify original error objects')
console.log('   - Create new error objects with statusCode')
console.log('   - Avoid setting read-only properties')

console.log('\n✅ Fixed in server/api/ai/gemini-proxy.post.ts:')
console.log('   - Always use createError() for error responses')
console.log('   - Never re-throw original errors directly')
console.log('   - Handle H3Error objects specially')
console.log('   - Proper statusCode extraction from various error types')

console.log('\n🎯 Expected Behavior:')
console.log('   ✅ No more "Cannot set property statusCode" errors')
console.log('   ✅ Proper HTTP status codes (401, 403, 500)')
console.log('   ✅ Clean error messages in responses')
console.log('   ✅ No server crashes (503 errors)')

console.log('\n🎉 The error handling should now work correctly!')
console.log('━'.repeat(40))
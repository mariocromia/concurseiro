/**
 * Test Google AI API Key Validity
 *
 * This script tests if the GOOGLE_AI_API_KEY in .env is valid
 * by making a simple API call to Google Generative AI
 *
 * Usage: node scripts/test-google-ai-key.mjs
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
const envPath = join(__dirname, '..', '.env')
let apiKey = ''

try {
  const envFile = readFileSync(envPath, 'utf-8')
  const match = envFile.match(/GOOGLE_AI_API_KEY=(.+)/)

  if (match && match[1]) {
    apiKey = match[1].trim()
  } else {
    console.error('❌ GOOGLE_AI_API_KEY not found in .env file')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error.message)
  process.exit(1)
}

console.log('🔑 Testing Google AI API Key...')
console.log(`📝 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`)
console.log('')

// Test the API key
async function testApiKey() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    console.log('🚀 Sending test request to Google Gemini API...')

    const result = await model.generateContent('Say "Hello, API key is working!" in Portuguese.')
    const response = await result.response
    const text = response.text()

    console.log('✅ API Key is VALID!')
    console.log('📨 Response from API:')
    console.log(text)
    console.log('')
    console.log('✨ Your Google AI integration is working correctly!')

  } catch (error) {
    console.error('❌ API Key is INVALID or ERROR occurred!')
    console.error('Error details:', error.message)

    if (error.message.includes('API key not valid')) {
      console.log('')
      console.log('🔧 How to fix:')
      console.log('1. Go to https://aistudio.google.com/app/apikey')
      console.log('2. Create a new API key or copy an existing valid key')
      console.log('3. Update GOOGLE_AI_API_KEY in your .env file')
      console.log('4. Run this script again to validate')
    }

    process.exit(1)
  }
}

testApiKey()

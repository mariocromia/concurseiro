/**
 * Script de teste para Google Gemini API
 * Verifica se a API key está funcionando
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyAPTgb4qgQQRGWtpJ5Vf51CUeOvXADYc58'

console.log('🔍 Testando Google Gemini API...\n')

if (!API_KEY) {
  console.error('❌ API_KEY não encontrada!')
  process.exit(1)
}

console.log('✓ API Key encontrada:', API_KEY.substring(0, 20) + '...')

try {
  const genAI = new GoogleGenerativeAI(API_KEY)
  console.log('✓ GoogleGenerativeAI inicializado')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  console.log('✓ Modelo selecionado: gemini-2.0-flash-exp')

  console.log('\n📤 Enviando requisição de teste...')
  const result = await model.generateContent('Diga apenas "oi" em português')
  const response = result.response
  const text = response.text()

  console.log('✅ SUCESSO! Resposta recebida:')
  console.log('   ', text)
  console.log('\n✅ A API está funcionando corretamente!')

} catch (error) {
  console.error('\n❌ ERRO ao chamar API:')
  console.error('   Tipo:', error.constructor.name)
  console.error('   Mensagem:', error.message)

  if (error.status) {
    console.error('   Status HTTP:', error.status)
  }

  if (error.statusText) {
    console.error('   Status Text:', error.statusText)
  }

  if (error.errorDetails) {
    console.error('   Detalhes:', JSON.stringify(error.errorDetails, null, 2))
  }

  console.log('\n🔍 Possíveis causas:')
  console.log('   1. API key inválida ou expirada')
  console.log('   2. Billing não configurado no Google Cloud')
  console.log('   3. API não habilitada no projeto')
  console.log('   4. Limite de requisições excedido')
  console.log('   5. Problema de rede/firewall')

  process.exit(1)
}

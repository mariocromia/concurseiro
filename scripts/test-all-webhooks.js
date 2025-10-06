// Script para testar TODOS os webhooks do Asaas em sequência
// Uso: node scripts/test-all-webhooks.js

const eventos = [
  'PAYMENT_CREATED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_RECEIVED',
  'PAYMENT_OVERDUE',
  'PAYMENT_REFUNDED'
]

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testarTodos() {
  console.log('\n🧪 Testando TODOS os Webhooks do Asaas\n')
  console.log('📋 Total de eventos:', eventos.length)
  console.log('⏱️  Aguarde...\n')

  let sucessos = 0
  let falhas = 0

  for (let i = 0; i < eventos.length; i++) {
    const evento = eventos[i]

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`🔄 [${i + 1}/${eventos.length}] Testando: ${evento}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    try {
      // Importar e executar o script de teste individual
      const { execSync } = require('child_process')
      const output = execSync(`node scripts/test-webhook.js ${evento}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      })

      console.log(output)
      sucessos++
      console.log(`✅ ${evento} - OK`)

    } catch (error) {
      falhas++
      console.error(`❌ ${evento} - FALHOU`)
      console.error(error.stdout || error.message)
    }

    // Aguardar 1 segundo entre os testes
    if (i < eventos.length - 1) {
      await delay(1000)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMO DOS TESTES')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Sucessos: ${sucessos}`)
  console.log(`❌ Falhas: ${falhas}`)
  console.log(`📋 Total: ${eventos.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (falhas === 0) {
    console.log('🎉 TODOS OS WEBHOOKS FUNCIONARAM!\n')
  } else {
    console.log('⚠️  Alguns webhooks falharam. Verifique os erros acima.\n')
  }
}

testarTodos()

// Script para testar webhook do Asaas localmente
// Uso: node scripts/test-webhook.js [tipo-evento]
// Exemplo: node scripts/test-webhook.js PAYMENT_CONFIRMED

const eventos = {
  PAYMENT_CONFIRMED: {
    event: 'PAYMENT_CONFIRMED',
    payment: {
      object: 'payment',
      id: 'pay_test_' + Date.now(),
      dateCreated: new Date().toISOString(),
      customer: 'cus_test_123456',
      subscription: 'sub_test_789',
      installment: null,
      paymentLink: null,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 44.90,
      netValue: 42.50,
      billingType: 'CREDIT_CARD',
      canBePaidAfterDueDate: true,
      pixTransaction: null,
      status: 'CONFIRMED',
      description: 'Assinatura Plano Pro - Concurseiro',
      externalReference: 'user_test_uuid',
      confirmedDate: new Date().toISOString(),
      paymentDate: new Date().toISOString(),
      clientPaymentDate: new Date().toISOString(),
      installmentNumber: null,
      invoiceUrl: 'https://sandbox.asaas.com/i/abc123',
      invoiceNumber: '000001',
      externalPaymentId: null,
      originalDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      originalValue: 44.90,
      interestValue: 0,
      discount: {
        value: 0,
        dueDateLimitDays: 0,
        type: 'FIXED'
      }
    }
  },

  PAYMENT_RECEIVED: {
    event: 'PAYMENT_RECEIVED',
    payment: {
      object: 'payment',
      id: 'pay_test_' + Date.now(),
      dateCreated: new Date().toISOString(),
      customer: 'cus_test_123456',
      subscription: 'sub_test_789',
      value: 44.90,
      netValue: 42.50,
      billingType: 'CREDIT_CARD',
      status: 'RECEIVED',
      description: 'Assinatura Plano Pro - Concurseiro',
      dueDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString(),
      confirmedDate: new Date().toISOString(),
      clientPaymentDate: new Date().toISOString(),
      invoiceUrl: 'https://sandbox.asaas.com/i/abc123',
      invoiceNumber: '000001'
    }
  },

  PAYMENT_OVERDUE: {
    event: 'PAYMENT_OVERDUE',
    payment: {
      object: 'payment',
      id: 'pay_test_' + Date.now(),
      dateCreated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      customer: 'cus_test_123456',
      subscription: 'sub_test_789',
      value: 44.90,
      netValue: 42.50,
      billingType: 'BOLETO',
      status: 'OVERDUE',
      description: 'Assinatura Plano Pro - Concurseiro',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bankSlipUrl: 'https://sandbox.asaas.com/b/xyz789',
      invoiceUrl: 'https://sandbox.asaas.com/i/abc123'
    }
  },

  PAYMENT_CREATED: {
    event: 'PAYMENT_CREATED',
    payment: {
      object: 'payment',
      id: 'pay_test_' + Date.now(),
      dateCreated: new Date().toISOString(),
      customer: 'cus_test_123456',
      subscription: 'sub_test_789',
      value: 24.90,
      netValue: 23.50,
      billingType: 'PIX',
      status: 'PENDING',
      description: 'Assinatura Plano Plus - Concurseiro',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoiceUrl: 'https://sandbox.asaas.com/i/def456'
    }
  },

  PAYMENT_REFUNDED: {
    event: 'PAYMENT_REFUNDED',
    payment: {
      object: 'payment',
      id: 'pay_test_' + Date.now(),
      dateCreated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      customer: 'cus_test_123456',
      value: 44.90,
      netValue: 0,
      billingType: 'CREDIT_CARD',
      status: 'REFUNDED',
      description: 'Assinatura Plano Pro - Concurseiro',
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      refundedDate: new Date().toISOString(),
      refundStatus: 'DONE'
    }
  }
}

async function testarWebhook(tipoEvento = 'PAYMENT_CONFIRMED') {
  console.log('\n🧪 Testando Webhook do Asaas\n')
  console.log('📋 Evento:', tipoEvento)

  const payload = eventos[tipoEvento]

  if (!payload) {
    console.error('❌ Tipo de evento inválido!')
    console.log('\n📝 Eventos disponíveis:')
    Object.keys(eventos).forEach(key => {
      console.log(`   - ${key}`)
    })
    process.exit(1)
  }

  console.log('📦 Payload:')
  console.log(JSON.stringify(payload, null, 2))

  try {
    console.log('\n🚀 Enviando para: http://localhost:3000/api/webhooks/asaas')

    const response = await fetch('http://localhost:3000/api/webhooks/asaas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Asaas-Test-Script'
      },
      body: JSON.stringify(payload)
    })

    console.log('\n📊 Status da Resposta:', response.status, response.statusText)

    const contentType = response.headers.get('content-type')
    let result

    if (contentType && contentType.includes('application/json')) {
      result = await response.json()
      console.log('\n✅ Resposta JSON:')
      console.log(JSON.stringify(result, null, 2))
    } else {
      const text = await response.text()
      console.log('\n📄 Resposta Texto:')
      console.log(text)
    }

    if (response.ok) {
      console.log('\n✅ Webhook processado com sucesso!')
    } else {
      console.log('\n⚠️  Webhook retornou erro')
    }

  } catch (error) {
    console.error('\n❌ Erro ao enviar webhook:', error.message)
    console.log('\n💡 Dica: Certifique-se de que a aplicação está rodando em http://localhost:3000')
    console.log('   Execute: npm run dev')
    process.exit(1)
  }
}

// Pegar tipo de evento da linha de comando
const tipoEvento = process.argv[2] || 'PAYMENT_CONFIRMED'

// Executar teste
testarWebhook(tipoEvento)

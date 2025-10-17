// Script para testar geração de mapa mental com IA
const text = `
Lojas Virtuais (E-commerce): Para garantir a segurança dos dados dos clientes e a estabilidade durante picos de venda, como na Black Friday.

Desenvolvedores e Agências: Para hospedar múltiplos sites de clientes em um ambiente controlado, criar ambientes de teste ou rodar aplicações específicas.

Aplicações Web e SaaS: Para hospedar sistemas que precisam de configurações de software personalizadas e recursos garantidos.
`

async function testGenerate() {
  console.log('🧪 Testando geração de mapa mental com IA...\n')
  console.log('📝 Texto:', text.substring(0, 100) + '...\n')

  try {
    const response = await fetch('http://localhost:3001/api/mindmaps/generate-from-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    })

    const contentType = response.headers.get('content-type')
    console.log('📡 Status:', response.status)
    console.log('📋 Content-Type:', contentType)

    if (contentType?.includes('application/json')) {
      const data = await response.json()
      console.log('\n✅ Resposta JSON:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      const textResponse = await response.text()
      console.log('\n❌ Resposta (não é JSON):')
      console.log(textResponse)
    }
  } catch (error) {
    console.error('\n❌ Erro ao testar:', error.message)
  }
}

testGenerate()

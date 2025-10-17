// Script para debugar a API de mapas mentais
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3001';

// Simular dados que a IA retornaria
const mockAIResponse = {
  title: "VPS - Casos de Uso",
  nodes: [
    {
      id: "1",
      text: "VPS",
      parent_id: null,
      level: 0,
      position_x: 0,
      position_y: 200,
      color: "#3b82f6"
    },
    {
      id: "2",
      text: "Lojas Virtuais",
      parent_id: "1",
      level: 1,
      position_x: 300,
      position_y: 50,
      color: "#8b5cf6"
    },
    {
      id: "3",
      text: "Desenvolvedores",
      parent_id: "1",
      level: 1,
      position_x: 300,
      position_y: 200,
      color: "#8b5cf6"
    }
  ]
};

async function testCreateMindmap() {
  console.log('🧪 Testando POST /api/mindmaps...\n');

  try {
    console.log('📝 Dados a serem enviados:');
    console.log(JSON.stringify({
      title: mockAIResponse.title,
      description: '',
      nodes: mockAIResponse.nodes
    }, null, 2));

    const response = await fetch(`${BASE_URL}/api/mindmaps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: mockAIResponse.title,
        description: '',
        nodes: mockAIResponse.nodes
      })
    });

    console.log('\n📡 Status da resposta:', response.status);
    console.log('📋 Headers:', response.headers.raw());

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      console.log('\n✅ Resposta JSON:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('\n❌ Resposta (texto):');
      console.log(text);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error.stack);
  }
}

// Executar teste
console.log('⚠️  IMPORTANTE: Certifique-se de estar autenticado no navegador');
console.log('   Caso contrário, você receberá erro 401\n');

testCreateMindmap();

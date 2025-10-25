// Script para testar criação de meta via API
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/goals';

const testData = {
  name: 'Teste de Meta - Debug',
  subject_id: 'SEU_SUBJECT_ID_AQUI', // Você precisará substituir por um ID real
  target_date: '2025-12-31',
  checklist_items: [
    { description: 'Item 1 de teste' },
    { description: 'Item 2 de teste' },
    { description: 'Item 3 de teste' }
  ]
};

async function testCreateGoal() {
  console.log('🧪 Testando criação de meta...');
  console.log('📋 Dados:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Você precisará adicionar o token de autenticação aqui
        // 'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);

    const data = await response.json();
    console.log('📦 Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Meta criada com sucesso!');
    } else {
      console.log('❌ Erro ao criar meta');
    }
  } catch (error) {
    console.error('💥 Erro na requisição:', error.message);
  }
}

testCreateGoal();

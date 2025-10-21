const fetch = require('node-fetch');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/exercises/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Teste Direto Node',
        total_questions: 3,
        correct_answers: 2,
        score_percentage: 66.67,
        questions_data: {test: true}
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();

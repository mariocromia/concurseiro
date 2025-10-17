# 🧪 Teste no Console do Navegador

## Instruções:

1. Acesse: `http://localhost:3000/mapa-mental` (certifique-se de estar logado)
2. Pressione **F12** para abrir o DevTools
3. Vá na aba **Console**
4. Cole o código abaixo e pressione **Enter**

---

## Código para testar:

```javascript
// TESTE 1: Gerar com IA
async function testarIA() {
  console.log('🧪 Testando geração com IA...');

  const text = `Lojas Virtuais (E-commerce): Para garantir a segurança dos dados dos clientes.

Desenvolvedores e Agências: Para hospedar múltiplos sites.`;

  try {
    // Passo 1: Gerar estrutura
    console.log('📝 Chamando /api/mindmaps/generate-from-text...');
    const genRes = await fetch('/api/mindmaps/generate-from-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    console.log('Status passo 1:', genRes.status);

    if (!genRes.ok) {
      const error = await genRes.text();
      console.error('❌ Erro passo 1:', error);
      return;
    }

    const genData = await genRes.json();
    console.log('✅ Passo 1 OK:', genData);

    // Passo 2: Criar mapa
    console.log('📝 Chamando /api/mindmaps...');
    const createRes = await fetch('/api/mindmaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: genData.data.title,
        description: '',
        nodes: genData.data.nodes
      })
    });

    console.log('Status passo 2:', createRes.status);

    if (!createRes.ok) {
      const error = await createRes.text();
      console.error('❌ Erro passo 2:', error);
      return;
    }

    const createData = await createRes.json();
    console.log('✅ Passo 2 OK:', createData);
    console.log('🎉 Sucesso! ID do mapa:', createData.data.id);

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

// Executar teste
testarIA();
```

---

## O que observar:

1. **Se aparecer erro 401**: Você não está autenticado, faça login
2. **Se aparecer erro 500 no passo 1**: Problema na geração com IA
3. **Se aparecer erro 500 no passo 2**: Problema ao criar o mapa

**COPIE TODA A SAÍDA DO CONSOLE E ME ENVIE!**

# ⚡ Teste Rápido de Webhooks - SEM NGROK

## 🎯 Solução Simples

Você **NÃO PRECISA** configurar webhook real no Asaas para testar!

Criamos scripts que **simulam** os webhooks localmente.

---

## 🚀 Como Testar AGORA (2 passos)

### 1️⃣ Inicie a aplicação
```bash
npm run dev
```

Aguarde iniciar em: `http://localhost:3000`

---

### 2️⃣ Execute o teste (em outro terminal)

#### Testar um evento específico:
```bash
node scripts/test-webhook.js PAYMENT_CONFIRMED
```

#### Testar TODOS os eventos:
```bash
node scripts/test-all-webhooks.js
```

---

## 📋 Eventos Disponíveis

Você pode testar qualquer um desses:

```bash
# Pagamento criado (pendente)
node scripts/test-webhook.js PAYMENT_CREATED

# Pagamento confirmado
node scripts/test-webhook.js PAYMENT_CONFIRMED

# Pagamento recebido
node scripts/test-webhook.js PAYMENT_RECEIVED

# Pagamento vencido
node scripts/test-webhook.js PAYMENT_OVERDUE

# Pagamento reembolsado
node scripts/test-webhook.js PAYMENT_REFUNDED
```

---

## ✅ O que os scripts fazem?

1. ✅ Criam payload realista do Asaas
2. ✅ Enviam POST para `/api/webhooks/asaas`
3. ✅ Mostram a resposta completa
4. ✅ Validam se processou corretamente

---

## 📊 Exemplo de Output

```bash
$ node scripts/test-webhook.js PAYMENT_CONFIRMED

🧪 Testando Webhook do Asaas

📋 Evento: PAYMENT_CONFIRMED
📦 Payload:
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_test_123",
    "value": 44.90,
    "status": "CONFIRMED",
    ...
  }
}

🚀 Enviando para: http://localhost:3000/api/webhooks/asaas

📊 Status da Resposta: 200 OK

✅ Resposta JSON:
{
  "success": true,
  "message": "Webhook processado com sucesso"
}

✅ Webhook processado com sucesso!
```

---

## 🔍 Verificar no Banco

Após executar o teste, verifique no Supabase:

```sql
-- Ver webhooks processados
SELECT * FROM asaas_webhooks
ORDER BY created_at DESC
LIMIT 5;

-- Ver pagamentos atualizados
SELECT * FROM payments
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🎓 Quando usar cada método?

| Situação | Método |
|----------|--------|
| **Desenvolvimento local** | Scripts de teste ✅ |
| **Testar integração real** | ngrok |
| **Homologação/Staging** | Servidor de staging |
| **Produção** | Domínio real |

---

## 💡 Vantagens dos Scripts

✅ **Instantâneo** - Testa em segundos
✅ **Sem configuração** - Não precisa de ngrok/túnel
✅ **Controle total** - Você escolhe o payload
✅ **Fácil debug** - Vê tudo que acontece
✅ **Funciona offline** - Sem internet necessária

---

## 🐛 Debug

Se o teste falhar:

### Erro: "Connection refused"
```
❌ Solução: Certifique-se que o app está rodando
   Execute: npm run dev
```

### Erro: 404 Not Found
```
❌ Solução: Endpoint não existe
   Verifique: server/api/webhooks/asaas.post.ts
```

### Erro: 500 Internal Server Error
```
❌ Solução: Erro no código do webhook
   Veja os logs do terminal onde está rodando o app
```

---

## 🎯 Próximos Passos

Depois de testar localmente com sucesso:

1. ✅ Teste todos os eventos
2. ✅ Verifique que os dados são salvos no banco
3. ✅ Teste o fluxo completo de assinatura
4. ✅ Quando for para produção, configure webhook real no Asaas

---

## 🚀 Começar Agora!

```bash
# Terminal 1
npm run dev

# Terminal 2
node scripts/test-webhook.js PAYMENT_CONFIRMED
```

**Simples assim!** ⚡

# 🚀 Configuração do Redis (Upstash)

**Data:** 2025-10-17
**Autor:** Claude Code
**Status:** Fase 1.3 - Rate Limiting

---

## 📋 Por que Upstash Redis?

- **Serverless:** Sem necessidade de gerenciar infraestrutura
- **Gratuito:** 10,000 comandos/dia no plano free
- **Rápido:** < 1ms de latência
- **Global:** Edge locations worldwide
- **REST API:** Funciona com qualquer ambiente (Vercel, Netlify, etc.)

---

## 🔧 Como Configurar (5 minutos)

### 1. Criar conta no Upstash

1. Acesse: https://upstash.com
2. Clique em "Sign Up" ou "Get Started"
3. Use GitHub ou Google para login rápido

### 2. Criar database Redis

1. No dashboard, clique em "Create Database"
2. Configurações:
   - **Name:** `prapassar-rate-limit`
   - **Type:** Regional (mais barato) ou Global (mais rápido)
   - **Region:** São Paulo (sa-east-1) ou US East (mais próximo dos usuários)
   - **TLS:** Enabled (recomendado)
3. Clique em "Create"

### 3. Copiar credenciais

1. Clique no database criado
2. Vá para a aba "REST API"
3. Copie:
   - **UPSTASH_REDIS_REST_URL** (ex: https://xxx.upstash.io)
   - **UPSTASH_REDIS_REST_TOKEN** (ex: AXXXxxx...)

### 4. Adicionar no .env

Edite o arquivo `prapassar-app/.env` e adicione:

```bash
# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 5. Reiniciar servidor

```bash
cd prapassar-app
npm run dev
```

---

## ✅ Teste de Funcionamento

### Via CLI (Upstash Dashboard)

1. No dashboard do Upstash, clique na aba "CLI"
2. Execute:
   ```redis
   SET test "Hello Redis!"
   GET test
   ```
3. Deve retornar: `"Hello Redis!"`

### Via API (cURL)

```bash
curl -X POST \
  https://your-endpoint.upstash.io/set/test/hello \
  -H "Authorization: Bearer your-token-here"
```

### Via Aplicação

1. Faça 21 requisições consecutivas para `/api/ai/gemini-proxy`
2. A 21ª requisição deve retornar erro 429 (Rate Limit Exceeded)

---

## 📊 Rate Limits Configurados

| Endpoint/Tipo | Limite | Janela | Identificador |
|---|---|---|---|
| **Global API** | 100 requests | 15 minutos | IP Address |
| **AI Features** | 20 requests | 1 hora | User ID |
| **Auth (Login/Register)** | 5 requests | 15 minutos | IP Address |
| **Webhooks** | 1000 requests | 1 minuto | IP Address |
| **Write Operations** | 50 requests | 1 minuto | User ID |

---

## 🔍 Monitoramento

### Via Upstash Dashboard

1. Vá para o database
2. Clique na aba "Metrics"
3. Visualize:
   - **Requests/sec**
   - **Latency**
   - **Storage used**
   - **Daily command count**

### Via Application Logs

O middleware de rate limiting loga automaticamente:

```
[Rate Limit] User 123abc: 15/20 remaining (resets in 45min)
[Rate Limit] IP 1.2.3.4: BLOCKED (exceeded limit)
```

---

## 💡 Troubleshooting

### Erro: "Redis connection failed"

**Causa:** Credenciais incorretas ou não configuradas

**Solução:**
1. Verifique se `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` estão no `.env`
2. Confirme que as credenciais estão corretas no dashboard do Upstash
3. Reinicie o servidor: `npm run dev`

### Erro: "Rate limit not working"

**Causa:** Fallback para in-memory (Redis não configurado)

**Solução:**
1. Configure as variáveis de ambiente conforme acima
2. Verifique logs do servidor para mensagens de erro do Redis
3. Teste a conexão com o CLI do Upstash

### Performance lenta

**Causa:** Region do Redis muito distante dos usuários

**Solução:**
1. No dashboard do Upstash, vá em Settings
2. Considere migrar para uma region mais próxima
3. Ou upgrade para "Global Database" (replicas em múltiplas regiões)

---

## 📈 Planos Upstash

### Free (Atual)
- 10,000 comandos/dia
- 256 MB storage
- Regional
- ✅ **Suficiente para 500-1000 usuários ativos/dia**

### Pay as you go
- $0.20 per 100K comandos
- 1 GB storage grátis
- Regional ou Global
- 💡 **Recomendado quando ultrapassar 10K comandos/dia**

### Pro ($60/mês)
- Comandos ilimitados
- 10 GB storage
- Global replication
- Priority support
- 🚀 **Para > 10K usuários ativos/dia**

---

## 🔐 Segurança

✅ **Token nunca exposto ao cliente** (server-side only)
✅ **TLS encryption** em todas as conexões
✅ **REST API** (não precisa abrir portas)
✅ **Isolamento por database** (não compartilha dados)

---

## 📚 Documentação Oficial

- Upstash Docs: https://docs.upstash.com/redis
- Rate Limiting: https://upstash.com/docs/redis/features/ratelimiting
- REST API: https://docs.upstash.com/redis/features/restapi

---

**Conforme roadmap - Fase 1.3**

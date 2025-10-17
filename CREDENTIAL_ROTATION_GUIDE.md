# 🔐 Guia de Rotação de Credenciais

**Data:** 2025-10-17
**Autor:** Claude Code
**Status:** Fase 1.5 - Manual (Requer Acesso Admin)
**Prioridade:** CRÍTICO

---

## ⚠️ Por Que Rotacionar?

As credenciais atuais foram **acidentalmente commitadas** no repositório Git e estão expostas no histórico público.

Mesmo que o repositório seja privado, é uma **boa prática de segurança** rotacionar credenciais periodicamente.

---

## 📋 Checklist de Rotação

### 1. Supabase (Database + Auth)

**⏱️ Tempo estimado:** 10 minutos

#### Passo a Passo:

1. **Acesse:** https://supabase.com/dashboard
2. **Selecione o projeto:** `prapassar` (ou nome atual)
3. **Vá em:** Settings > API
4. **Gere novas chaves:**
   - Click em "Reset Project API key"
   - ⚠️ **ATENÇÃO:** Isso invalidará a chave antiga imediatamente
   - Copie a nova `anon/public key`
5. **Anote as novas credenciais:**
   ```
   SUPABASE_URL=https://[seu-project-id].supabase.co
   SUPABASE_KEY=[nova-anon-key]
   ```

#### Atualizar em:
- ✅ `.env` local
- ✅ Vercel/Netlify Environment Variables
- ✅ `.env.production` (se existir)

#### Teste:
```bash
cd prapassar-app
npm run dev
# Tente fazer login - deve funcionar
```

---

### 2. Google AI (Gemini API)

**⏱️ Tempo estimado:** 5 minutos

#### Passo a Passo:

1. **Acesse:** https://makersuite.google.com/app/apikey
2. **Revogue a chave antiga:**
   - Encontre: `AIzaSyAPTgb4qgQQRGWtpJ5Vf51CUeOvXADYc58`
   - Click em "Delete" ou "Revoke"
3. **Crie nova chave:**
   - Click em "Create API Key"
   - Escolha o projeto: `PraPassar` (ou crie um novo)
   - Copie a nova key
4. **Anote:**
   ```
   GOOGLE_AI_API_KEY=[nova-key]
   ```

#### Atualizar em:
- ✅ `.env` local
- ✅ Vercel/Netlify Environment Variables

#### Teste:
```bash
# Via API
curl -X POST http://localhost:3000/api/ai/gemini-proxy \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Teste"}'
```

---

### 3. Asaas (Payment Gateway)

**⏱️ Tempo estimado:** 10 minutos

#### Passo a Passo:

1. **Acesse:** https://www.asaas.com/
2. **Login** com suas credenciais
3. **Vá em:** Integrações > API
4. **Gere nova chave:**
   - Click em "Gerar nova chave de API"
   - Escolha ambiente: **Produção**
   - ⚠️ **ATENÇÃO:** Copie imediatamente (só é exibida uma vez)
5. **Revogue a chave antiga:**
   - Encontre a key que começa com `$aact_prod_000Mzk...`
   - Click em "Revogar"
6. **Anote:**
   ```
   ASAAS_API_KEY=$aact_prod_[nova-key]
   ASAAS_BASE_URL=https://api.asaas.com/v3
   ```

#### Webhook Secret (OPCIONAL mas RECOMENDADO):

1. Na mesma página, vá em **Webhooks**
2. Click em "Configurar Webhook"
3. URL: `https://seudominio.com/api/webhooks/asaas`
4. **Gere um novo secret:**
   ```bash
   # Generate random secret
   openssl rand -hex 32
   ```
5. **Anote:**
   ```
   ASAAS_WEBHOOK_SECRET=[novo-secret-gerado]
   ```
6. **Configure no Asaas:**
   - Cole o secret no campo "Secret"
   - Marque os eventos: PAYMENT_*
   - Salve

#### Atualizar em:
- ✅ `.env` local
- ✅ Vercel/Netlify Environment Variables

#### Teste:
```bash
# Criar um pagamento de teste
# (use ambiente sandbox primeiro!)
```

---

### 4. Upstash Redis (OPCIONAL - se configurado)

**⏱️ Tempo estimado:** 3 minutos

#### Passo a Passo:

1. **Acesse:** https://console.upstash.com/
2. **Selecione o database:** `prapassar-rate-limit`
3. **Vá em:** Settings > Reset Password
4. **Gere novo token:**
   - Click em "Regenerate Token"
   - Copie o novo token
5. **Anote:**
   ```
   UPSTASH_REDIS_REST_URL=https://[endpoint].upstash.io
   UPSTASH_REDIS_REST_TOKEN=[novo-token]
   ```

#### Atualizar em:
- ✅ `.env` local
- ✅ Vercel/Netlify Environment Variables

---

## 🚀 Atualizar Produção (Vercel/Netlify)

### Vercel:

1. **Acesse:** https://vercel.com/dashboard
2. **Selecione o projeto:** `prapassar-app`
3. **Vá em:** Settings > Environment Variables
4. **Para cada variável:**
   - Click em "Edit"
   - Cole o novo valor
   - Click em "Save"
5. **Redeploy:**
   - Vá em Deployments
   - Click nos "..." da última deployment
   - Click em "Redeploy"

### Netlify:

1. **Acesse:** https://app.netlify.com/
2. **Selecione o site:** `prapassar`
3. **Vá em:** Site settings > Environment variables
4. **Para cada variável:**
   - Click na variável
   - Click em "Options" > "Edit"
   - Cole o novo valor
   - Save
5. **Redeploy:**
   - Vá em Deploys
   - Click em "Trigger deploy" > "Deploy site"

---

## ✅ Validação Pós-Rotação

### Checklist de Testes:

- [ ] **Login/Register funciona** (Supabase Auth)
- [ ] **Dashboard carrega dados** (Supabase Database)
- [ ] **IA responde** (Google AI Gemini)
- [ ] **Criar assinatura teste** (Asaas - sandbox primeiro!)
- [ ] **Webhook recebe evento** (Asaas webhook)
- [ ] **Rate limiting funciona** (Upstash Redis)

### Teste Completo:

```bash
# 1. Backend health
curl https://seudominio.com/api/health

# 2. Login (obtenha token)
curl -X POST https://seudominio.com/api/auth/login \
  -d '{"email":"test@example.com","password":"..."}'

# 3. AI (com token)
curl -X POST https://seudominio.com/api/ai/gemini-proxy \
  -H "Authorization: Bearer [token]" \
  -d '{"prompt":"Teste de rotação"}'

# 4. Rate limit (faça 21 requests rápidas)
# A 21ª deve retornar 429
```

---

## 📝 Documentação Atualizar

Após rotacionar, atualize:

1. ✅ `.env.example` (valores de exemplo, não reais)
2. ✅ `CLAUDE.md` (se mencionar credenciais)
3. ✅ Documentação interna da equipe
4. ✅ Password manager (1Password, LastPass, etc.)

---

## 🔒 Boas Práticas (Para o Futuro)

### Nunca Commitar Credenciais

```gitignore
# .gitignore (já configurado)
.env
.env.*
!.env.example
```

### Usar Secrets Manager

**Recomendado para produção:**
- AWS Secrets Manager
- Google Cloud Secret Manager
- HashiCorp Vault
- Vercel Environment Variables (já usado)

### Rotação Automática

**Considere implementar:**
- Rotação trimestral automática
- Alertas quando chaves ficam antigas (> 90 dias)
- Logs de acesso a credenciais

### Auditoria

**Revisar periodicamente:**
```bash
# Histórico git (verificar se não há credenciais)
git log --all --full-history --source --all -- .env

# Remover do histórico (se encontrar)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🆘 Troubleshooting

### Erro: "Invalid Supabase credentials"
- Verifique se copiou a chave corretamente (sem espaços)
- Confirme que atualizou **todas** as variáveis (local + produção)
- Reinicie o servidor: `npm run dev`

### Erro: "Google AI API key invalid"
- Verifique se a key está ativa no Google Cloud Console
- Confirme que o projeto tem Gemini API habilitada
- Teste a key diretamente: https://makersuite.google.com/app/apikey

### Erro: "Asaas authentication failed"
- Confirme que a key começa com `$aact_prod_`
- Verifique se não revogou a key antiga antes de atualizar
- Teste no Postman com a nova key

### Webhook não recebe eventos
- Confirme que configurou o webhook URL no dashboard Asaas
- Verifique se o secret está correto
- Teste localmente com ngrok:
  ```bash
  ngrok http 3000
  # Use a URL ngrok no webhook Asaas
  ```

---

## 📅 Próxima Rotação

**Recomendado:** A cada 90 dias (trimestral)

**Data da próxima rotação:** 2026-01-17 (3 meses)

**Adicionar ao calendário:**
- Google Calendar reminder
- Jira/Linear ticket
- Notion task

---

**✅ Fase 1.5 completa quando todas as credenciais forem rotacionadas e testadas.**

**Conforme roadmap.**

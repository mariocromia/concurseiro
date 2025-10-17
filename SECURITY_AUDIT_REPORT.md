# 🔒 RELATÓRIO DE AUDITORIA DE SEGURANÇA - PRAPASSAR

**Data:** 2025-10-16
**Plataforma:** PraPassar (Nuxt 4 + Vue 3 + Supabase + Google Gemini + Asaas)
**Auditor:** Claude Security Audit
**Status:** ⚠️ **DEPLOY BLOQUEADO - VULNERABILIDADES CRÍTICAS ENCONTRADAS**

---

## 📋 SUMÁRIO EXECUTIVO

**Score de Segurança: 35/100** ❌

- **Vulnerabilidades Críticas:** 4
- **Vulnerabilidades Altas:** 6
- **Vulnerabilidades Médias:** 8
- **Vulnerabilidades Baixas:** 12

**⛔ RECOMENDAÇÃO: NÃO FAZER DEPLOY ATÉ CORRIGIR TODAS AS VULNERABILIDADES CRÍTICAS**

---

## 🚨 VULNERABILIDADES CRÍTICAS (DEPLOY BLOCKER)

### 🚨 [CRÍTICO-1] Google AI API Key Exposta no Cliente

**Arquivo:** `prapassar-app/nuxt.config.ts:28`

**Descrição:**
A chave da API do Google Gemini está configurada como `runtimeConfig.public`, o que significa que ela é exposta no código JavaScript do cliente e pode ser lida por qualquer pessoa que inspecione o código-fonte da aplicação.

**Código vulnerável:**
```typescript
// nuxt.config.ts:21-29
runtimeConfig: {
  asaasApiKey: process.env.ASAAS_API_KEY,
  asaasBaseUrl: process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3',
  asaasWebhookSecret: process.env.ASAAS_WEBHOOK_SECRET,
  public: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,  // ❌ EXPOSTO!
  }
}
```

**Impacto:**
- **CRÍTICO:** Qualquer usuário pode extrair a API key e fazer chamadas ilimitadas ao Google Gemini
- Custo financeiro: Pode gerar milhares de dólares em cobranças indevidas
- Abuso da quota: Esgotamento dos limites da API
- Violação dos termos de serviço do Google

**Correção:**
```typescript
// nuxt.config.ts
runtimeConfig: {
  asaasApiKey: process.env.ASAAS_API_KEY,
  asaasBaseUrl: process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3',
  asaasWebhookSecret: process.env.ASAAS_WEBHOOK_SECRET,
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY, // ✅ Agora é privado
  public: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    // googleAiApiKey REMOVIDO daqui
  }
}
```

**Prioridade:** 1 (CRÍTICO - Corrigir IMEDIATAMENTE)

---

### 🚨 [CRÍTICO-2] Webhook Asaas Sem Validação de Assinatura

**Arquivo:** `prapassar-app/server/utils/asaas.ts:308-312`

**Descrição:**
A função `verifyWebhookSignature()` retorna `true` incondicionalmente, sem validar a assinatura HMAC do webhook. Isso significa que qualquer pessoa pode enviar webhooks falsos para o endpoint.

**Código vulnerável:**
```typescript
// server/utils/asaas.ts:308-312
verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Implementar verificação de assinatura do webhook
  // Usar crypto para validar HMAC
  return true // ❌ PLACEHOLDER - VULNERÁVEL!
}
```

**Código vulnerável no webhook:**
```typescript
// server/api/webhooks/asaas.post.ts:1-92
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)

  // ❌ SEM VALIDAÇÃO DE ASSINATURA!
  // Qualquer pessoa pode enviar este payload

  console.log('Webhook Asaas recebido:', JSON.stringify(body, null, 2))

  try {
    // Processa diretamente sem verificar autenticidade
    await handlePaymentWebhook(supabase, body.payment)
    // ...
  }
})
```

**Impacto:**
- **CRÍTICO:** Atacante pode enviar webhooks falsos para:
  - Ativar assinaturas sem pagamento
  - Criar comissões de afiliados fraudulentas
  - Manipular status de pagamentos
  - Obter acesso PRO sem pagar
- Fraude financeira: Perda de receita e pagamentos indevidos a afiliados
- Reputação: Usuários obtendo acesso pago gratuitamente

**Correção:**
```typescript
// server/utils/asaas.ts
import { createHmac } from 'crypto'

verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = createHmac('sha256', secret)
  hmac.update(payload)
  const calculatedSignature = hmac.digest('hex')

  return calculatedSignature === signature
}
```

```typescript
// server/api/webhooks/asaas.post.ts
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const config = useRuntimeConfig()

  // ✅ Obter assinatura do header
  const signature = getHeader(event, 'asaas-signature')
  if (!signature) {
    throw createError({
      statusCode: 401,
      message: 'Missing webhook signature'
    })
  }

  // ✅ Ler body como string para validação
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      message: 'Empty body'
    })
  }

  // ✅ Validar assinatura
  const asaas = useAsaas()
  const isValid = asaas.verifyWebhookSignature(
    rawBody,
    signature,
    config.asaasWebhookSecret
  )

  if (!isValid) {
    console.error('❌ Webhook signature validation failed')
    throw createError({
      statusCode: 403,
      message: 'Invalid webhook signature'
    })
  }

  const body = JSON.parse(rawBody)
  console.log('✅ Webhook Asaas validado:', body.event)

  // Continua processamento...
})
```

**Prioridade:** 1 (CRÍTICO - Corrigir ANTES do deploy)

---

### 🚨 [CRÍTICO-3] Arquivo .env com Credenciais Reais Commitado

**Arquivo:** `prapassar-app/.env`

**Descrição:**
O arquivo `.env` contém credenciais reais de produção e está presente no repositório. Isso expõe:
- URL e chave do Supabase
- API key do Google Gemini (AIzaSyAPTgb4qgQQRGWtpJ5Vf51CUeOvXADYc58)
- API key de produção do Asaas ($aact_prod_...)

**Conteúdo exposto:**
```bash
SUPABASE_URL=https://ubeivchkuoptmhkcglny.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_AI_API_KEY=AIzaSyAPTgb4qgQQRGWtpJ5Vf51CUeOvXADYc58
ASAAS_API_KEY=$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY...
```

**Impacto:**
- **CRÍTICO:** Qualquer pessoa com acesso ao repositório tem acesso total:
  - Banco de dados Supabase (ler/escrever dados de usuários)
  - API do Google Gemini (gerar custos)
  - Gateway de pagamento Asaas (criar/cancelar assinaturas, reembolsos)
- Se o repositório for público ou vazado: Catástrofe total
- Violação de LGPD: Exposição de dados pessoais

**Correção IMEDIATA:**

1. **Remover .env do repositório:**
```bash
cd prapassar-app
git rm --cached .env
git commit -m "Remove .env from repository"
```

2. **Garantir que .gitignore está correto:**
```bash
# .gitignore já deve ter:
.env
.env.*
!.env.example
```

3. **ROTACIONAR TODAS AS CREDENCIAIS:**
   - ✅ Gerar nova API key no Google Cloud Console
   - ✅ Gerar nova API key no Asaas
   - ✅ Regenerar chaves do Supabase (se possível)
   - ✅ Atualizar variáveis de ambiente na Vercel/produção

4. **Criar .env.example:**
```bash
# .env.example
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here
ASAAS_API_KEY=your_asaas_api_key_here
ASAAS_BASE_URL=https://api.asaas.com/v3
```

**Prioridade:** 1 (CRÍTICO - Corrigir AGORA, ANTES de qualquer commit/push)

---

### 🚨 [CRÍTICO-4] Sem Rate Limiting em Endpoints Críticos

**Arquivos:** Todos os endpoints em `server/api/`

**Descrição:**
Nenhum endpoint tem rate limiting implementado. Isso permite:
- Brute force em login
- Abuso de endpoints de IA (custo financeiro)
- Ataques DDoS
- Spam de registros

**Impacto:**
- **CRÍTICO:** Atacantes podem:
  - Fazer milhares de chamadas à API do Gemini (custo $$$$)
  - Criar milhares de contas falsas
  - Tentar brute force de senhas
  - Derrubar o servidor com requisições

**Correção:**
```typescript
// server/middleware/rate-limit.ts
import { defineEventHandler } from 'h3'

const rateLimits = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler((event) => {
  const path = event.path

  // Aplicar apenas em endpoints específicos
  const protectedPaths = [
    '/api/subscriptions/create',
    '/api/mindmaps/generate-from-text',
    '/api/affiliates/register'
  ]

  if (!protectedPaths.some(p => path.startsWith(p))) {
    return
  }

  const ip = getRequestIP(event) || 'unknown'
  const key = `${ip}:${path}`
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minuto
  const maxRequests = 10 // 10 requisições por minuto

  const limit = rateLimits.get(key)

  if (!limit || now > limit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (limit.count >= maxRequests) {
    throw createError({
      statusCode: 429,
      message: 'Too many requests. Please try again later.'
    })
  }

  limit.count++
})
```

**Adicionar no nuxt.config.ts:**
```typescript
serverMiddleware: [
  '~/server/middleware/rate-limit.ts'
]
```

**Prioridade:** 1 (CRÍTICO - Implementar ANTES do deploy)

---

## 🔴 VULNERABILIDADES ALTAS

### 🔴 [ALTO-1] Logs com Dados Sensíveis e Console.logs em Produção

**Arquivos:** 25 arquivos com console.log

**Descrição:**
O código contém múltiplos `console.log` com dados sensíveis que vão para logs de produção:

**Exemplos:**
```typescript
// app/middleware/auth.ts:4-5
console.log('🔐 Auth Middleware - De:', from.path, '→ Para:', to.path)
console.log('🔐 Usuário:', user.value?.email || 'NÃO AUTENTICADO')  // ❌ Email do usuário

// server/api/webhooks/asaas.post.ts:8
console.log('Webhook Asaas recebido:', JSON.stringify(body, null, 2))  // ❌ Dados de pagamento

// server/api/mindmaps/index.post.ts:11-12
console.log('[CREATE-MINDMAP] User:', user ? user.id : 'Não autenticado')
```

**Impacto:**
- Vazamento de emails de usuários
- Exposição de dados de pagamento
- Vazamento de IDs internos
- Logs acessíveis por terceiros (Vercel, CloudWatch, etc.)

**Correção:**
1. Remover TODOS os console.log de produção
2. Usar sistema de logging apropriado (apenas em dev):
```typescript
const log = (msg: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(msg, data)
  }
}
```

**Prioridade:** 2 (ALTO - Corrigir em 24h)

---

### 🔴 [ALTO-2] Validação de Entrada Insuficiente nos Endpoints

**Arquivos:** Múltiplos endpoints

**Descrição:**
Os endpoints não validam tipos e formatos de entrada adequadamente. Exemplo:

```typescript
// server/api/subscriptions/create.post.ts:7-16
const {
  planId,
  customerData,
  paymentMethod,
  creditCardData,
  couponCode,
  affiliateId
} = body  // ❌ SEM VALIDAÇÃO DE TIPOS!

if (!planId || !customerData) {  // ❌ Validação superficial
  throw createError({ statusCode: 400, message: 'Dados incompletos' })
}
```

**Impacto:**
- Possível injeção de dados maliciosos
- Crash da aplicação com dados inválidos
- Bypass de validação

**Correção:**
Usar biblioteca de validação como Zod:

```typescript
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  customerData: z.object({
    name: z.string().min(3).max(100),
    email: z.string().email(),
    cpfCnpj: z.string().regex(/^\d{11}$|^\d{14}$/),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    // ...
  }),
  paymentMethod: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO']),
  creditCardData: z.object({
    holderName: z.string().min(3),
    number: z.string().regex(/^\d{13,19}$/),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expiryYear: z.string().regex(/^\d{2}$/),
    ccv: z.string().regex(/^\d{3,4}$/)
  }).optional(),
  couponCode: z.string().optional(),
  affiliateId: z.string().uuid().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // ✅ Validar com Zod
  const validated = createSubscriptionSchema.parse(body)

  // Usar 'validated' ao invés de 'body'
})
```

**Prioridade:** 2 (ALTO - Implementar validação em todos os endpoints)

---

### 🔴 [ALTO-3] Possível IDOR em Endpoints sem Verificação de Ownership

**Arquivo:** `server/api/mindmaps/[id].get.ts` (exemplo)

**Descrição:**
Embora o endpoint de DELETE verifique ownership, precisamos auditar TODOS os endpoints que recebem IDs:

**Padrão SEGURO encontrado:**
```typescript
// server/api/mindmaps/[id].delete.ts:25-29
const { error } = await supabase
  .from('mindmaps')
  .delete()
  .eq('id', id)
  .eq('user_id', user.id)  // ✅ Verifica ownership
```

**Possível vulnerabilidade:**
Precisamos verificar se TODOS os endpoints seguem este padrão.

**Verificar endpoints:**
- `/api/mindmaps/[id].get.ts`
- `/api/mindmaps/[id].put.ts`
- Todos os endpoints de afiliados
- Endpoints de assinaturas

**Correção:**
SEMPRE adicionar `.eq('user_id', user.id)` em queries:

```typescript
// ❌ VULNERÁVEL
const { data } = await supabase
  .from('notebooks')
  .select('*')
  .eq('id', notebookId)

// ✅ SEGURO
const { data } = await supabase
  .from('notebooks')
  .select('*')
  .eq('id', notebookId)
  .eq('user_id', user.id)
```

**Prioridade:** 2 (ALTO - Auditar TODOS os endpoints)

---

### 🔴 [ALTO-4] Sem Validação de Subscription/Plan em Features Pagas

**Descrição:**
Não há middleware validando se usuário tem plano PRO antes de acessar features de IA.

**Impacto:**
Usuários freemium podem acessar features PRO ao chamar diretamente a API.

**Correção:**
```typescript
// server/middleware/check-ai-access.ts
export default defineEventHandler(async (event) => {
  const path = event.path

  // Features que requerem Pro
  const proFeatures = [
    '/api/mindmaps/generate-from-text',
    '/api/ai/'
  ]

  if (!proFeatures.some(p => path.startsWith(p))) {
    return
  }

  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabase = await serverSupabaseClient(event)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', user.id)
    .in('status', ['active', 'trial'])
    .single()

  const hasAiAccess = subscription?.subscription_plans?.ai_enabled === true

  if (!hasAiAccess) {
    throw createError({
      statusCode: 403,
      message: 'AI features require Pro plan'
    })
  }
})
```

**Prioridade:** 2 (ALTO)

---

### 🔴 [ALTO-5] Middleware de Auth Não Protege Todas as Rotas

**Arquivo:** `app/middleware/auth.ts`

**Descrição:**
O middleware client-side não protege rotas como `/forgot-password`, `/precos`, `/checkout`.

```typescript
// app/middleware/auth.ts:8
if (!user.value && to.path !== '/login' && to.path !== '/register'
    && to.path !== '/' && to.path !== '/confirm') {
  // ❌ Faltam: /forgot-password, /precos, /checkout
  return navigateTo('/login')
}
```

**Correção:**
```typescript
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/confirm',
  '/forgot-password',
  '/precos',
  '/checkout'
]

if (!user.value && !publicRoutes.includes(to.path)) {
  return navigateTo('/login')
}
```

**Prioridade:** 2 (ALTO)

---

### 🔴 [ALTO-6] Dados de Cartão de Crédito Transitando pela API

**Arquivo:** `server/api/subscriptions/create.post.ts:183-189`

**Descrição:**
Dados de cartão de crédito (número, CVV, etc.) transitam pelo servidor da aplicação antes de ir para o Asaas.

```typescript
creditCard: {
  holderName: creditCardData.holderName,
  number: creditCardData.number,  // ❌ Número do cartão no servidor
  expiryMonth: creditCardData.expiryMonth,
  expiryYear: creditCardData.expiryYear,
  ccv: creditCardData.ccv  // ❌ CVV no servidor
}
```

**Impacto:**
- Conformidade PCI-DSS: Violação de requisitos
- Responsabilidade: Empresa é responsável por vazamento
- Logs: Dados de cartão podem ficar em logs

**Correção:**
Usar tokenização client-side do Asaas:
1. Integrar SDK do Asaas no front-end
2. Tokenizar cartão no cliente
3. Enviar apenas token para o servidor

**Prioridade:** 2 (ALTO - Requisito de conformidade)

---

## 🟡 VULNERABILIDADES MÉDIAS

### 🟡 [MÉDIO-1] Sem Headers de Segurança (CSP, HSTS, X-Frame-Options)

**Arquivo:** `nuxt.config.ts`

**Descrição:**
Aplicação não configura headers de segurança importantes.

**Correção:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ...
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com"
        ].join('; ')
      }
    }
  }
})
```

**Prioridade:** 3 (MÉDIO)

---

### 🟡 [MÉDIO-2] Sem CORS Configurado

**Descrição:**
Não há configuração explícita de CORS, podendo permitir origens indesejadas.

**Correção:**
```typescript
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  const allowedOrigins = [
    'https://prapassar.com.br',
    'https://www.prapassar.com.br'
  ]

  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000')
  }

  const origin = getHeader(event, 'origin')

  if (origin && allowedOrigins.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
  }

  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})
```

**Prioridade:** 3 (MÉDIO)

---

### 🟡 [MÉDIO-3] SQL Injection via Supabase Raw Queries

**Arquivos:** Uso de `supabase.raw()`

**Exemplo encontrado:**
```typescript
// server/api/webhooks/asaas.post.ts:156
total_paid: supabase.raw(`total_paid + ${payment.amount}`)
```

**Impacto:**
Se `payment.amount` vier de fonte não confiável, pode causar SQL injection.

**Correção:**
Usar queries parametrizadas:
```typescript
.update({
  total_paid: supabase.rpc('increment_total_paid', {
    amount: payment.amount
  })
})
```

**Prioridade:** 3 (MÉDIO)

---

### 🟡 [MÉDIO-4] Timeout Não Configurado em Chamadas de IA

**Descrição:**
Chamadas ao Google Gemini podem travar indefinidamente.

**Correção:**
```typescript
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 30000) // 30s

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ...
  })
} finally {
  clearTimeout(timeout)
}
```

**Prioridade:** 3 (MÉDIO)

---

### 🟡 [MÉDIO-5 a MÉDIO-8] Outras Vulnerabilidades

- **MÉDIO-5:** XSS possível em campos de texto user-generated (notebooks, tasks)
- **MÉDIO-6:** Sessões Supabase sem timeout configurado
- **MÉDIO-7:** Sem backup automático do banco de dados
- **MÉDIO-8:** Error messages verbosos expõem estrutura interna

**Prioridade:** 3-4 (MÉDIO/BAIXO)

---

## 🔵 VULNERABILIDADES BAIXAS

### 🔵 [BAIXO-1 a BAIXO-12]

1. Dependências desatualizadas (rodar `npm audit`)
2. Sem versionamento de API
3. Sem documentação de API (Swagger/OpenAPI)
4. Sem testes de segurança automatizados
5. Sem monitoramento de anomalias
6. Sem 2FA para usuários
7. Sem política de senha forte
8. Sem honeypot em formulários
9. Sem CAPTCHA em registro
10. Logs não centralizados
11. Sem alertas de segurança
12. Código minificado em produção não configurado

**Prioridade:** 5 (BAIXO - Backlog)

---

## ✅ CHECKLIST FINAL (ANTES DO DEPLOY)

### Deploy Blockers (Devem estar ✅ para permitir deploy)

- [ ] ❌ CRÍTICO-1: Google AI Key movida para private
- [ ] ❌ CRÍTICO-2: Webhook signature validation implementada
- [ ] ❌ CRÍTICO-3: .env removido e credenciais rotacionadas
- [ ] ❌ CRÍTICO-4: Rate limiting implementado
- [ ] ❌ ALTO-1: Console.logs removidos
- [ ] ❌ ALTO-2: Validação Zod em endpoints críticos
- [ ] ❌ ALTO-3: Auditoria IDOR completa
- [ ] ❌ ALTO-4: Middleware de subscription check

### High Priority (Corrigir em 24-48h após deploy)

- [ ] ❌ ALTO-5: Middleware auth completo
- [ ] ❌ ALTO-6: Tokenização de cartão client-side
- [ ] ❌ MÉDIO-1: Security headers
- [ ] ❌ MÉDIO-2: CORS policy

### Medium/Low Priority (Corrigir em 1-2 semanas)

- [ ] ❌ MÉDIO-3: SQL injection review
- [ ] ❌ MÉDIO-4: Timeouts em IA
- [ ] ❌ Demais vulnerabilidades médias/baixas

---

## 📊 ANÁLISE DE IMPACTO FINANCEIRO

### Cenário de Ataque - Google AI Key Exposta

**Custos estimados se explorada:**

| Modelo | Custo por 1M tokens | Requisições/dia | Custo/dia | Custo/mês |
|--------|---------------------|-----------------|-----------|-----------|
| Gemini Pro | $0.50 | 100.000 | $50 | $1.500 |
| Gemini Pro (abuse) | $0.50 | 1.000.000 | $500 | $15.000 |

**Cenário realista:** $5.000 - $15.000 de prejuízo antes de detectar

### Cenário de Ataque - Webhook Falso

**Impacto estimado:**

- 100 assinaturas PRO fraudadas = R$ 4.490/mês de perda
- 50 comissões de afiliados pagas indevidamente = R$ 500-2.000
- **Total:** R$ 5.000 - R$ 6.000/mês até detectar

---

## 🎯 PLANO DE AÇÃO RECOMENDADO

### Fase 1 - URGENTE (Antes do Deploy) ⏰ 4-6 horas

1. **[1h]** Mover Google AI Key para private config
2. **[2h]** Implementar validação de webhook signature
3. **[1h]** Remover .env e rotacionar credenciais
4. **[2h]** Implementar rate limiting básico

### Fase 2 - Crítica (Primeiras 24h) ⏰ 6-8 horas

5. **[2h]** Remover todos console.logs sensíveis
6. **[4h]** Adicionar validação Zod em endpoints críticos
7. **[2h]** Auditar todos endpoints para IDOR

### Fase 3 - Alta Prioridade (Primeira semana) ⏰ 8-12 horas

8. **[3h]** Implementar middleware de subscription check
9. **[2h]** Completar middleware de autenticação
10. **[3h]** Integrar tokenização client-side de cartão
11. **[2h]** Adicionar security headers
12. **[2h]** Configurar CORS policy

### Fase 4 - Melhorias Contínuas (Semanas 2-4)

13. Implementar testes de segurança automatizados
14. Configurar monitoramento e alertas
15. Adicionar 2FA
16. Documentar APIs
17. Configurar backups automáticos

---

## 📞 RECOMENDAÇÕES FINAIS

### ⛔ NÃO FAZER DEPLOY ATÉ:

1. ✅ Todas as vulnerabilidades CRÍTICAS estarem corrigidas
2. ✅ Credenciais rotacionadas
3. ✅ Teste de segurança básico realizado

### ✅ APÓS CORREÇÕES:

1. Fazer deploy em ambiente de staging primeiro
2. Testar todos os fluxos críticos
3. Validar webhooks com dados reais do Asaas
4. Monitorar logs por 48h antes de anunciar

### 🔒 SEGURANÇA CONTÍNUA:

1. Agendar auditorias mensais
2. Manter dependências atualizadas (`npm audit`)
3. Revisar logs semanalmente
4. Implementar bug bounty após estabilização

---

**Auditoria realizada em:** 2025-10-16
**Próxima auditoria recomendada:** 2025-11-16
**Contato para dúvidas:** security@prapassar.com.br

---

## 📚 REFERÊNCIAS E RECURSOS

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Nuxt Security Best Practices](https://nuxt.com/docs/guide/going-further/security)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PCI-DSS Compliance](https://www.pcisecuritystandards.org/)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

**🔐 End of Security Audit Report**

# Sistema de Pagamento - Guia de Configuração

Este documento descreve o sistema completo de pagamento e assinaturas integrado com Asaas.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Planos](#estrutura-de-planos)
3. [Configuração Inicial](#configuração-inicial)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [API Endpoints](#api-endpoints)
6. [Páginas Frontend](#páginas-frontend)
7. [Webhooks](#webhooks)
8. [Controle de Acesso](#controle-de-acesso)
9. [Testes](#testes)

## 🎯 Visão Geral

O sistema implementa:
- ✅ Dois planos de assinatura (Plus e Pro)
- ✅ Trial de 14 dias para o Plano Pro
- ✅ Integração completa com Asaas API
- ✅ Webhooks para atualização automática de status
- ✅ Sistema de controle de acesso baseado em plano
- ✅ Gerenciamento de assinaturas (upgrade/downgrade/cancelamento)
- ✅ Histórico de pagamentos

## 💳 Estrutura de Planos

### Plano Plus - R$ 24,90/mês
- Acesso completo à plataforma
- Caderno de estudos
- Timer Pomodoro
- Calendário
- Flashcards
- Relatórios
- **SEM** recursos de IA

### Plano Pro - R$ 44,90/mês
- Todos os recursos do Plus
- **14 dias de trial grátis**
- Assistente de IA
- Gerador de resumos com IA
- Gerador de questões com IA
- Gerador de flashcards com IA
- Chat com IA
- Análises preditivas

## ⚙️ Configuração Inicial

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Asaas Payment Gateway
ASAAS_API_KEY=your_asaas_api_key
ASAAS_BASE_URL=https://api.asaas.com/v3
ASAAS_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Obter Credenciais Asaas

1. Acesse [Asaas](https://www.asaas.com/)
2. Crie uma conta ou faça login
3. Vá em **Configurações → Integrações → API**
4. Copie sua **API Key**
5. Configure os **Webhooks** (veja seção Webhooks)

### 3. Executar Migration do Banco

Execute o script SQL para criar as tabelas necessárias:

```bash
psql -h [host] -p [port] -U [user] -d [database] -f scripts/payment-schema.sql
```

Ou através do Supabase Dashboard:
1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo de `scripts/payment-schema.sql`
4. Execute

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `subscription_plans`
Armazena os planos disponíveis (Plus e Pro)

#### `asaas_customers`
Vincula usuários do sistema com clientes no Asaas

#### `subscriptions`
Gerencia assinaturas ativas/inativas dos usuários

#### `payments`
Histórico de todos os pagamentos

#### `asaas_webhooks`
Log de webhooks recebidos do Asaas

#### `subscription_changes`
Histórico de mudanças de plano (upgrade/downgrade)

### Funções Úteis

```sql
-- Verificar se usuário tem acesso a IA
SELECT user_has_ai_access('user_uuid');

-- Verificar se usuário tem assinatura ativa
SELECT user_has_active_subscription('user_uuid');

-- Obter plano atual do usuário
SELECT * FROM get_user_current_plan('user_uuid');
```

## 🔌 API Endpoints

### Planos

```
GET /api/subscriptions/plans
```
Retorna lista de planos disponíveis

### Assinaturas

```
POST /api/subscriptions/create
Body: {
  planId: string,
  customerData: {
    name: string,
    email: string,
    cpfCnpj: string,
    phone: string,
    address: string,
    addressNumber: string,
    province: string,
    postalCode: string
  },
  paymentMethod: 'CREDIT_CARD' | 'BOLETO' | 'PIX',
  creditCardData?: {
    holderName: string,
    number: string,
    expiryMonth: string,
    expiryYear: string,
    ccv: string
  }
}
```
Cria nova assinatura

```
GET /api/subscriptions/current
```
Retorna assinatura atual do usuário autenticado

```
POST /api/subscriptions/cancel
Body: {
  subscriptionId: string,
  cancelAtPeriodEnd: boolean,
  reason?: string
}
```
Cancela assinatura

```
POST /api/subscriptions/change-plan
Body: {
  newPlanId: string
}
```
Altera plano (upgrade/downgrade)

```
GET /api/subscriptions/payments?limit=10&offset=0
```
Lista histórico de pagamentos

## 🎨 Páginas Frontend

### `/precos`
Landing page com comparação de planos e FAQ

### `/checkout?plan=plus|pro`
Formulário completo de checkout com:
- Dados pessoais
- Endereço
- Método de pagamento
- Resumo do pedido

### `/assinatura`
Painel do usuário para:
- Visualizar plano atual
- Ver próxima cobrança
- Histórico de pagamentos
- Alterar plano
- Cancelar assinatura

## 🔔 Webhooks

### Configuração no Asaas

1. Acesse **Configurações → Webhooks**
2. Adicione nova URL: `https://seu-dominio.com/api/webhooks/asaas`
3. Selecione eventos:
   - PAYMENT_CREATED
   - PAYMENT_UPDATED
   - PAYMENT_CONFIRMED
   - PAYMENT_RECEIVED
   - PAYMENT_OVERDUE
   - PAYMENT_DELETED
   - PAYMENT_RESTORED
   - PAYMENT_REFUNDED

### Eventos Tratados

- **PAYMENT_CONFIRMED/RECEIVED**: Ativa assinatura
- **PAYMENT_OVERDUE**: Marca assinatura como vencida
- **PAYMENT_REFUNDED**: Atualiza status

### URL do Webhook
```
POST /api/webhooks/asaas
```

## 🔒 Controle de Acesso

### Middleware

O sistema inclui middleware automático que:
- Verifica assinatura ativa
- Adiciona informações ao contexto da requisição
- Permite controle granular de recursos

### Composable `useSubscription`

```typescript
const {
  currentSubscription,      // Assinatura atual
  hasActiveSubscription,    // Boolean
  hasAiAccess,             // Boolean
  isInTrial,               // Boolean
  trialDaysRemaining,      // Number
  currentPlanName,         // String
  subscriptionStatus,      // String
  nextBillingDate,         // Date
  requireAiAccess,         // Função que bloqueia se não tiver IA
  requireActiveSubscription, // Função que bloqueia se não tiver assinatura
  createSubscription,      // Função
  cancelSubscription,      // Função
  changePlan              // Função
} = useSubscription()
```

### Exemplo de Uso

```vue
<script setup>
const { hasAiAccess, requireAiAccess } = useSubscription()

const handleAIFeature = () => {
  try {
    requireAiAccess() // Lança erro se não tiver acesso
    // ... código da feature de IA
  } catch (error) {
    alert(error.message) // "Você precisa do Plano Pro para acessar recursos de IA"
  }
}
</script>
```

## 🧪 Testes

### 1. Testar Criação de Assinatura

```bash
# Modo sandbox do Asaas
# Use cartões de teste:
# - Aprovado: 5162306219378829
# - Recusado: 5162306219378837
```

### 2. Testar Webhooks Localmente

Use ferramentas como ngrok para expor localhost:

```bash
ngrok http 3000
```

Copie a URL gerada e configure no Asaas.

### 3. Testar Planos

1. Crie conta no sistema
2. Vá em `/precos`
3. Selecione um plano
4. Complete o checkout
5. Verifique se assinatura foi criada em `/assinatura`

## 📝 Notas Importantes

### Segurança

- ✅ Todas as transações são processadas pelo Asaas (PCI DSS compliant)
- ✅ Dados de cartão nunca são armazenados no banco
- ✅ Webhooks devem validar assinatura (implementar `verifyWebhookSignature`)
- ✅ Endpoints protegidos por autenticação

### Trial

- Trial de 14 dias **sem cobrança de cartão**
- Usuário pode testar todas as features do Pro
- Após 14 dias, primeira cobrança é gerada
- Status muda de 'trial' para 'active' após primeiro pagamento

### Cancelamento

- Por padrão, cancela **ao final do período pago**
- Usuário continua com acesso até data de vencimento
- Pode ser cancelado imediatamente se necessário

### Upgrade/Downgrade

- Mudanças são processadas imediatamente
- Nova assinatura é criada no Asaas
- Assinatura antiga é cancelada
- Próxima cobrança será do novo plano

## 🚀 Próximos Passos

1. Configure suas credenciais do Asaas
2. Execute as migrations do banco
3. Configure os webhooks no Asaas
4. Teste o fluxo completo em ambiente de sandbox
5. Configure domínio e SSL para produção
6. Ative modo produção no Asaas

## 📞 Suporte

Para dúvidas sobre:
- **Asaas**: https://ajuda.asaas.com/
- **Sistema**: contato@concurseiro.com

## 📄 Documentação Adicional

- [Asaas API Docs](https://docs.asaas.com/)
- [Nuxt 3 Docs](https://nuxt.com/)
- [Supabase Docs](https://supabase.com/docs)

# Sistema de Afiliados - Concurseiro App

Sistema completo de afiliados integrado ao SaaS de organização de estudos.

## 📋 Funcionalidades Implementadas

### 1. Cadastro de Afiliados
- ✅ Formulário de cadastro em `/afiliado-cadastro`
- ✅ Validação de disponibilidade de cupom em tempo real
- ✅ Geração automática de link de rastreamento
- ✅ Validação de CPF para recebimento de pagamentos

### 2. Sistema de Comissões
- ✅ Cupom dá 20% de desconto permanente para clientes
- ✅ Afiliado recebe 20% sobre valor pago pelo cliente
- ✅ Comissão recorrente em todas as renovações
- ✅ Liberação imediata após confirmação de pagamento
- ✅ Registro automático via webhook

### 3. Trial e Pagamentos
- ✅ 14 dias grátis para plano Pro
- ✅ Primeira cobrança no dia 15 (trial)
- ✅ Renovações mensais automáticas
- ✅ Sistema de bloqueio após vencimento

### 4. Painel do Afiliado (`/afiliado`)
- ✅ Métricas de desempenho
- ✅ Saldo disponível para saque
- ✅ Lista de clientes (trial, ativos, cancelados)
- ✅ Histórico de comissões
- ✅ Histórico de saques
- ✅ Cupom e link para compartilhamento

### 5. Sistema de Saques
- ✅ Saque mínimo de R$ 50,00
- ✅ Solicitação com CPF e chave PIX
- ✅ Status: Pendente → Aprovado → Pago
- ✅ Histórico completo

### 6. Painel Administrativo (`/admin-afiliados`)
- ✅ Acesso exclusivo: mariocromia@gmail.com
- ✅ Lista de todos afiliados e métricas
- ✅ Gerenciamento de saques
- ✅ Aprovar/rejeitar/marcar como pago
- ✅ Estatísticas gerais

### 7. Integração com Checkout
- ✅ Campo de cupom na página de checkout
- ✅ Validação em tempo real
- ✅ Aplicação automática de desconto
- ✅ Rastreamento via link (query param `?ref=CUPOM`)
- ✅ Registro automático de referral

## 🗄️ Estrutura do Banco de Dados

Execute o script SQL para criar todas as tabelas necessárias:

```bash
psql -h [HOST] -p [PORT] -U [USER] -d [DATABASE] -f scripts/affiliate-schema.sql
```

### Tabelas Criadas:
1. **affiliates** - Dados dos afiliados
2. **affiliate_referrals** - Clientes referidos
3. **affiliate_commissions** - Comissões geradas
4. **affiliate_withdrawals** - Solicitações de saque
5. **affiliate_coupons** - Cupons ativos
6. **affiliate_clicks** - Rastreamento de cliques

## 🚀 APIs Disponíveis

### Afiliados

#### Cadastro
```
POST /api/affiliates/register
Body: { coupon_code: string, cpf: string }
```

#### Verificar cupom
```
POST /api/affiliates/check-coupon
Body: { coupon_code: string }
```

#### Validar cupom
```
POST /api/affiliates/validate-coupon
Body: { coupon_code: string }
```

#### Estatísticas
```
GET /api/affiliates/stats
Auth: Required
```

#### Solicitar saque
```
POST /api/affiliates/withdraw
Body: { amount: number, cpf: string, pix_key?: string }
Auth: Required
```

#### Rastrear clique
```
POST /api/affiliates/track-click
Body: { ref_code: string }
```

### Administrativo

#### Listar afiliados
```
GET /api/admin/affiliates/list
Auth: Required (admin)
```

#### Listar saques
```
GET /api/admin/affiliates/withdrawals
Auth: Required (admin)
```

#### Processar saque
```
POST /api/admin/affiliates/withdraw-approve
Body: {
  withdrawal_id: string,
  action: 'approve' | 'reject' | 'mark_paid',
  rejection_reason?: string
}
Auth: Required (admin)
```

## 📊 Fluxo de Funcionamento

### 1. Cadastro de Afiliado
```
Usuário → /afiliado-cadastro
         → Preenche cupom + CPF
         → Sistema valida disponibilidade
         → Cria afiliado + cupom + link
         → Email de confirmação (TODO)
```

### 2. Cliente Usa Cupom
```
Cliente → Acessa /checkout?ref=CUPOM ou digita cupom
        → Sistema valida cupom
        → Aplica 20% de desconto
        → Cria assinatura com desconto
        → Registra referral (status: trial ou active)
```

### 3. Pagamento Confirmado
```
Webhook Asaas → PAYMENT_CONFIRMED
              → Atualiza pagamento
              → Atualiza assinatura (active)
              → Atualiza referral (active)
              → Cria comissão (20% sobre valor pago)
              → Comissão disponível imediatamente
```

### 4. Renovação Mensal
```
Asaas → Cria novo pagamento mensal (com desconto)
      → Cliente paga
      → Webhook confirma pagamento
      → Nova comissão criada automaticamente
      → Afiliado ganha recorrentemente
```

### 5. Solicitação de Saque
```
Afiliado → /afiliado → Solicitar Saque
         → Informa valor + CPF + PIX
         → Sistema valida saldo
         → Cria solicitação (status: pending)
         → Atualiza comissões (status: withdrawn)
```

### 6. Processamento de Saque
```
Admin → /admin-afiliados → Saques
      → Aprova solicitação
      → Realiza PIX manualmente
      → Marca como pago
      → Sistema atualiza saldos
```

## 🔄 Cálculos de Comissão

### Exemplo 1: Plano Plus (R$ 24,90)
- Preço normal: R$ 24,90
- Com cupom 20%: R$ 19,92 (cliente paga)
- Comissão afiliado: R$ 3,98 (20% de R$ 19,92)

### Exemplo 2: Plano Pro (R$ 44,90)
- Preço normal: R$ 44,90
- Com cupom 20%: R$ 35,92 (cliente paga)
- Comissão afiliado: R$ 7,18 (20% de R$ 35,92)

## 🎯 Regras Importantes

1. **Trial**: Se cliente cancela durante trial (antes de pagar), afiliado não ganha nada
2. **Cancelamento**: Se cliente paga e depois cancela, afiliado mantém comissões já recebidas
3. **Sem cupom**: Cadastros sem cupom/link não geram comissão
4. **Desconto permanente**: Cliente mantém 20% de desconto em todas renovações
5. **Comissão recorrente**: Afiliado ganha 20% em cada renovação mensal

## 📱 Páginas Criadas

1. **`/afiliado-cadastro`** - Cadastro de novo afiliado
2. **`/afiliado`** - Painel do afiliado
3. **`/admin-afiliados`** - Painel administrativo
4. **`/checkout`** - Atualizado com campo de cupom

## 🔐 Permissões

### Admin
- Email: mariocromia@gmail.com
- Acesso a `/admin-afiliados`
- Pode aprovar/rejeitar/pagar saques
- Visualiza todos afiliados

### Afiliado
- Qualquer usuário logado pode se cadastrar
- Acesso a `/afiliado` e `/afiliado-cadastro`
- Visualiza apenas seus dados

## 📧 TODOs - Emails (Não Implementado)

Os seguintes emails devem ser configurados:

1. **Email de boas-vindas ao afiliado**
   - Enviado após cadastro aprovado
   - Contém cupom e link de rastreamento

2. **Email de nova comissão**
   - Enviado quando pagamento é confirmado
   - Informa valor da comissão

3. **Email de saque solicitado**
   - Para admin quando afiliado solicita saque
   - Contém dados para PIX

4. **Email de saque processado**
   - Para afiliado quando saque é aprovado/rejeitado/pago
   - Informa status e motivo (se rejeitado)

## 🧪 Testando o Sistema

### 1. Criar Afiliado
```
1. Acesse /afiliado-cadastro
2. Digite um cupom único (ex: MEUTEST)
3. Digite CPF válido
4. Cadastre
```

### 2. Usar Cupom
```
1. Acesse /checkout?ref=MEUTEST
   OU
   Digite MEUTEST no campo de cupom
2. Preencha dados
3. Finalize assinatura
```

### 3. Simular Pagamento
```
Você precisará simular webhook do Asaas:
POST /api/webhooks/asaas
Body: {
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_xxxxx",
    "status": "CONFIRMED",
    ...
  }
}
```

### 4. Verificar Comissão
```
1. Acesse /afiliado
2. Veja comissão criada
3. Solicite saque (mínimo R$ 50)
```

### 5. Aprovar Saque (Admin)
```
1. Acesse /admin-afiliados
2. Aba "Saques"
3. Aprove → Marque como pago
```

## 🔧 Configuração do Asaas

Certifique-se de configurar no Asaas:

1. **Webhook URL**: `https://seudominio.com/api/webhooks/asaas`
2. **Eventos ativos**:
   - PAYMENT_CREATED
   - PAYMENT_CONFIRMED
   - PAYMENT_RECEIVED
   - PAYMENT_OVERDUE

## 📊 Métricas Disponíveis

### Painel do Afiliado
- Saldo disponível
- Total ganho
- Total sacado
- Clientes em trial
- Clientes ativos
- Clientes cancelados
- Taxa de conversão
- Total de cliques

### Painel Admin
- Total de afiliados
- Total pago em comissões
- Saques pendentes
- Performance por afiliado
- Conversões e tentativas

## 🚨 Importante

- Antes de usar em produção, teste completamente o fluxo
- Configure os emails de notificação
- Ajuste o link de rastreamento em `affiliate-schema.sql` (linha 124)
- Certifique-se de que o webhook do Asaas está configurado
- Valide as políticas RLS do Supabase

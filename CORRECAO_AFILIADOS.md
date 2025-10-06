# Correção do Sistema de Afiliados

## Problema Identificado

Erro ao validar cupom devido a políticas RLS (Row Level Security) muito restritivas.

## Correções Realizadas

### 1. APIs Corrigidas

#### [validate-coupon.post.ts](server/api/affiliates/validate-coupon.post.ts)
- ✅ Removida dependência de relacionamentos complexos
- ✅ Consultas separadas para cupom e afiliado
- ✅ Retorna objeto com `valid` e `message` ao invés de lançar erro
- ✅ Melhor tratamento de erros

#### [checkout.vue](app/pages/checkout.vue)
- ✅ Usa `$fetch` ao invés de `useFetch` para melhor controle
- ✅ Verifica `response.valid` corretamente
- ✅ Exibe mensagens de erro apropriadas

#### [afiliado-cadastro.vue](app/pages/afiliado-cadastro.vue)
- ✅ Melhor tratamento de resposta da API
- ✅ Tipagem correta do erro

### 2. Políticas RLS Atualizadas

Execute o script SQL para corrigir as políticas:

```bash
PGPASSWORD='Mario@1410' psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.qpzgsqjnbvsluwdvmftu -d postgres -f scripts/fix-affiliate-rls.sql
```

#### Políticas Criadas:

1. **affiliate_coupons**
   - ✅ Qualquer pessoa pode visualizar cupons ativos
   - ✅ Afiliados podem criar seus próprios cupons

2. **affiliates**
   - ✅ Qualquer pessoa pode visualizar afiliados ativos (apenas para validação)
   - ✅ Usuários podem visualizar seus próprios dados
   - ✅ Usuários podem se cadastrar como afiliados
   - ✅ Usuários podem atualizar seus próprios dados

3. **affiliate_clicks**
   - ✅ Qualquer pessoa pode registrar cliques (para rastreamento)

## Como Testar

### 1. Executar Scripts SQL

```bash
# Primeiro, execute o schema principal (se ainda não executou)
PGPASSWORD='Mario@1410' psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.qpzgsqjnbvsluwdvmftu -d postgres -f scripts/affiliate-schema.sql

# Depois, execute as correções
PGPASSWORD='Mario@1410' psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.qpzgsqjnbvsluwdvmftu -d postgres -f scripts/fix-affiliate-rls.sql
```

### 2. Testar Cadastro de Afiliado

1. Acesse `/afiliado-cadastro`
2. Digite um cupom único (ex: `TESTE123`)
3. Digite um CPF válido
4. Clique em "Cadastrar como Afiliado"
5. ✅ Deve mostrar sucesso e exibir cupom + link

### 3. Testar Validação de Cupom

1. Acesse `/checkout?plan=pro`
2. No campo "Cupom de Desconto", digite o cupom criado (ex: `TESTE123`)
3. Clique em "Aplicar"
4. ✅ Deve mostrar "✓ Cupom aplicado! Desconto de 20%"
5. ✅ O resumo deve mostrar desconto aplicado

### 4. Testar Link de Afiliado

1. Acesse `/checkout?ref=TESTE123`
2. ✅ Cupom deve ser aplicado automaticamente
3. ✅ Deve mostrar desconto no resumo

### 5. Verificar Menu do Avatar

1. Clique no avatar do usuário
2. ✅ Se NÃO for afiliado: deve mostrar "Tornar-se Afiliado"
3. ✅ Se FOR afiliado: deve mostrar "Painel de Afiliado"
4. ✅ Se for admin (mariocromia@gmail.com): deve mostrar "Admin Afiliados"

## Estrutura de Resposta das APIs

### `/api/affiliates/validate-coupon`

**Sucesso:**
```json
{
  "valid": true,
  "coupon": {
    "code": "TESTE123",
    "discount_percentage": 20.00,
    "affiliate_id": "uuid-do-afiliado"
  }
}
```

**Erro:**
```json
{
  "valid": false,
  "message": "Cupom inválido ou não encontrado"
}
```

### `/api/affiliates/check-coupon`

**Disponível:**
```json
{
  "available": true,
  "message": "Cupom disponível"
}
```

**Indisponível:**
```json
{
  "available": false,
  "message": "Cupom já está em uso"
}
```

### `/api/affiliates/register`

**Sucesso:**
```json
{
  "success": true,
  "affiliate": {
    "id": "uuid",
    "coupon_code": "TESTE123",
    "tracking_link": "https://seuapp.com/register?ref=TESTE123",
    ...
  },
  "message": "Cadastro de afiliado realizado com sucesso!"
}
```

## Logs Úteis

Para depuração, verifique os logs no console:
- API: `console.error('Erro ao validar cupom:', error)`
- Frontend: Erros aparecem na mensagem de erro da UI

## Próximos Passos

1. ✅ Executar scripts SQL
2. ✅ Testar fluxo completo
3. ⏳ Configurar emails de notificação
4. ⏳ Ajustar domínio do link de rastreamento
5. ⏳ Testar webhooks do Asaas em produção

# 🔧 Resolver Erro: "column asaas_subscription_id does not exist"

## ❌ O Problema

Você já tem uma tabela `subscriptions` antiga (do sistema de estudos) que não tem as colunas necessárias para o sistema de pagamentos.

## ✅ Solução Rápida

### Opção 1: Usar Script de Correção (RECOMENDADO)

1. **Abra o Supabase Dashboard**
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá no SQL Editor**
   - Menu lateral → SQL Editor → New query

3. **Copie e cole o conteúdo do arquivo:**
   ```
   scripts/fix-payment-migration.sql
   ```

4. **Clique em RUN**

5. **Pronto!** ✅

Este script:
- ✅ Remove as tabelas antigas de pagamento
- ✅ Cria a função `update_updated_at_column` se não existir
- ✅ Cria todas as tabelas novas corretamente
- ✅ Insere os 2 planos (Plus e Pro)

---

### Opção 2: Executar Comandos Separados

Se preferir fazer manualmente:

#### PASSO 1: Remover tabelas antigas

No SQL Editor do Supabase, execute:

```sql
DROP TABLE IF EXISTS asaas_webhooks CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscription_changes CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS asaas_customers CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
```

#### PASSO 2: Criar função auxiliar

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### PASSO 3: Executar o payment-schema.sql

Agora copie e cole todo o conteúdo de:
```
scripts/payment-schema.sql
```

E execute!

---

## 🔍 Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'subscription_plans',
  'asaas_customers',
  'subscriptions',
  'payments',
  'asaas_webhooks',
  'subscription_changes'
);

-- Deve retornar 6 tabelas

-- Verificar planos
SELECT name, display_name, price, ai_enabled, trial_days
FROM subscription_plans;

-- Deve retornar:
-- plus | Plano Plus | 24.90 | false | 0
-- pro  | Plano Pro  | 44.90 | true  | 14
```

---

## ⚠️ IMPORTANTE: Backup dos Dados

Se você tem dados importantes na tabela `subscriptions` antiga:

1. **Faça backup primeiro:**

```sql
-- Criar backup
CREATE TABLE subscriptions_backup AS
SELECT * FROM subscriptions;

-- Depois execute a migration

-- Se der problema, restaure:
DROP TABLE subscriptions;
CREATE TABLE subscriptions AS
SELECT * FROM subscriptions_backup;
```

---

## 🎯 Qual arquivo usar?

Use o arquivo: **`scripts/fix-payment-migration.sql`**

Ele já tem tudo que você precisa:
- Remove tabelas antigas
- Cria função auxiliar
- Cria todas as tabelas novas
- Insere os planos

**É só copiar e colar no SQL Editor e executar!**

---

## ✅ Checklist

- [ ] Abri o Supabase Dashboard
- [ ] Fui no SQL Editor
- [ ] Copiei todo conteúdo do fix-payment-migration.sql
- [ ] Colei no SQL Editor
- [ ] Cliquei em RUN
- [ ] Vi "Success"
- [ ] Verifiquei que as 6 tabelas foram criadas
- [ ] Verifiquei que os 2 planos foram inseridos

## 🎉 Pronto!

Agora você pode continuar com a configuração do Asaas!

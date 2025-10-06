# Como Executar a Migration do Banco de Dados

## 🎯 Opção 1: Via Supabase Dashboard (RECOMENDADO)

Esta é a forma mais fácil e visual.

### Passo a Passo:

1. **Acesse o Supabase Dashboard**
   - Abra seu navegador
   - Acesse: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Selecione seu Projeto**
   - Clique no projeto `concurseiro` (ou o nome que você deu)

3. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em **"SQL Editor"**
   - Ou acesse direto: https://supabase.com/dashboard/project/[seu-project-id]/sql

4. **Crie uma Nova Query**
   - Clique no botão **"New query"**

5. **Cole o Código SQL**
   - Abra o arquivo: `scripts/payment-schema.sql`
   - Selecione TUTTO o conteúdo (Ctrl+A)
   - Copie (Ctrl+C)
   - Cole no editor SQL do Supabase (Ctrl+V)

6. **Execute a Migration**
   - Clique no botão **"Run"** (ou pressione Ctrl+Enter)
   - Aguarde a execução (pode levar alguns segundos)
   - Você verá "Success. No rows returned" se tudo correr bem

7. **Verifique as Tabelas**
   - No menu lateral, clique em **"Table Editor"**
   - Você deve ver as novas tabelas:
     - `subscription_plans`
     - `asaas_customers`
     - `subscriptions`
     - `payments`
     - `asaas_webhooks`
     - `subscription_changes`

8. **Verifique os Planos**
   - Clique na tabela `subscription_plans`
   - Você deve ver 2 registros:
     - Plano Plus (R$ 24,90)
     - Plano Pro (R$ 44,90)

✅ **Pronto!** Seu banco está configurado.

---

## 🎯 Opção 2: Via Linha de Comando (PostgreSQL)

Se você tem o PostgreSQL instalado localmente ou acesso direto ao servidor.

### Passo a Passo:

1. **Obtenha as Credenciais do Banco**

   No Supabase Dashboard:
   - Clique em **"Settings"** → **"Database"**
   - Na seção **"Connection string"**, selecione **"Direct connection"**
   - Copie as informações:
     ```
     Host: aws-0-us-east-1.pooler.supabase.com
     Port: 6543
     Database: postgres
     User: postgres.xxxxxxxxx
     Password: [sua senha]
     ```

2. **Abra o Terminal/Prompt**
   - Windows: Abra o **PowerShell** ou **CMD**
   - Linux/Mac: Abra o **Terminal**

3. **Navegue até a pasta do projeto**
   ```bash
   cd C:\xampp\htdocs\consurseiro\concurseiro-app
   ```

4. **Execute o psql com o arquivo SQL**
   ```bash
   psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.xxxxxxxxx -d postgres -f scripts/payment-schema.sql
   ```

   **Substitua:**
   - `postgres.xxxxxxxxx` pelo seu usuário
   - Digite a senha quando solicitado

5. **Aguarde a Execução**
   - Você verá várias mensagens de `CREATE TABLE`, `CREATE INDEX`, etc.
   - Se aparecer "ERROR", verifique o erro e corrija

6. **Verifique se funcionou**
   ```bash
   psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.xxxxxxxxx -d postgres -c "\dt"
   ```
   - Isso lista todas as tabelas
   - Você deve ver as novas tabelas criadas

✅ **Pronto!**

---

## 🎯 Opção 3: Via Script Node.js (Automático)

Criei um script para executar automaticamente.

### Passo a Passo:

1. **Crie o arquivo de execução**

   Já criei para você: `scripts/run-payment-migration.js`

2. **Abra o terminal na pasta do projeto**
   ```bash
   cd C:\xampp\htdocs\consurseiro\concurseiro-app
   ```

3. **Execute o script**
   ```bash
   node scripts/run-payment-migration.js
   ```

4. **Aguarde a mensagem de sucesso**
   ```
   ✅ Migration executada com sucesso!
   ✅ Tabelas criadas: 6
   ✅ Planos cadastrados: 2
   ```

✅ **Pronto!**

---

## ⚠️ Problemas Comuns e Soluções

### Erro: "relation already exists"
**Problema:** As tabelas já foram criadas anteriormente.

**Solução:**
```sql
-- Execute isso no SQL Editor para resetar:
DROP TABLE IF EXISTS asaas_webhooks CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscription_changes CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS asaas_customers CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Depois execute o payment-schema.sql novamente
```

### Erro: "permission denied"
**Problema:** Você não tem permissões suficientes.

**Solução:** Certifique-se de estar usando o usuário correto do Supabase (o que tem `postgres.` no início).

### Erro: "function update_updated_at_column does not exist"
**Problema:** A função foi criada no notebook-schema.sql mas não existe ainda.

**Solução:** Execute primeiro o `scripts/notebook-schema.sql` ou adicione a função no payment-schema.sql.

### Erro: "could not connect to server"
**Problema:** Credenciais incorretas ou firewall bloqueando.

**Solução:**
- Verifique se copiou corretamente host, porta, usuário e senha
- Tente via Supabase Dashboard (Opção 1)

---

## 🔍 Como Verificar se Deu Certo

### Verificar no Supabase Dashboard:

1. Vá em **"Table Editor"**
2. Procure por `subscription_plans`
3. Clique nela
4. Você deve ver 2 linhas:
   - **plus** | Plano Plus | 24.90 | false (ai_enabled)
   - **pro** | Plano Pro | 44.90 | true (ai_enabled)

### Verificar via SQL:

Execute no SQL Editor:
```sql
-- Verificar planos
SELECT name, display_name, price, ai_enabled, trial_days
FROM subscription_plans;

-- Deve retornar:
-- plus  | Plano Plus | 24.90 | false | 0
-- pro   | Plano Pro  | 44.90 | true  | 14
```

### Verificar via API:

Depois de executar a migration, teste:
```bash
# Inicie o servidor
npm run dev

# Em outro terminal, teste:
curl http://localhost:3000/api/subscriptions/plans
```

Deve retornar JSON com os 2 planos.

---

## 📌 Resumo - Qual Usar?

| Método | Dificuldade | Quando Usar |
|--------|-------------|-------------|
| **Supabase Dashboard** | ⭐ Fácil | Primeira vez, visual |
| **psql (linha de comando)** | ⭐⭐ Médio | Se tem PostgreSQL instalado |
| **Script Node.js** | ⭐⭐⭐ Avançado | Automação, CI/CD |

**👉 RECOMENDAÇÃO:** Use a **Opção 1 (Supabase Dashboard)** - é a mais fácil e visual!

---

## ✅ Próximo Passo

Depois de executar a migration com sucesso:

1. Configure as variáveis do Asaas no `.env`
2. Inicie o servidor: `npm run dev`
3. Acesse: http://localhost:3000/precos
4. Teste criar uma assinatura!

---

## 🆘 Precisa de Ajuda?

Se tiver qualquer erro:
1. Copie a mensagem de erro completa
2. Me envie para eu te ajudar
3. Ou consulte os logs do Supabase em "Logs" → "Database"

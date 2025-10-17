# 🎯 PASSO A PASSO SIMPLES - Executar Migration

## ✅ MÉTODO MAIS FÁCIL (RECOMENDADO)

### 1️⃣ Abra o Supabase no Navegador

```
https://supabase.com/dashboard
```

Faça login com sua conta.

---

### 2️⃣ Selecione o Projeto

Clique no projeto **"Concurseiro"** (ou o nome que você deu).

---

### 3️⃣ Abra o SQL Editor

No menu lateral esquerdo, clique em:
```
🔧 SQL Editor
```

---

### 4️⃣ Abra o Arquivo no Computador

Abra o arquivo:
```
C:\xampp\htdocs\consurseiro\concurseiro-app\scripts\payment-schema.sql
```

No seu editor de código (VS Code, Notepad++, etc.)

---

### 5️⃣ Copie TODO o Conteúdo

- Selecione tudo: `Ctrl + A`
- Copie: `Ctrl + C`

---

### 6️⃣ Cole no Supabase

Volte para o Supabase SQL Editor:
- Clique em **"New query"**
- Cole o código: `Ctrl + V`

---

### 7️⃣ Execute

Clique no botão verde **"Run"** (ou `Ctrl + Enter`)

Aguarde alguns segundos...

---

### 8️⃣ Verifique o Sucesso

Você deve ver:
```
Success. No rows returned
```

Ou uma mensagem de sucesso similar.

---

### 9️⃣ Verifique as Tabelas

No menu lateral, clique em:
```
📊 Table Editor
```

Você deve ver estas novas tabelas:
- ✅ subscription_plans
- ✅ asaas_customers
- ✅ subscriptions
- ✅ payments
- ✅ asaas_webhooks
- ✅ subscription_changes

---

### 🔟 Verifique os Planos

Clique na tabela **`subscription_plans`**

Você deve ver 2 registros:

| name | display_name | price | ai_enabled | trial_days |
|------|--------------|-------|------------|------------|
| plus | Plano Plus   | 24.90 | false      | 0          |
| pro  | Plano Pro    | 44.90 | true       | 14         |

---

## 🎉 PRONTO!

A migration foi executada com sucesso!

---

## 📝 Próximos Passos

### 1. Configure o Asaas

Edite o arquivo `.env`:
```bash
ASAAS_API_KEY=sua_chave_aqui
ASAAS_BASE_URL=https://api.asaas.com/v3
```

**Como obter a chave:**
1. Acesse: https://www.asaas.com/
2. Faça login (ou crie uma conta)
3. Vá em: Configurações → Integrações → API
4. Copie a API Key

---

### 2. Teste o Sistema

Inicie o servidor:
```bash
npm run dev
```

Acesse no navegador:
```
http://localhost:3000/precos
```

---

### 3. Configure os Webhooks no Asaas

1. No painel do Asaas, vá em: **Webhooks**
2. Adicione nova URL: `https://seu-dominio.com/api/webhooks/asaas`
3. Selecione todos os eventos de **PAYMENT_**

---

## ❌ Se Der Erro

### Erro: "relation already exists"

**Solução:** As tabelas já existem. Para resetar:

1. No SQL Editor do Supabase, execute:

```sql
DROP TABLE IF EXISTS asaas_webhooks CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscription_changes CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS asaas_customers CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
```

2. Depois execute o `payment-schema.sql` novamente

---

### Erro: "function does not exist"

**Solução:** Execute primeiro o arquivo `notebook-schema.sql`:

1. Abra: `scripts/notebook-schema.sql`
2. Copie todo o conteúdo
3. Cole e execute no SQL Editor
4. Depois execute o `payment-schema.sql`

---

### Não Apareceu Nenhuma Mensagem

**Solução:**
- Role para baixo no SQL Editor para ver a mensagem
- Ou vá direto no Table Editor verificar se as tabelas foram criadas

---

## 🆘 Precisa de Ajuda?

Me envie:
1. Print da tela do erro
2. Mensagem de erro completa
3. Qual passo você estava executando

---

## ✅ Checklist Rápido

- [ ] Abri o Supabase Dashboard
- [ ] Selecionei o projeto correto
- [ ] Abri o SQL Editor
- [ ] Copiei o conteúdo do payment-schema.sql
- [ ] Colei no SQL Editor
- [ ] Cliquei em Run
- [ ] Vi mensagem de sucesso
- [ ] Verifiquei que as 6 tabelas foram criadas
- [ ] Verifiquei que os 2 planos foram cadastrados
- [ ] Configurei as variáveis do Asaas no .env
- [ ] Testei acessar /precos

Se todos os itens estão marcados: **Parabéns! Está tudo certo! 🎉**

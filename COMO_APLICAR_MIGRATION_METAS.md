# Como Aplicar a Migration de Metas

## ⚠️ IMPORTANTE: Execute isso ANTES de usar a funcionalidade!

As metas não estão sendo salvas porque as **tabelas ainda não foram criadas no banco de dados**.

## 📝 Passo a Passo

### 1. Verificar se as tabelas existem

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto **PraPassar**
3. No menu lateral, clique em **SQL Editor**
4. Cole e execute o conteúdo do arquivo: [`database/VERIFICAR_TABELAS_METAS.sql`](database/VERIFICAR_TABELAS_METAS.sql)

**Se aparecer "❌ NÃO EXISTE"**, continue para o passo 2.
**Se aparecer "✅ EXISTE"**, pule para o passo 3 (Verificar erros).

---

### 2. Criar as tabelas (Aplicar Migration)

1. Ainda no **SQL Editor** do Supabase
2. Crie uma **nova query**
3. Copie **TODO** o conteúdo do arquivo: [`database/2025-10-21_create_goals_system.sql`](database/2025-10-21_create_goals_system.sql)
4. Cole no SQL Editor
5. Clique em **RUN** ou pressione **Ctrl+Enter**

**Resultado esperado:**
```
Success. No rows returned
```

Se houver erro, anote a mensagem e me informe.

---

### 3. Verificar erros no navegador

1. Abra o navegador em: **http://localhost:3001/metas**
2. Abra o **DevTools** (F12)
3. Vá na aba **Console**
4. Tente criar uma meta
5. Se houver erro, copie a mensagem completa

Erros comuns:
- ❌ `relation "public.goals" does not exist` → Tabelas não foram criadas (volte ao passo 2)
- ❌ `permission denied for table goals` → Problema de RLS (veja passo 4)
- ❌ `null value in column "user_id"` → Problema de autenticação

---

### 4. Verificar RLS (Row Level Security)

Se houver erro de permissão:

1. No **SQL Editor**, execute:
```sql
-- Verificar RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('goals', 'goal_checklist_items');
```

**Resultado esperado:**
```
tablename              | rowsecurity
-----------------------|------------
goals                  | true
goal_checklist_items   | true
```

2. Se `rowsecurity` estiver `false`, execute:
```sql
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_checklist_items ENABLE ROW LEVEL SECURITY;
```

---

### 5. Testar novamente

1. Recarregue a página: **http://localhost:3001/metas**
2. Clique em **"+ Nova Meta"**
3. Preencha:
   - Nome: "Teste de Meta"
   - Matéria: Selecione uma matéria existente
   - Data: Amanhã
   - Checklist: Adicione pelo menos 1 item
4. Clique em **"Salvar Meta"**

**Resultado esperado:**
- ✅ Toast verde: "Meta criada com sucesso!"
- ✅ Meta aparece na lista
- ✅ Ao clicar em "Ver detalhes", você vê o checklist

---

## 🔍 Troubleshooting

### Erro: "Você ainda não tem matérias cadastradas"

**Solução:** Primeiro cadastre uma matéria:
1. Vá em **http://localhost:3001/subjects**
2. Crie uma matéria de teste
3. Volte para **/metas** e tente novamente

---

### Erro: "Unauthorized" ou "User not found"

**Solução:** Você não está logado:
1. Vá em **http://localhost:3001/login**
2. Faça login com seu usuário
3. Volte para **/metas**

---

### Erro: "Network error" ou "Failed to fetch"

**Solução:** Servidor não está rodando:
1. Abra o terminal
2. Execute:
   ```bash
   cd prapassar-app
   npm run dev
   ```
3. Aguarde até aparecer: `✔ Vite client built`
4. Acesse novamente

---

### Erro: "Cannot read property 'id' of undefined"

**Solução:** Problema no endpoint de autenticação:
1. Verifique se o `.env` tem as variáveis do Supabase:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=eyJxxx...
   ```
2. Reinicie o servidor:
   ```bash
   npm run dev
   ```

---

## 📊 Verificar se funcionou

Execute este SQL no Supabase para ver as metas criadas:

```sql
-- Ver todas as metas
SELECT
  g.id,
  g.name,
  s.name as materia,
  g.target_date,
  g.status,
  COUNT(gci.id) as total_items,
  COUNT(gci.id) FILTER (WHERE gci.is_completed = true) as completed_items
FROM goals g
LEFT JOIN subjects s ON s.id = g.subject_id
LEFT JOIN goal_checklist_items gci ON gci.goal_id = g.id
GROUP BY g.id, g.name, s.name, g.target_date, g.status
ORDER BY g.created_at DESC;
```

**Se aparecer registros:** ✅ **FUNCIONOU!**

---

## 🆘 Ainda não funciona?

Me envie as seguintes informações:

1. **Resultado do script de verificação** (`VERIFICAR_TABELAS_METAS.sql`)
2. **Erro completo do console** do navegador (F12 → Console)
3. **Erro do terminal** (se houver)
4. **Screenshot** da tela de erro

---

**Desenvolvido para PraPassar**
**Data:** 2025-10-21

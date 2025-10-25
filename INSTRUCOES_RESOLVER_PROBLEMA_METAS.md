# 🚨 INSTRUÇÕES PARA RESOLVER PROBLEMA DE METAS

## ❌ Problema
**Erro 500** ao tentar criar uma meta na página `/metas`

## 🎯 Causa Mais Provável
As tabelas `goals` e `goal_checklist_items` **NÃO EXISTEM** no banco de dados do Supabase.

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### **Passo 1: Abrir Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard
2. Entre no seu projeto
3. Clique em **SQL Editor** (ícone de raio ⚡ na barra lateral)

### **Passo 2: Executar Script de Verificação**
1. Clique em **+ New Query**
2. Copie TODO o conteúdo do arquivo: [`VERIFICAR_TABELAS_METAS.sql`](VERIFICAR_TABELAS_METAS.sql)
3. Cole no editor
4. Clique em **Run** (ou pressione `F5`)

**Resultado Esperado:**
- Se aparecer **2 linhas** com `goals` e `goal_checklist_items` → **✅ Tabelas existem!**
- Se aparecer **VAZIO** ou **0 rows** → **❌ Tabelas NÃO existem!**

---

### **Passo 3: Criar as Tabelas (SE NÃO EXISTIREM)**

#### 3.1 - Abrir arquivo de migração
Abra o arquivo: [`database/2025-10-21_create_goals_system.sql`](database/2025-10-21_create_goals_system.sql)

#### 3.2 - Copiar TODO o conteúdo
- Selecione TUDO (Ctrl+A)
- Copie (Ctrl+C)

#### 3.3 - Colar no SQL Editor
- Volte ao **SQL Editor** do Supabase
- Clique em **+ New Query**
- Cole o conteúdo copiado (Ctrl+V)

#### 3.4 - Executar
- Clique em **Run** (ou `F5`)
- Aguarde a mensagem: **"Success. No rows returned"**
- Se aparecer erro, **copie a mensagem de erro completa** e me envie

---

### **Passo 4: Verificar se Funcionou**
1. Execute novamente o script [`VERIFICAR_TABELAS_METAS.sql`](VERIFICAR_TABELAS_METAS.sql)
2. Agora deve aparecer **2 linhas** com as tabelas

---

### **Passo 5: Testar Criar Meta**
1. Acesse: http://localhost:3001/metas
2. Clique em **"Nova Meta"**
3. Preencha:
   - **Nome:** Teste de Meta
   - **Matéria:** (escolha qualquer uma)
   - **Data:** (escolha uma data futura)
   - **Checklist:** Item 1, Item 2, Item 3
4. Clique em **"Salvar Meta"**

**Resultado Esperado:**
- Mensagem: **"Meta criada com sucesso!"** ✅
- A meta aparece na lista

**Se ainda der erro:**
- Abra o **DevTools** (F12)
- Vá na aba **Console**
- Copie TODOS os erros em vermelho
- Me envie

---

## 🔍 DIAGNÓSTICO ALTERNATIVO

### Se as tabelas EXISTEM mas ainda dá erro:

Execute no SQL Editor:

```sql
-- Testar inserção manual
INSERT INTO public.goals (user_id, subject_id, name, target_date)
VALUES (
  auth.uid(),  -- Seu user_id automático
  (SELECT id FROM public.subjects LIMIT 1),  -- Primeira matéria
  'Meta de Teste Manual',
  '2025-12-31'
)
RETURNING *;
```

**Resultados possíveis:**

#### ✅ Se funcionar (retornar 1 row):
- **Problema:** Erro no código do frontend ou backend
- **Solução:** Me envie os logs do terminal (onde rodou `npm run dev`)

#### ❌ Se der erro de RLS:
```
new row violates row-level security policy
```
- **Problema:** Políticas RLS bloqueando
- **Solução:** Execute novamente o arquivo [`database/2025-10-21_create_goals_system.sql`](database/2025-10-21_create_goals_system.sql)

#### ❌ Se der erro de Foreign Key:
```
insert or update on table "goals" violates foreign key constraint
```
- **Problema:** Não há matérias cadastradas
- **Solução:** Cadastre uma matéria primeiro em http://localhost:3001/subjects

---

## 📊 INFORMAÇÕES NECESSÁRIAS (se o problema persistir)

Por favor, me envie:

### 1. **Resultado da Verificação**
Execute: [`VERIFICAR_TABELAS_METAS.sql`](VERIFICAR_TABELAS_METAS.sql)
Copie e cole TODO o resultado

### 2. **Logs do Servidor**
No terminal onde está rodando `npm run dev`, procure por linhas com:
- `🔷 [POST /api/goals]`
- `❌` (erros)

Copie TODAS essas linhas

### 3. **Erro do Navegador**
- Pressione `F12`
- Vá na aba **Network**
- Procure pela requisição `goals` com status **500**
- Clique nela
- Vá na aba **Response**
- Copie o conteúdo

---

## 🎬 RESUMO

1. ✅ Abrir Supabase SQL Editor
2. ✅ Executar script de verificação
3. ✅ Se tabelas não existirem, executar migration
4. ✅ Testar criar meta
5. ✅ Se ainda não funcionar, me enviar logs

---

## 📁 Arquivos Importantes

- **Verificação:** [`VERIFICAR_TABELAS_METAS.sql`](VERIFICAR_TABELAS_METAS.sql)
- **Migration:** [`database/2025-10-21_create_goals_system.sql`](database/2025-10-21_create_goals_system.sql)
- **Documentação Completa:** [`SOLUCAO_PROBLEMA_METAS.md`](SOLUCAO_PROBLEMA_METAS.md)
- **Debug Detalhado:** [`DEBUG_METAS.md`](DEBUG_METAS.md)

---

**Última Atualização:** 2025-10-24
**Status:** Aguardando execução dos passos acima

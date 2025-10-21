# 🔍 Guia de Teste: RLS nos Exercícios

**Data**: 2025-10-20
**Problema**: Exercícios não estão sendo salvos (tabelas vazias)
**Hipótese**: RLS (Row Level Security) está bloqueando os inserts

---

## 📋 Passo a Passo

### 1️⃣ Verificar RLS Atual

**Arquivo**: `VERIFICAR_RLS.sql`

Execute no **Supabase SQL Editor** (https://app.supabase.com):

```sql
-- 1. Verificar se RLS está ativo
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

-- 2. Listar políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';
```

**Anote os resultados**:
- ✅ Se `rls_ativo = true`, RLS está ativo
- ✅ Se não houver políticas listadas, isso explica o problema!

---

### 2️⃣ Testar INSERT Direto no SQL Editor

**Ainda no Supabase SQL Editor**, execute:

```sql
-- Tentar INSERT manual
INSERT INTO public.saved_exercise_results (
  user_id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  questions_data
) VALUES (
  '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid,
  'Teste Manual RLS',
  5,
  3,
  60,
  '{}'::jsonb
)
RETURNING *;
```

**Resultado esperado**:
- ❌ **Se der erro**: RLS está bloqueando. Vá para o passo 3.
- ✅ **Se funcionar**: RLS está OK. O problema é no código da API.

---

### 3️⃣ Desativar RLS Temporariamente (APENAS TESTE)

⚠️ **ATENÇÃO**: Isso vai permitir acesso total à tabela. Use APENAS para teste!

**Arquivo**: `DESATIVAR_RLS_TEMPORARIO.sql`

```sql
-- Desativar RLS
ALTER TABLE public.saved_exercise_results DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'saved_exercise_results';
```

**Resultado esperado**:
- `rowsecurity = false` (RLS desativado)

---

### 4️⃣ Testar Salvar Exercício no App

Agora com RLS desativado, teste:

1. Acesse: http://localhost:3001/dashboard
2. Clique em "Exercícios IA" (botão roxo)
3. Gere 5 questões de qualquer matéria
4. Responda as questões
5. Clique em "Ver Resultados"
6. Clique em **"Salvar nos Relatórios"**
7. Observe o console do navegador (F12)

**O que verificar**:
- ✅ Se aparecer "✅ Salvo nos relatórios com sucesso!"
- ✅ Se não houver erros 500

---

### 5️⃣ Verificar se Salvou no Banco

Execute no **Supabase SQL Editor**:

```sql
SELECT * FROM public.saved_exercise_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado**:
- ✅ **Se houver registros**: O problema ERA o RLS! Vá para o passo 6.
- ❌ **Se ainda estiver vazio**: O problema é no código da API.

---

### 6️⃣ Reativar RLS com Políticas Corretas

⚠️ **IMPORTANTE**: Nunca deixe RLS desativado em produção!

**Arquivo**: `REATIVAR_RLS.sql`

```sql
-- Reativar RLS
ALTER TABLE public.saved_exercise_results ENABLE ROW LEVEL SECURITY;

-- Política de INSERT
DROP POLICY IF EXISTS "Users can insert own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can insert own exercise results"
ON public.saved_exercise_results
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política de SELECT
DROP POLICY IF EXISTS "Users can view own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can view own exercise results"
ON public.saved_exercise_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política de UPDATE
DROP POLICY IF EXISTS "Users can update own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can update own exercise results"
ON public.saved_exercise_results
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política de DELETE
DROP POLICY IF EXISTS "Users can delete own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can delete own exercise results"
ON public.saved_exercise_results
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

### 7️⃣ Testar Novamente com RLS Ativo

Repita o passo 4 (testar no app) e o passo 5 (verificar no banco).

**Se funcionar**: ✅ Problema resolvido!
**Se não funcionar**: ❌ Problema é no código do endpoint.

---

## 🐛 Se o Problema NÃO for RLS

Se mesmo com RLS desativado não salvar, o problema está no código.

**Arquivo a investigar**: `prapassar-app/server/api/exercises/save.post.ts`

**Possíveis causas**:
1. Endpoint não está sendo chamado (rota errada)
2. Autenticação falhando (`userId` undefined)
3. Erro de validação de dados
4. Erro de estrutura do banco (coluna faltando)

**Debug**:
1. Adicione `console.log` no início do endpoint
2. Verifique se aparece no terminal do servidor
3. Se não aparecer, o endpoint não está sendo chamado

---

## 📊 Resumo dos Cenários

| Cenário | RLS Ativo? | INSERT Manual Funciona? | App Funciona sem RLS? | Diagnóstico |
|---------|------------|-------------------------|----------------------|-------------|
| A | ✅ Sim | ❌ Erro | ✅ Sim | RLS sem políticas corretas |
| B | ✅ Sim | ✅ Sim | ❌ Não | Problema no código da API |
| C | ❌ Não | ✅ Sim | ❌ Não | Problema no código da API |
| D | ✅ Sim | ✅ Sim | ✅ Sim | Tudo OK (testar com RLS) |

---

## 📝 Informações Importantes

- **User ID**: `0b17dba0-7c78-4c43-a2cf-f6d890f8d329`
- **Email**: `netsacolas@gmail.com`
- **Servidor**: http://localhost:3001
- **Supabase**: https://ubeivchkuoptmhkcglny.supabase.co

---

## 🎯 Próximos Passos

1. Execute `VERIFICAR_RLS.sql` e me envie os resultados
2. Execute o INSERT manual e me diga se funcionou
3. Baseado nisso, decidiremos se é RLS ou código

---

**Boa sorte! 🚀**

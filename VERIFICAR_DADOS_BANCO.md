# 🔍 Verificação: Dados no Banco

## Status Atual

✅ **Página carregou sem erro de autenticação**
❌ **Nenhuma sessão encontrada**

Isso significa que o código está funcionando, mas não há dados salvos para o seu usuário.

---

## 🗄️ Verificar no Supabase

### Passo 1: Acessar Supabase SQL Editor

1. Acesse: https://app.supabase.com
2. Selecione seu projeto **PraPassar**
3. Vá em **SQL Editor** (ícone de banco de dados na lateral)

---

### Passo 2: Verificar se EXISTE alguma sessão no banco

Cole e execute esta query:

```sql
-- Query 1: Ver TODAS as sessões (qualquer usuário)
SELECT
  id,
  user_id,
  subject_id,
  started_at,
  ended_at,
  duration,
  created_at,
  notes
FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado**:

- **Se retornar linhas**: Existem sessões no banco, mas podem ser de outro usuário
- **Se retornar vazio**: Nenhuma sessão foi criada ainda (timer não salvou)

---

### Passo 3: Descobrir o ID do usuário logado

```sql
-- Query 2: Ver usuários cadastrados
SELECT
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Anote o UUID do usuário** com o email que você está usando agora.

Exemplo:
```
id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
email: netsacolass@gmail.com
```

---

### Passo 4: Verificar se há sessões para SEU usuário

```sql
-- Query 3: Buscar sessões do seu usuário
-- ⚠️ SUBSTITUA 'SEU_USER_ID_AQUI' pelo UUID da Query 2

SELECT
  COUNT(*) as total_sessoes,
  SUM(duration) as total_segundos,
  ROUND(SUM(duration) / 60.0, 2) as total_minutos,
  MIN(started_at) as primeira_sessao,
  MAX(started_at) as ultima_sessao
FROM public.study_sessions
WHERE user_id = 'SEU_USER_ID_AQUI'::uuid;
```

**Exemplo com ID real**:
```sql
WHERE user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;
```

**Resultado esperado**:

| total_sessoes | total_segundos | total_minutos | primeira_sessao | ultima_sessao |
|---------------|----------------|---------------|-----------------|---------------|
| 5 | 1800 | 30.00 | 2025-10-19 10:00:00 | 2025-10-19 18:30:00 |

- **Se `total_sessoes = 0`**: Você nunca criou sessões OU as sessões foram criadas com outro user_id
- **Se `total_sessoes > 0`**: Os dados existem! Vamos investigar por que não aparecem

---

### Passo 5: Verificar políticas RLS (Row Level Security)

```sql
-- Query 4: Ver políticas da tabela study_sessions
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'study_sessions';
```

**Resultado esperado**: Deve ter uma política parecida com:

| policyname | cmd | qual |
|------------|-----|------|
| Usuários veem suas sessões | SELECT | (auth.uid() = user_id) |
| Usuários criam suas sessões | INSERT | (auth.uid() = user_id) |

**Se NÃO houver políticas**: RLS pode estar bloqueando acesso.

---

## 🔧 Cenários e Soluções

### 🟢 CENÁRIO 1: Query 1 retorna vazio (nenhuma sessão existe)

**Problema**: O timer não está salvando dados.

**Solução**: Criar uma sessão manualmente e testar

```sql
-- Pegar seu user_id primeiro (Query 2)
-- Depois inserir sessão de teste:

INSERT INTO public.study_sessions (
  user_id,
  subject_id,
  started_at,
  ended_at,
  duration,
  notes
) VALUES (
  'SEU_USER_ID_AQUI'::uuid,  -- ⚠️ SUBSTITUIR
  NULL,  -- Sem matéria
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '10 minutes',
  1200,  -- 20 minutos = 1200 segundos
  'Sessão de teste manual - DEBUG'
);
```

Depois, acesse `/test-reports-simple` e clique em "🔄 Recarregar".

**Se aparecer agora**: O timer não estava salvando. Vamos investigar o timer.

---

### 🟡 CENÁRIO 2: Query 1 tem sessões, mas Query 3 retorna zero

**Problema**: As sessões existem mas pertencem a outro usuário.

**Diagnóstico**:
```sql
-- Ver qual user_id está nas sessões
SELECT DISTINCT user_id, COUNT(*) as total
FROM public.study_sessions
GROUP BY user_id;
```

Isso vai mostrar todos os user_id que têm sessões. Compare com seu user_id da Query 2.

**Se forem diferentes**:

Opção A - **Atualizar sessões para seu user_id** (se você criou em teste):
```sql
-- ⚠️ CUIDADO: Só faça isso se você é o único usuário ou em ambiente de testes

UPDATE public.study_sessions
SET user_id = 'SEU_USER_ID_CORRETO'::uuid
WHERE user_id = 'USER_ID_ERRADO'::uuid;
```

Opção B - **Deletar sessões antigas e criar novas**:
```sql
-- Deletar todas (se ambiente de testes)
DELETE FROM public.study_sessions;

-- Depois, use o timer normalmente para criar novas
```

---

### 🔴 CENÁRIO 3: Query 3 tem sessões (total > 0), mas página não mostra

**Problema**: RLS bloqueando ou bug no frontend.

**Teste 1 - Verificar se RLS está habilitado**:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'study_sessions';
```

Se `rowsecurity = true`, execute:

```sql
-- Ver se auth.uid() retorna seu ID
SELECT auth.uid();
```

Deve retornar o mesmo UUID da Query 2.

**Se retornar NULL**: Problema de autenticação do Supabase.

**Teste 2 - Desabilitar RLS temporariamente** (APENAS PARA DEBUG):
```sql
-- ⚠️ TEMPORÁRIO - INSEGURO EM PRODUÇÃO
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
```

Acesse `/test-reports-simple` novamente.

**Se funcionar agora**: O problema é nas políticas RLS. Crie a política correta:

```sql
-- Reabilitar RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Criar política de SELECT
CREATE POLICY "Usuários veem suas próprias sessões"
  ON public.study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Criar política de INSERT
CREATE POLICY "Usuários criam suas próprias sessões"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 📋 Checklist - Execute em ordem

Execute as queries e marque:

- [ ] **Query 1**: Alguma sessão existe? (Sim/Não/Quantas?)
- [ ] **Query 2**: Anotei meu user_id?
- [ ] **Query 3**: Tenho sessões no meu user_id? (Quantas?)
- [ ] **Query 4**: Políticas RLS existem? (Sim/Não)

---

## 📤 Me Envie os Resultados

Cole aqui os resultados de cada query:

### Query 1 (todas as sessões):
```
[Cole aqui o resultado]
```

### Query 2 (meu user_id):
```
id: ___________________________
email: ________________________
```

### Query 3 (minhas sessões):
```
total_sessoes: ___
total_minutos: ___
```

### Query 4 (políticas RLS):
```
[Cole aqui o resultado]
```

---

Com essas informações, vou saber exatamente qual é o problema e como resolver! 🚀

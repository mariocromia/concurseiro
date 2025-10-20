# 🔍 Debug: Por que o tempo de estudo não aparece nos relatórios?

## Passo 1: Verificar se os dados estão sendo salvos

Execute esta query no **Supabase SQL Editor**:

```sql
-- Verificar sessões de estudo salvas
SELECT
  id,
  user_id,
  subject_id,
  started_at,
  ended_at,
  duration,
  created_at
FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado:**
- Deve mostrar registros das sessões que você criou
- `duration` deve estar em **segundos** (ex: 120 para 2 minutos)
- `started_at` e `ended_at` devem ter valores

---

## Passo 2: Verificar se você está logado

Execute esta query:

```sql
-- Ver qual é o seu user_id
SELECT
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Anote seu `id` (UUID)**

---

## Passo 3: Verificar se as sessões pertencem a você

```sql
-- Substitua 'SEU_USER_ID' pelo ID que você anotou acima
SELECT
  COUNT(*) as total_sessoes,
  SUM(duration) as total_segundos,
  SUM(duration) / 60.0 as total_minutos
FROM public.study_sessions
WHERE user_id = 'SEU_USER_ID';
```

**Resultado esperado:**
- `total_sessoes`: Número de vezes que você usou o cronômetro
- `total_segundos`: Tempo total em segundos
- `total_minutos`: Tempo total em minutos

---

## Passo 4: Verificar se o composable está buscando corretamente

Abra o console do navegador (F12) e execute:

```javascript
// Verificar localStorage
console.log('User:', JSON.parse(localStorage.getItem('sb-' + Object.keys(localStorage).find(k => k.startsWith('sb-')) + '-auth-token')))
```

Ou simplesmente veja na aba **Application → Local Storage** do DevTools.

---

## Passo 5: Teste manual da página de relatórios

1. Acesse http://localhost:3001/reports
2. Abra o **Console** do navegador (F12)
3. Procure por logs que começam com:
   - `[useReports]`
   - `Buscando sessões do período`
   - `Sessions encontradas:`

**Cole aqui a saída do console para debug**

---

## Possíveis Problemas e Soluções

### Problema 1: Nenhuma sessão encontrada no banco

**Sintoma**: Query do Passo 1 retorna 0 linhas

**Solução**:
1. Use o cronômetro em `/study`
2. Espere pelo menos 10 segundos
3. Clique em "Encerrar"
4. Verifique novamente

**Causa**: Timer não está salvando. Pode ser erro de RLS (Row Level Security).

**Verificar RLS**:
```sql
-- Ver políticas da tabela
SELECT * FROM pg_policies WHERE tablename = 'study_sessions';
```

---

### Problema 2: Sessões existem mas user_id está diferente

**Sintoma**: Query do Passo 3 retorna 0 mas Query do Passo 1 mostra dados

**Solução**:
- Você pode estar logado com um usuário diferente
- Faça logout e login novamente
- Verifique qual é o `user_id` nas sessões vs `auth.users`

---

### Problema 3: Relatório busca mas não mostra

**Sintoma**: Console mostra "Sessions encontradas: X" mas gráfico está vazio

**Possível causa**: Filtro de período muito curto

**Solução**:
1. Na página de relatórios, clique em **"Todo período"**
2. Verifique se os dados aparecem

**Verificar no código**:
```typescript
// Em useReports.ts - verificar datas
console.log('Data início:', startDate)
console.log('Data fim:', endDate)
console.log('Sessions:', sessions)
```

---

### Problema 4: Conversão de segundos para minutos

**Sintoma**: Dados aparecem mas valores estão errados

**Verificar**:
- Timer salva em **segundos** (`duration` na tabela)
- Relatório deve converter para **minutos** (dividir por 60)

**Query de teste**:
```sql
SELECT
  started_at,
  duration as segundos,
  duration / 60.0 as minutos,
  FLOOR(duration / 60) as minutos_inteiros
FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🔧 Script de Debug Automático

Execute este SQL para ver um resumo completo:

```sql
-- RELATÓRIO COMPLETO DE DEBUG
DO $$
DECLARE
  v_user_count INTEGER;
  v_session_count INTEGER;
  v_subject_count INTEGER;
BEGIN
  -- Contar usuários
  SELECT COUNT(*) INTO v_user_count FROM auth.users;
  RAISE NOTICE '👤 Total de usuários: %', v_user_count;

  -- Contar sessões
  SELECT COUNT(*) INTO v_session_count FROM public.study_sessions;
  RAISE NOTICE '⏱️  Total de sessões: %', v_session_count;

  -- Contar matérias
  SELECT COUNT(*) INTO v_subject_count FROM public.subjects;
  RAISE NOTICE '📚 Total de matérias: %', v_subject_count;

  -- Sessões por usuário
  RAISE NOTICE '';
  RAISE NOTICE '📊 Sessões por usuário:';
  FOR rec IN (
    SELECT
      u.email,
      COUNT(s.id) as sessoes,
      SUM(s.duration) / 60 as minutos_total
    FROM auth.users u
    LEFT JOIN public.study_sessions s ON s.user_id = u.id
    GROUP BY u.email
  ) LOOP
    RAISE NOTICE '  - %: % sessões, % minutos', rec.email, rec.sessoes, COALESCE(rec.minutos_total, 0);
  END LOOP;

  -- Últimas 5 sessões
  RAISE NOTICE '';
  RAISE NOTICE '⏱️  Últimas 5 sessões:';
  FOR rec IN (
    SELECT
      DATE_TRUNC('second', started_at) as quando,
      duration / 60 as minutos,
      (SELECT name FROM subjects WHERE id = subject_id) as materia
    FROM public.study_sessions
    ORDER BY created_at DESC
    LIMIT 5
  ) LOOP
    RAISE NOTICE '  - %: % min (%)', rec.quando, ROUND(rec.minutos::numeric, 1), COALESCE(rec.materia, 'sem matéria');
  END LOOP;
END $$;
```

---

## 📝 Checklist de Verificação

Execute cada item e marque:

- [ ] **Passo 1**: Sessões existem no banco? (Query retorna dados?)
- [ ] **Passo 2**: Encontrei meu `user_id`?
- [ ] **Passo 3**: Sessões pertencem ao meu `user_id`?
- [ ] **Passo 4**: Console do navegador mostra logs de busca?
- [ ] **Passo 5**: Filtro está em "Todo período"?
- [ ] **Passo 6**: Políticas RLS estão ativas?
- [ ] **Passo 7**: Script de debug mostra dados corretos?

---

## 🚨 Se NADA funcionar

Execute este script para **forçar** a criação de uma sessão de teste:

```sql
-- CRIAR SESSÃO DE TESTE (Substitua SEU_USER_ID e SEU_SUBJECT_ID)
INSERT INTO public.study_sessions (
  user_id,
  subject_id,
  started_at,
  ended_at,
  duration,
  notes
) VALUES (
  'SEU_USER_ID'::uuid,
  'SEU_SUBJECT_ID'::uuid,  -- ou NULL se não tiver matéria
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '10 minutes',
  1200,  -- 20 minutos em segundos
  'Teste manual'
);

-- Verificar se foi criado
SELECT * FROM public.study_sessions ORDER BY created_at DESC LIMIT 1;
```

Depois:
1. Acesse `/reports`
2. Clique em "Todo período"
3. Deve aparecer nos gráficos!

---

## 📞 Cole Aqui os Resultados

**Resultado do Passo 1:**
```
(Cole aqui)
```

**Resultado do Passo 3:**
```
(Cole aqui)
```

**Console do navegador (Passo 5):**
```
(Cole aqui)
```

**Script de debug automático:**
```
(Cole aqui)
```

---

Com essas informações, conseguimos identificar exatamente onde está o problema! 🎯

-- ============================================
-- VERIFICAR SE OS EXERCÍCIOS ESTÃO SALVANDO
-- ============================================

-- 1. VERIFICAR TODOS OS REGISTROS (ignorando user_id e data)
SELECT
  id,
  user_id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  created_at
FROM public.saved_exercise_results
ORDER BY created_at DESC
LIMIT 10;

-- 2. CONTAR TOTAL DE REGISTROS
SELECT COUNT(*) as total_registros
FROM public.saved_exercise_results;

-- 3. VERIFICAR REGISTROS DE HOJE
SELECT
  id,
  user_id,
  title,
  created_at::date as data,
  created_at::time as hora
FROM public.saved_exercise_results
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;

-- 4. VERIFICAR POR USER_ID ESPECÍFICO
SELECT
  id,
  title,
  total_questions,
  correct_answers,
  created_at
FROM public.saved_exercise_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY created_at DESC
LIMIT 5;

-- 5. VERIFICAR ÚLTIMOS 30 DIAS
SELECT
  id,
  title,
  created_at::date as data
FROM public.saved_exercise_results
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY created_at DESC;

-- ============================================
-- DIAGNÓSTICO: Por que não aparece nos relatórios?
-- ============================================

-- 6. Verificar range de datas dos registros
SELECT
  MIN(created_at::date) as primeira_data,
  MAX(created_at::date) as ultima_data,
  COUNT(*) as total
FROM public.saved_exercise_results;

-- 7. Verificar user_ids distintos (pode ter salvado com user_id errado)
SELECT
  user_id,
  COUNT(*) as quantidade
FROM public.saved_exercise_results
GROUP BY user_id
ORDER BY quantidade DESC;

-- ============================================
-- SE NÃO HOUVER REGISTROS
-- ============================================
/*
Se todas as queries acima retornarem vazio (0 registros), então:

1. O endpoint NÃO está salvando (mesmo mostrando sucesso no console)
2. Ou há algum trigger/política que está impedindo o INSERT

Neste caso, teste INSERT manual:
*/

-- INSERT DE TESTE (execute SOMENTE se não houver registros)
/*
INSERT INTO public.saved_exercise_results (
  user_id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  questions_data
) VALUES (
  '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid,
  '🧪 TESTE MANUAL SQL',
  5,
  4,
  80.00,
  '{"test": "manual insert"}'::jsonb
)
RETURNING *;
*/

-- Depois execute query 1 novamente para verificar se apareceu

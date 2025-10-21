-- ============================================
-- VERIFICAR RLS (Row Level Security)
-- ============================================

-- 1. Verificar se RLS está ativo na tabela
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

-- 2. Listar todas as políticas RLS da tabela
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

-- 3. Tentar INSERT direto (para testar se funciona no SQL Editor)
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

-- 4. Verificar se o insert foi salvo
SELECT * FROM public.saved_exercise_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY created_at DESC
LIMIT 5;

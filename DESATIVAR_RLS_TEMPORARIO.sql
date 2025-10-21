-- ============================================
-- DESATIVAR RLS TEMPORARIAMENTE (APENAS TESTE)
-- ============================================

-- ⚠️ ATENÇÃO: Isso vai permitir que qualquer usuário veja dados de outros
-- Use APENAS para debug e reverta depois!

-- Desativar RLS
ALTER TABLE public.saved_exercise_results DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desativado
SELECT
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

-- Tentar INSERT novamente
INSERT INTO public.saved_exercise_results (
  user_id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  questions_data
) VALUES (
  '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid,
  'Teste SEM RLS',
  10,
  7,
  70,
  '{}'::jsonb
)
RETURNING *;

-- Verificar dados
SELECT * FROM public.saved_exercise_results
ORDER BY created_at DESC
LIMIT 5;

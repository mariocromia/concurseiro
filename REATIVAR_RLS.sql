-- ============================================
-- REATIVAR RLS (Após testes)
-- ============================================

-- Reativar RLS
ALTER TABLE public.saved_exercise_results ENABLE ROW LEVEL SECURITY;

-- Criar política de INSERT (permitir usuários autenticados inserirem seus próprios dados)
DROP POLICY IF EXISTS "Users can insert own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can insert own exercise results"
ON public.saved_exercise_results
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Criar política de SELECT (permitir usuários verem apenas seus dados)
DROP POLICY IF EXISTS "Users can view own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can view own exercise results"
ON public.saved_exercise_results
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Criar política de UPDATE (permitir usuários atualizarem seus dados)
DROP POLICY IF EXISTS "Users can update own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can update own exercise results"
ON public.saved_exercise_results
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar política de DELETE (permitir usuários deletarem seus dados)
DROP POLICY IF EXISTS "Users can delete own exercise results" ON public.saved_exercise_results;

CREATE POLICY "Users can delete own exercise results"
ON public.saved_exercise_results
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verificar políticas criadas
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

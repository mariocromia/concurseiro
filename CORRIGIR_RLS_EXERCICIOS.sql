-- ============================================
-- CORRIGIR RLS: saved_exercise_results
-- Data: 2025-10-20
-- ============================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 'Tabela existe:' as status, tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

-- 2. VERIFICAR RLS ATIVO
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '🔒 RLS ATIVO' ELSE '⚠️ RLS DESATIVADO' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

-- 3. LISTAR POLÍTICAS EXISTENTES
SELECT
  policyname as "Política",
  cmd as "Comando",
  permissive as "Permissiva",
  roles as "Roles"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results';

-- ============================================
-- CORREÇÃO: RECRIAR POLÍTICAS RLS
-- ============================================

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can insert own exercise results" ON public.saved_exercise_results;
DROP POLICY IF EXISTS "Users can view own exercise results" ON public.saved_exercise_results;
DROP POLICY IF EXISTS "Users can update own exercise results" ON public.saved_exercise_results;
DROP POLICY IF EXISTS "Users can delete own exercise results" ON public.saved_exercise_results;

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios exercícios" ON public.saved_exercise_results;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios exercícios" ON public.saved_exercise_results;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios exercícios" ON public.saved_exercise_results;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios exercícios" ON public.saved_exercise_results;

-- Garantir que RLS está ativo
ALTER TABLE public.saved_exercise_results ENABLE ROW LEVEL SECURITY;

-- POLICY 1: INSERT (permitir inserir próprios exercícios)
CREATE POLICY "Users can insert own exercise results"
  ON public.saved_exercise_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- POLICY 2: SELECT (permitir ver próprios exercícios)
CREATE POLICY "Users can view own exercise results"
  ON public.saved_exercise_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- POLICY 3: UPDATE (permitir atualizar próprios exercícios)
CREATE POLICY "Users can update own exercise results"
  ON public.saved_exercise_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POLICY 4: DELETE (permitir deletar próprios exercícios)
CREATE POLICY "Users can delete own exercise results"
  ON public.saved_exercise_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICAR POLÍTICAS APLICADAS
-- ============================================
SELECT
  policyname as "Política Criada",
  cmd as "Comando",
  permissive as "Permissiva"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'saved_exercise_results'
ORDER BY cmd;

-- ============================================
-- TESTE: INSERIR UM REGISTRO
-- ============================================
-- IMPORTANTE: Execute este INSERT DEPOIS de executar os comandos acima
-- Substitua 'SEU_USER_ID' pelo seu user_id real

-- Para descobrir seu user_id, execute:
SELECT auth.uid() as "Seu User ID";

-- Depois execute o INSERT:
/*
INSERT INTO public.saved_exercise_results (
  user_id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  questions_data
) VALUES (
  auth.uid(), -- Usa seu user_id automaticamente
  'Teste RLS - Exercícios IA',
  5,
  4,
  80.00,
  '{"test": true}'::jsonb
)
RETURNING *;
*/

-- ============================================
-- VERIFICAR SE SALVOU
-- ============================================
SELECT
  id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  created_at
FROM public.saved_exercise_results
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- ALTERNATIVA: DESABILITAR RLS TEMPORARIAMENTE
-- (APENAS PARA TESTE - NÃO USAR EM PRODUÇÃO)
-- ============================================
/*
-- Para desabilitar RLS (TEMPORÁRIO):
ALTER TABLE public.saved_exercise_results DISABLE ROW LEVEL SECURITY;

-- Depois de testar, REABILITE:
ALTER TABLE public.saved_exercise_results ENABLE ROW LEVEL SECURITY;
*/

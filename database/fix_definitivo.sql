-- SOLUÇÃO DEFINITIVA: INSERIR USUÁRIO E AJUSTAR POLÍTICAS RLS

-- Passo 1: Ver qual é o seu user_id atual
SELECT
  'Meu ID de usuário:' AS info,
  auth.uid() AS meu_id,
  email
FROM auth.users
WHERE id = auth.uid();

-- Passo 2: FORÇAR inserção do usuário atual (desabilitando RLS temporariamente)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

INSERT INTO public.users (id, email, full_name, avatar_url)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Passo 3: Verificar se o usuário foi inserido
SELECT
  'Usuário inserido com sucesso!' AS status,
  id,
  email,
  full_name,
  created_at
FROM public.users
WHERE id = auth.uid();

-- Passo 4: Verificar as políticas RLS da tabela study_goals
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'study_goals';

-- Passo 5: RECRIAR políticas RLS para study_goals (mais permissivas)
DROP POLICY IF EXISTS "Users can insert their own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can view their own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can update their own study goals" ON public.study_goals;
DROP POLICY IF EXISTS "Users can delete their own study goals" ON public.study_goals;

-- Política de SELECT
CREATE POLICY "Users can view their own study goals"
ON public.study_goals
FOR SELECT
USING (auth.uid() = user_id);

-- Política de INSERT (mais permissiva)
CREATE POLICY "Users can insert their own study goals"
ON public.study_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE
CREATE POLICY "Users can update their own study goals"
ON public.study_goals
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política de DELETE
CREATE POLICY "Users can delete their own study goals"
ON public.study_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Passo 6: Garantir que RLS está habilitado
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

-- Passo 7: TESTAR inserção em study_goals
INSERT INTO public.study_goals (user_id, goal_name, description, target_date)
VALUES (
  auth.uid(),
  'Meta de Teste',
  'Teste de inserção',
  '2025-12-31'
)
RETURNING *;

-- Passo 8: Limpar o teste
DELETE FROM public.study_goals
WHERE goal_name = 'Meta de Teste'
AND user_id = auth.uid();

SELECT 'Script executado com sucesso! Tente usar a aplicação agora.' AS resultado;

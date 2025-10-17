-- DEBUG COMPLETO DO PROBLEMA RLS

-- 1. Verificar se os usuários estão sincronizados
SELECT
  'Total em auth.users' AS tabela,
  COUNT(*) AS total
FROM auth.users
UNION ALL
SELECT
  'Total em public.users' AS tabela,
  COUNT(*) AS total
FROM public.users;

-- 2. Ver emails de ambas as tabelas
SELECT
  'auth.users' AS origem,
  email,
  id
FROM auth.users
UNION ALL
SELECT
  'public.users' AS origem,
  email,
  id
FROM public.users
ORDER BY origem, email;

-- 3. Verificar se RLS está habilitado
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'study_goals', 'subjects');

-- 4. Verificar políticas de study_goals
SELECT
  policyname,
  cmd,
  qual AS using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'study_goals';

-- 5. Verificar se há study_goals existentes
SELECT
  COUNT(*) AS total_study_goals
FROM public.study_goals;

-- 6. Ver conteúdo de study_goals (se houver)
SELECT
  sg.id,
  sg.user_id,
  sg.goal_name,
  u.email
FROM public.study_goals sg
LEFT JOIN public.users u ON sg.user_id = u.id
LIMIT 10;

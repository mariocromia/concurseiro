-- DESABILITAR RLS EM STUDY_GOALS TEMPORARIAMENTE

-- Verificar usuários existentes
SELECT
  'Usuários em public.users:' AS info,
  COUNT(*) AS total
FROM public.users;

SELECT
  id,
  email,
  full_name
FROM public.users;

-- DESABILITAR RLS em study_goals para permitir uso da aplicação
ALTER TABLE public.study_goals DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('users', 'study_goals', 'subjects')
  AND schemaname = 'public';

SELECT '✅ RLS desabilitado em study_goals. Tente usar a aplicação agora.' AS resultado;

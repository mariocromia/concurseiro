-- FIX COMPLETO: DESABILITAR RLS E VERIFICAR

-- 1. Verificar status ATUAL do RLS
SELECT
  tablename,
  rowsecurity AS rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'study_goals', 'subjects', 'study_sessions')
ORDER BY tablename;

-- 2. Forçar desabilitação do RLS
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.revisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams DISABLE ROW LEVEL SECURITY;

-- 3. Verificar status DEPOIS da desabilitação
SELECT
  tablename,
  rowsecurity AS rls_habilitado_depois
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'study_goals', 'subjects', 'study_sessions')
ORDER BY tablename;

-- 4. Ver usuários existentes
SELECT
  id,
  email,
  full_name
FROM public.users;

-- 5. Mostrar se todos os usuários de auth estão em public
SELECT
  'Usuários em auth.users' AS tabela,
  COUNT(*) AS total
FROM auth.users
UNION ALL
SELECT
  'Usuários em public.users' AS tabela,
  COUNT(*) AS total
FROM public.users;

SELECT '✅ Script executado!' AS resultado;

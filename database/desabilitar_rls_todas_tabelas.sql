-- DESABILITAR RLS EM TODAS AS TABELAS PRINCIPAIS

-- Desabilitar RLS em todas as tabelas
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS em todas as tabelas
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'study_goals',
    'subjects',
    'study_sessions',
    'notebooks',
    'revisions',
    'questions',
    'exams'
  )
ORDER BY tablename;

-- Verificar se há usuários sincronizados
SELECT
  'Total de usuários sincronizados' AS info,
  COUNT(*) AS total
FROM public.users;

SELECT '✅ RLS desabilitado em todas as tabelas principais.' AS resultado;

-- FORÇAR DESABILITAÇÃO DO RLS

-- Desabilitar RLS em cada tabela individualmente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams DISABLE ROW LEVEL SECURITY;

-- Verificar resultado
SELECT
  tablename,
  rowsecurity AS rls_ainda_ativo
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

-- Deve mostrar FALSE para todas as tabelas
-- Se mostrar TRUE, o RLS ainda está ativo

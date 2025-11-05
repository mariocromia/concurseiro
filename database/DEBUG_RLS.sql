-- ============================================================================
-- DEBUG: Verificar Row Level Security (RLS)
-- Data: 2025-10-28
-- Objetivo: Identificar por que "violates row-level security policy"
-- ============================================================================

-- 1. VERIFICAR SE VOCÊ ESTÁ AUTENTICADO
SELECT
  auth.uid() AS my_user_id,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NÃO AUTENTICADO - Faça login primeiro!'
    ELSE '✅ Autenticado'
  END AS status;

-- 2. VERIFICAR SE A TABELA CHAPTERS EXISTE
SELECT
  table_schema,
  table_name,
  CASE
    WHEN table_name = 'chapters' THEN '✅ Tabela chapters existe'
    ELSE 'Info'
  END AS status
FROM information_schema.tables
WHERE table_name IN ('chapters', 'pages')
AND table_schema = 'public';

-- 3. VERIFICAR POLÍTICAS RLS DE CHAPTERS
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
WHERE tablename = 'chapters'
ORDER BY policyname;

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename IN ('chapters', 'pages')
AND schemaname = 'public';

-- 5. TESTAR INSERÇÃO MANUALMENTE (execute SOMENTE se estiver logado)
-- DESCOMENTE as linhas abaixo para testar:

/*
-- Primeiro, verifique seu user_id
SELECT auth.uid();

-- Depois, crie um subject temporário (se não tiver)
INSERT INTO public.subjects (user_id, name)
VALUES (auth.uid(), 'Teste Debug')
RETURNING id, name;

-- Copie o ID do subject retornado acima e use aqui:
-- Substitua 'SEU_SUBJECT_ID_AQUI' pelo UUID real
INSERT INTO public.chapters (user_id, subject_id, title, order_index)
VALUES (
  auth.uid(),
  'SEU_SUBJECT_ID_AQUI',
  'Capítulo Teste',
  0
)
RETURNING *;
*/

-- 6. VERIFICAR SE HÁ CAPÍTULOS EXISTENTES
SELECT
  COUNT(*) AS total_chapters,
  COUNT(DISTINCT user_id) AS unique_users
FROM public.chapters;

-- 7. VERIFICAR ESTRUTURA DA TABELA CHAPTERS
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'chapters'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. DIAGNÓSTICO FINAL
SELECT
  'Diagnóstico RLS para CHAPTERS' AS tipo,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ PROBLEMA: Você não está autenticado'
    WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chapters' AND schemaname = 'public') THEN '❌ PROBLEMA: Tabela chapters não existe'
    WHEN NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'chapters' AND schemaname = 'public' AND rowsecurity = true) THEN '❌ PROBLEMA: RLS não está habilitado'
    WHEN NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chapters' AND cmd = 'INSERT') THEN '❌ PROBLEMA: Política de INSERT não existe'
    ELSE '✅ Tudo parece correto. O erro pode ser de tipo de dado ou constraint.'
  END AS resultado;

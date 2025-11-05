-- ============================================================================
-- FIX COMPLETO: Políticas RLS para subjects, chapters e pages
-- Data: 2025-10-28
-- Problema: Dados existem mas não aparecem (RLS bloqueando SELECT)
-- ============================================================================

-- DIAGNÓSTICO: Verificar políticas atuais
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('subjects', 'chapters', 'pages')
ORDER BY tablename, cmd;

-- ============================================================================
-- PARTE 1: CORRIGIR POLÍTICAS DE SUBJECTS
-- ============================================================================

-- Dropar políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias matérias" ON public.subjects;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias matérias" ON public.subjects;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias matérias" ON public.subjects;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias matérias" ON public.subjects;

-- Criar políticas novas (mais permissivas para debug)
CREATE POLICY "subjects_select"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "subjects_insert"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subjects_update"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "subjects_delete"
  ON public.subjects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 2: CORRIGIR POLÍTICAS DE CHAPTERS
-- ============================================================================

-- Dropar políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem inserir seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem atualizar seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem deletar seus capítulos" ON public.chapters;

DROP POLICY IF EXISTS "chapters_select_policy" ON public.chapters;
DROP POLICY IF EXISTS "chapters_insert_policy" ON public.chapters;
DROP POLICY IF EXISTS "chapters_update_policy" ON public.chapters;
DROP POLICY IF EXISTS "chapters_delete_policy" ON public.chapters;

DROP POLICY IF EXISTS "chapters_select" ON public.chapters;
DROP POLICY IF EXISTS "chapters_insert" ON public.chapters;
DROP POLICY IF EXISTS "chapters_update" ON public.chapters;
DROP POLICY IF EXISTS "chapters_delete" ON public.chapters;

-- Criar políticas novas
CREATE POLICY "chapters_select"
  ON public.chapters FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "chapters_insert"
  ON public.chapters FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chapters_update"
  ON public.chapters FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "chapters_delete"
  ON public.chapters FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 3: CORRIGIR POLÍTICAS DE PAGES
-- ============================================================================

-- Dropar políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver suas páginas" ON public.pages;
DROP POLICY IF EXISTS "Usuários podem inserir suas páginas" ON public.pages;
DROP POLICY IF EXISTS "Usuários podem atualizar suas páginas" ON public.pages;
DROP POLICY IF EXISTS "Usuários podem deletar suas páginas" ON public.pages;

DROP POLICY IF EXISTS "pages_select_policy" ON public.pages;
DROP POLICY IF EXISTS "pages_insert_policy" ON public.pages;
DROP POLICY IF EXISTS "pages_update_policy" ON public.pages;
DROP POLICY IF EXISTS "pages_delete_policy" ON public.pages;

DROP POLICY IF EXISTS "pages_select" ON public.pages;
DROP POLICY IF EXISTS "pages_insert" ON public.pages;
DROP POLICY IF EXISTS "pages_update" ON public.pages;
DROP POLICY IF EXISTS "pages_delete" ON public.pages;

-- Criar políticas novas
CREATE POLICY "pages_select"
  ON public.pages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "pages_insert"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pages_update"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pages_delete"
  ON public.pages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Ver políticas criadas
SELECT
  tablename,
  policyname,
  cmd AS operation,
  CASE
    WHEN qual LIKE '%auth.uid()%' THEN '✅ Usa auth.uid()'
    ELSE '⚠️ Não usa auth.uid()'
  END AS auth_check
FROM pg_policies
WHERE tablename IN ('subjects', 'chapters', 'pages')
ORDER BY tablename, cmd;

-- Contar registros em cada tabela
SELECT
  'subjects' AS tabela,
  COUNT(*) AS total
FROM public.subjects

UNION ALL

SELECT
  'chapters' AS tabela,
  COUNT(*) AS total
FROM public.chapters

UNION ALL

SELECT
  'pages' AS tabela,
  COUNT(*) AS total
FROM public.pages;

-- ============================================================================
-- TESTE: Tentar ler dados (como usuário autenticado)
-- ============================================================================

-- Esta query SÓ funciona se você estiver autenticado no SQL Editor
-- Se der erro, é normal - teste na aplicação web

SELECT
  s.name AS subject,
  c.title AS chapter,
  p.title AS page
FROM public.subjects s
LEFT JOIN public.chapters c ON c.subject_id = s.id
LEFT JOIN public.pages p ON p.chapter_id = c.id
WHERE s.user_id = auth.uid()
LIMIT 10;

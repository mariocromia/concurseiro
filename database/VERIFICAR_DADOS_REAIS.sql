-- ============================================================================
-- VERIFICAR: Onde os dados REALMENTE estão sendo salvos?
-- Data: 2025-10-28
-- ============================================================================

-- 1. VERIFICAR TABELA SUBJECTS (cadernos)
SELECT
  'SUBJECTS (Cadernos)' AS tabela,
  COUNT(*) AS total_registros
FROM public.subjects;

SELECT
  id,
  name,
  user_id,
  created_at
FROM public.subjects
ORDER BY created_at DESC
LIMIT 5;

-- 2. VERIFICAR TABELA CHAPTERS (capítulos - ESTRUTURA ANTIGA)
SELECT
  'CHAPTERS (Estrutura Antiga)' AS tabela,
  COUNT(*) AS total_registros
FROM public.chapters;

SELECT
  c.id,
  c.title,
  s.name AS subject_name,
  c.user_id,
  c.created_at
FROM public.chapters c
LEFT JOIN public.subjects s ON s.id = c.subject_id
ORDER BY c.created_at DESC
LIMIT 5;

-- 3. VERIFICAR TABELA PAGES (páginas - ESTRUTURA ANTIGA)
SELECT
  'PAGES (Estrutura Antiga)' AS tabela,
  COUNT(*) AS total_registros
FROM public.pages;

SELECT
  p.id,
  p.title,
  c.title AS chapter_name,
  LENGTH(p.content) AS content_length,
  p.user_id,
  p.created_at
FROM public.pages p
LEFT JOIN public.chapters c ON c.id = p.chapter_id
ORDER BY p.created_at DESC
LIMIT 5;

-- 4. VERIFICAR TABELA NOTEBOOKS (ESTRUTURA NOVA - NÃO USADA)
SELECT
  'NOTEBOOKS (Estrutura Nova)' AS tabela,
  COUNT(*) AS total_registros
FROM public.notebooks;

SELECT *
FROM public.notebooks
ORDER BY created_at DESC
LIMIT 5;

-- 5. VERIFICAR TABELA NOTEBOOK_SECTIONS (ESTRUTURA NOVA - NÃO USADA)
SELECT
  'NOTEBOOK_SECTIONS (Estrutura Nova)' AS tabela,
  COUNT(*) AS total_registros
FROM public.notebook_sections;

-- 6. VERIFICAR TABELA NOTEBOOK_PAGES (ESTRUTURA NOVA - NÃO USADA)
SELECT
  'NOTEBOOK_PAGES (Estrutura Nova)' AS tabela,
  COUNT(*) AS total_registros
FROM public.notebook_pages;

-- 7. RESUMO: Qual estrutura está sendo usada?
SELECT
  'RESUMO' AS tipo,
  'Estrutura Antiga (subjects → chapters → pages): ' ||
  (SELECT COUNT(*) FROM public.chapters) || ' chapters, ' ||
  (SELECT COUNT(*) FROM public.pages) || ' pages' AS estrutura_antiga,
  'Estrutura Nova (notebooks → sections → pages): ' ||
  (SELECT COUNT(*) FROM public.notebook_sections) || ' sections, ' ||
  (SELECT COUNT(*) FROM public.notebook_pages) || ' pages' AS estrutura_nova;

-- 8. DIAGNÓSTICO
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM public.chapters) > 0 THEN '✅ DADOS ESTÃO EM: chapters/pages (estrutura antiga)'
    WHEN (SELECT COUNT(*) FROM public.notebook_sections) > 0 THEN '✅ DADOS ESTÃO EM: notebook_sections/notebook_pages (estrutura nova)'
    ELSE '❌ NENHUMA TABELA TEM DADOS - Nada foi salvo ainda'
  END AS diagnostico;

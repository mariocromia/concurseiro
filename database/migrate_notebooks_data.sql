-- ============================================
-- SCRIPT DE MIGRAÇÃO DE DADOS LEGACY
-- De: chapters/pages → Para: notebooks/notebook_sections/notebook_pages
-- Data: 2025-11-04
-- ============================================

-- IMPORTANTE: Fazer BACKUP antes de executar!
-- Este script migrará todos os dados das tabelas antigas para as novas

-- 1. Criar tabelas de backup (segurança)
-- ============================================
CREATE TABLE IF NOT EXISTS chapters_backup_20251104 AS
SELECT * FROM chapters
WHERE EXISTS (SELECT 1 FROM chapters LIMIT 1);

CREATE TABLE IF NOT EXISTS pages_backup_20251104 AS
SELECT * FROM pages
WHERE EXISTS (SELECT 1 FROM pages LIMIT 1);

-- 2. Migrar notebooks (se não existirem)
-- ============================================
INSERT INTO notebooks (user_id, subject_id, name, description, created_at, updated_at)
SELECT DISTINCT
  c.user_id,
  c.subject_id,
  COALESCE(s.name, 'Caderno Principal'),
  'Caderno migrado do sistema anterior',
  MIN(c.created_at),
  MAX(c.updated_at)
FROM chapters c
LEFT JOIN subjects s ON c.subject_id = s.id
WHERE NOT EXISTS (
  SELECT 1 FROM notebooks n
  WHERE n.subject_id = c.subject_id
  AND n.user_id = c.user_id
)
GROUP BY c.user_id, c.subject_id, s.name;

-- 3. Migrar notebook_sections (capítulos)
-- ============================================
INSERT INTO notebook_sections (id, notebook_id, name, order_index, created_at, updated_at)
SELECT
  c.id, -- Manter o mesmo ID para preservar referências
  n.id as notebook_id,
  c.title,
  c.order_index,
  c.created_at,
  c.updated_at
FROM chapters c
JOIN notebooks n ON c.subject_id = n.subject_id AND c.user_id = n.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM notebook_sections ns
  WHERE ns.id = c.id
)
ON CONFLICT (id) DO NOTHING;

-- 4. Migrar notebook_pages (conteúdo das páginas)
-- ============================================
INSERT INTO notebook_pages (section_id, title, content, order_index, created_at, updated_at)
SELECT
  ns.id as section_id,
  COALESCE(p.title, 'Conteúdo'),
  p.content,
  p.order_index,
  p.created_at,
  p.updated_at
FROM pages p
JOIN chapters c ON p.chapter_id = c.id
JOIN notebook_sections ns ON ns.id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM notebook_pages np
  WHERE np.section_id = ns.id
  AND np.title = COALESCE(p.title, 'Conteúdo')
);

-- 5. Verificar migração
-- ============================================
SELECT 'Resumo da Migração:' as info;

SELECT
  'Chapters originais' as tipo,
  COUNT(*) as total
FROM chapters
UNION ALL
SELECT
  'Sections migradas',
  COUNT(*)
FROM notebook_sections
UNION ALL
SELECT
  'Pages originais',
  COUNT(*)
FROM pages
UNION ALL
SELECT
  'Pages migradas',
  COUNT(*)
FROM notebook_pages
UNION ALL
SELECT
  'Notebooks criados',
  COUNT(*)
FROM notebooks;

-- 6. Verificar integridade dos dados
-- ============================================
-- Verificar se todos os capítulos foram migrados
SELECT
  'Capítulos NÃO migrados' as status,
  COUNT(*) as total
FROM chapters c
WHERE NOT EXISTS (
  SELECT 1 FROM notebook_sections ns WHERE ns.id = c.id
);

-- Verificar se todas as páginas foram migradas
SELECT
  'Páginas NÃO migradas' as status,
  COUNT(*) as total
FROM pages p
WHERE NOT EXISTS (
  SELECT 1 FROM notebook_pages np
  JOIN notebook_sections ns ON np.section_id = ns.id
  WHERE ns.id = p.chapter_id
);

-- 7. OPCIONAL: Limpar tabelas antigas (CUIDADO!)
-- ============================================
-- DESCOMENTE apenas após verificar que a migração foi bem sucedida
-- E após testar o sistema por alguns dias

-- DROP TABLE IF EXISTS pages;
-- DROP TABLE IF EXISTS chapters;

-- FIM DA MIGRAÇÃO
-- ============================================
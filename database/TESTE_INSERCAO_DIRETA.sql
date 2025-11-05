-- ============================================================================
-- TESTE: Inserção DIRETA nas tabelas (sem RLS)
-- Data: 2025-10-28
-- Objetivo: Verificar se as tabelas aceitam dados quando RLS está desabilitado
-- ============================================================================

-- PASSO 1: Desabilitar RLS TEMPORARIAMENTE
ALTER TABLE public.chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Pegar um user_id válido
SELECT
  id AS user_id,
  email
FROM auth.users
LIMIT 1;

-- PASSO 3: Criar um subject de teste (ou use um existente)
-- Execute esta query e COPIE o ID retornado
INSERT INTO public.subjects (user_id, name, color)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Caderno Teste Direto',
  '#FF6B6B'
)
RETURNING id, name;

-- PASSO 4: Criar um chapter de teste
-- SUBSTITUA 'SEU_SUBJECT_ID' pelo ID retornado no PASSO 3
INSERT INTO public.chapters (user_id, subject_id, title, order_index)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'SEU_SUBJECT_ID_AQUI', -- ⚠️ SUBSTITUA ISTO!
  'Capítulo Teste Direto',
  0
)
RETURNING id, title;

-- PASSO 5: Criar uma page de teste
-- SUBSTITUA 'SEU_CHAPTER_ID' pelo ID retornado no PASSO 4
INSERT INTO public.pages (user_id, chapter_id, title, content, order_index)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'SEU_CHAPTER_ID_AQUI', -- ⚠️ SUBSTITUA ISTO!
  'Página Teste',
  'Este é um conteúdo de teste inserido diretamente no banco.',
  0
)
RETURNING id, title, LENGTH(content) AS content_length;

-- PASSO 6: Verificar se dados foram inseridos
SELECT
  'SUBJECTS' AS tabela,
  COUNT(*) AS total
FROM public.subjects
WHERE name LIKE '%Teste Direto%'

UNION ALL

SELECT
  'CHAPTERS' AS tabela,
  COUNT(*) AS total
FROM public.chapters
WHERE title LIKE '%Teste Direto%'

UNION ALL

SELECT
  'PAGES' AS tabela,
  COUNT(*) AS total
FROM public.pages
WHERE title LIKE '%Teste%';

-- PASSO 7: Ver os dados completos
SELECT
  s.name AS subject,
  c.title AS chapter,
  p.title AS page,
  LENGTH(p.content) AS content_length
FROM public.subjects s
LEFT JOIN public.chapters c ON c.subject_id = s.id
LEFT JOIN public.pages p ON p.chapter_id = c.id
WHERE s.name LIKE '%Teste Direto%';

-- PASSO 8: REABILITAR RLS (IMPORTANTE!)
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RESULTADO ESPERADO:
-- Se os INSERTs funcionaram = Tabelas estão OK, problema é RLS/autenticação
-- Se os INSERTs falharam = Problema na estrutura das tabelas

-- ============================================
-- VERIFICAR DADOS DO BANCO - Mapas Mentais
-- ============================================
-- Execute estas queries no Supabase SQL Editor para verificar
-- se você tem os dados necessários para gerar mapas mentais
-- ============================================

-- 1. VERIFICAR SEU USER_ID
SELECT id, email FROM auth.users WHERE email = 'SEU_EMAIL_AQUI';
-- Anote o ID retornado e substitua em todas as queries abaixo

-- 2. VERIFICAR MATÉRIAS
SELECT id, name, color, icon
FROM subjects
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY name;

-- 3. VERIFICAR CADERNOS (NOTEBOOKS)
SELECT
  n.id,
  n.name as caderno,
  s.name as materia,
  n.created_at
FROM notebooks n
LEFT JOIN subjects s ON s.id = n.subject_id
WHERE n.user_id = 'SEU_USER_ID_AQUI'
ORDER BY s.name, n.name;

-- 4. VERIFICAR SEÇÕES/CAPÍTULOS (NOTEBOOK_SECTIONS)
SELECT
  ns.id,
  ns.name as secao_capitulo,
  n.name as caderno,
  s.name as materia,
  ns.order_index
FROM notebook_sections ns
JOIN notebooks n ON n.id = ns.notebook_id
LEFT JOIN subjects s ON s.id = n.subject_id
WHERE n.user_id = 'SEU_USER_ID_AQUI'
ORDER BY s.name, n.name, ns.order_index;

-- 5. VERIFICAR PÁGINAS COM CONTEÚDO
SELECT
  np.id,
  np.title as titulo_pagina,
  ns.name as secao,
  n.name as caderno,
  LENGTH(np.content) as tamanho_conteudo,
  np.created_at
FROM notebook_pages np
JOIN notebook_sections ns ON ns.id = np.section_id
JOIN notebooks n ON n.id = ns.notebook_id
WHERE n.user_id = 'SEU_USER_ID_AQUI'
ORDER BY n.name, ns.order_index, np.order_index;

-- 6. VISÃO GERAL - TUDO EM UMA QUERY
SELECT
  s.name as materia,
  n.name as caderno,
  ns.name as secao_capitulo,
  COUNT(DISTINCT np.id) as num_paginas,
  SUM(LENGTH(np.content)) as total_caracteres
FROM subjects s
LEFT JOIN notebooks n ON n.subject_id = s.id
LEFT JOIN notebook_sections ns ON ns.notebook_id = n.id
LEFT JOIN notebook_pages np ON np.section_id = ns.id
WHERE s.user_id = 'SEU_USER_ID_AQUI'
GROUP BY s.name, n.name, ns.name
ORDER BY s.name, n.name, ns.order_index;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Para gerar mapas mentais com IA, você precisa ter:
-- ✅ Pelo menos 1 matéria (subjects)
-- ✅ Pelo menos 1 caderno vinculado à matéria (notebooks)
-- ✅ Pelo menos 1 seção/capítulo no caderno (notebook_sections)
-- ✅ Pelo menos 1 página com conteúdo na seção (notebook_pages)
--
-- Se alguma dessas queries retornar vazio, você precisa criar
-- os dados primeiro na interface /notebook
-- ============================================

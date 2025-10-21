-- ============================================
-- QUERY LIMPA - Verificar Dados de História
-- ============================================
-- Cole APENAS este conteúdo no Supabase SQL Editor
-- LEMBRE-SE: Substitua 'SEU_EMAIL@gmail.com' pelo seu email real!
-- ============================================

SELECT
  s.name as materia,
  n.name as caderno,
  ns.name as secao,
  COUNT(np.id) as paginas
FROM subjects s
LEFT JOIN notebooks n ON n.subject_id = s.id
LEFT JOIN notebook_sections ns ON ns.notebook_id = n.id
LEFT JOIN notebook_pages np ON np.section_id = ns.id
WHERE s.user_id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL@gmail.com')
  AND s.name = 'História'
GROUP BY s.name, n.name, ns.name;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Se retornar VAZIO ou NULL nas colunas:
--   → Você NÃO tem cadernos/seções criados
--   → Vá para o PASSO 2A (criar dados)
--
-- Se retornar linhas com dados:
--   → Você TEM cadernos/seções criados
--   → Vá para o PASSO 2B (aplicar fix no código)
-- ============================================

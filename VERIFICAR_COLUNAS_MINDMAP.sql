-- Execute este SQL no Supabase SQL Editor para verificar as colunas da tabela mindmap_nodes

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mindmap_nodes'
ORDER BY ordinal_position;

-- Se você NÃO VER as colunas: text, position_x, position_y, color
-- Então você precisa executar o arquivo: database/EXECUTE_SOMENTE_ESTE_SQL.sql

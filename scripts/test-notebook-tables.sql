-- Script de teste para verificar se as tabelas do caderno existem

-- Verificar se a tabela subjects existe
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subjects'
ORDER BY ordinal_position;

-- Verificar se a tabela chapters existe
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chapters'
ORDER BY ordinal_position;

-- Verificar se a tabela pages existe
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pages'
ORDER BY ordinal_position;

-- Listar todas as policies da tabela subjects
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
WHERE tablename = 'subjects';

-- Contar registros em subjects
SELECT COUNT(*) as total_subjects FROM subjects;

-- Listar todas as matérias (para debug)
SELECT * FROM subjects ORDER BY created_at DESC LIMIT 10;

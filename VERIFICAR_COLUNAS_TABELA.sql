-- ============================================
-- DIAGNÓSTICO: Verificar estrutura EXATA da tabela study_schedules
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Listar TODAS as colunas da tabela
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'study_schedules'
ORDER BY ordinal_position;

-- 2. Verificar constraints NOT NULL
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey)
WHERE c.conrelid = 'study_schedules'::regclass
  AND contype = 'c'; -- check constraints

-- 3. Ver se há registros na tabela
SELECT COUNT(*) as total_records FROM study_schedules;

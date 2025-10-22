-- ============================================
-- SCRIPT DE VERIFICAÇÃO: Tabelas de Metas
-- Execute este script no Supabase SQL Editor para verificar se as tabelas existem
-- ============================================

-- Verificar se a tabela goals existe
SELECT
  'Tabela goals' as tabela,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'goals'
    ) THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE - Execute a migration!'
  END as status;

-- Verificar se a tabela goal_checklist_items existe
SELECT
  'Tabela goal_checklist_items' as tabela,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'goal_checklist_items'
    ) THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE - Execute a migration!'
  END as status;

-- Se as tabelas existirem, mostrar quantos registros há
SELECT
  'Total de metas' as info,
  COUNT(*) as quantidade
FROM public.goals;

SELECT
  'Total de itens de checklist' as info,
  COUNT(*) as quantidade
FROM public.goal_checklist_items;

-- Verificar se as políticas RLS estão ativas
SELECT
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('goals', 'goal_checklist_items');

-- Listar todas as políticas RLS
SELECT
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as operation
FROM pg_policies
WHERE tablename IN ('goals', 'goal_checklist_items')
ORDER BY tablename, policyname;

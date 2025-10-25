-- ============================================
-- SCRIPT DE VERIFICAÇÃO E DIAGNÓSTICO COMPLETO
-- Sistema de Metas - PraPassar
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Ele irá diagnosticar TODOS os possíveis problemas
-- ============================================

\echo '═══════════════════════════════════════════════════════════════'
\echo '  DIAGNÓSTICO COMPLETO DO SISTEMA DE METAS'
\echo '═══════════════════════════════════════════════════════════════'

-- ============================================
-- PASSO 1: Verificar se as tabelas existem
-- ============================================
\echo '\n[1/10] Verificando existência das tabelas...'

SELECT
  CASE
    WHEN COUNT(*) = 2 THEN '✅ SUCESSO: Ambas as tabelas existem'
    WHEN COUNT(*) = 1 THEN '⚠️  AVISO: Apenas 1 tabela existe'
    ELSE '❌ ERRO CRÍTICO: Nenhuma tabela existe'
  END as status_tabelas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('goals', 'goal_checklist_items');

-- Detalhes das tabelas
SELECT
  table_name,
  CASE
    WHEN table_name = 'goals' THEN '✅'
    WHEN table_name = 'goal_checklist_items' THEN '✅'
    ELSE '❌'
  END as existe
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('goals', 'goal_checklist_items')
ORDER BY table_name;

-- 2. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'goal_checklist_items');

-- 3. VERIFICAR POLÍTICAS RLS
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operacao
FROM pg_policies
WHERE tablename IN ('goals', 'goal_checklist_items')
ORDER BY tablename, cmd;

-- 4. VERIFICAR TRIGGERS
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('goals', 'goal_checklist_items')
ORDER BY event_object_table, trigger_name;

-- 5. CONTAR REGISTROS
SELECT
  'goals' as tabela,
  COUNT(*) as total_registros
FROM public.goals
UNION ALL
SELECT
  'goal_checklist_items' as tabela,
  COUNT(*) as total_registros
FROM public.goal_checklist_items;

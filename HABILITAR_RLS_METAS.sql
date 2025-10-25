-- ============================================
-- HABILITAR RLS NAS TABELAS DE METAS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Habilitar RLS na tabela goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- 2. Habilitar RLS na tabela goal_checklist_items
ALTER TABLE public.goal_checklist_items ENABLE ROW LEVEL SECURITY;

-- 3. Verificar se foi habilitado
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'goal_checklist_items');

-- Resultado esperado: ambas com rls_habilitado = true

-- 4. Verificar se as políticas existem
SELECT
  tablename,
  policyname,
  cmd as operacao
FROM pg_policies
WHERE tablename IN ('goals', 'goal_checklist_items')
ORDER BY tablename, cmd;

-- Resultado esperado: 8 políticas (4 para cada tabela)
-- Se não aparecer nenhuma política, execute o arquivo completo:
-- database/2025-10-21_create_goals_system.sql

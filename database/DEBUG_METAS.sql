-- ============================================
-- DEBUG: Verificar configuração das Metas
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Verificar se RLS está habilitado
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ATIVO' ELSE '❌ RLS INATIVO' END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('goals', 'goal_checklist_items');

-- 2. Listar todas as políticas RLS
SELECT
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
  END as operacao
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('goals', 'goal_checklist_items')
ORDER BY tablename, policyname;

-- 3. Verificar se há alguma meta já criada
SELECT
  COUNT(*) as total_metas,
  COUNT(*) FILTER (WHERE status = 'in_progress') as em_andamento,
  COUNT(*) FILTER (WHERE status = 'completed') as concluidas
FROM public.goals;

-- 4. Testar se consegue inserir uma meta (com seu user_id real)
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo seu UUID real
-- Para pegar seu user_id, execute: SELECT auth.uid();

-- Primeiro, veja qual é seu user_id:
SELECT auth.uid() as meu_user_id;

-- Se retornar NULL, você não está autenticado no SQL Editor
-- Nesse caso, use este comando para ver seu user_id:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 5. Ver estrutura das tabelas
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'goals'
ORDER BY ordinal_position;

-- 6. Verificar se há triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('goals', 'goal_checklist_items')
ORDER BY event_object_table, trigger_name;

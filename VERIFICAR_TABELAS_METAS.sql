-- ============================================
-- SCRIPT DE VERIFICAÇÃO - Tabelas de Metas
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se as tabelas existem
SELECT
  table_name,
  CASE
    WHEN table_name IN ('goals', 'goal_checklist_items') THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('goals', 'goal_checklist_items')
ORDER BY table_name;

-- 2. Se retornar VAZIO, execute a migration abaixo:
-- Copie TUDO do arquivo: database/2025-10-21_create_goals_system.sql
-- E execute no SQL Editor

-- 3. Verificar estrutura da tabela goals (se existir)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'goals'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela goal_checklist_items (se existir)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'goal_checklist_items'
ORDER BY ordinal_position;

-- 5. Verificar RLS (Row Level Security)
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'goal_checklist_items');

-- 6. Verificar políticas RLS
SELECT
  tablename,
  policyname,
  cmd as operacao,
  CASE
    WHEN tablename = 'goals' THEN '✅'
    WHEN tablename = 'goal_checklist_items' THEN '✅'
  END as check_status
FROM pg_policies
WHERE tablename IN ('goals', 'goal_checklist_items')
ORDER BY tablename, cmd;

-- 7. Contar registros nas tabelas (se existirem)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'goals') THEN
    RAISE NOTICE 'Total de metas: %', (SELECT COUNT(*) FROM public.goals);
  ELSE
    RAISE NOTICE '❌ Tabela goals não existe!';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'goal_checklist_items') THEN
    RAISE NOTICE 'Total de itens checklist: %', (SELECT COUNT(*) FROM public.goal_checklist_items);
  ELSE
    RAISE NOTICE '❌ Tabela goal_checklist_items não existe!';
  END IF;
END $$;

-- 8. Teste de autenticação (seu user_id)
SELECT
  auth.uid() as meu_user_id,
  CASE
    WHEN auth.uid() IS NULL THEN '❌ Não autenticado'
    ELSE '✅ Autenticado'
  END as status_autenticacao;

-- 9. Verificar se você tem matérias cadastradas
SELECT
  id,
  name,
  color
FROM public.subjects
WHERE user_id = auth.uid()
LIMIT 5;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Se TUDO estiver OK, você verá:
-- - 2 tabelas (goals e goal_checklist_items)
-- - Colunas corretas em cada tabela
-- - RLS habilitado (true)
-- - 8 políticas RLS (4 para goals, 4 para goal_checklist_items)
-- - Seu user_id (UUID)
-- - Pelo menos 1 matéria

-- ============================================
-- SE AS TABELAS NÃO EXISTIREM:
-- ============================================
-- 1. Abra o arquivo: c:\prapassar\database\2025-10-21_create_goals_system.sql
-- 2. Copie TODO o conteúdo
-- 3. Cole no SQL Editor do Supabase
-- 4. Clique em "Run" (ou pressione F5)
-- 5. Aguarde a mensagem: "Success. No rows returned"
-- 6. Execute este script novamente para verificar

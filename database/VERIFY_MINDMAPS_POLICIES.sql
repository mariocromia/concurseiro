-- ============================================
-- VERIFICAR: Policies existentes para mindmaps
-- ============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename;

-- 2. Verificar policies existentes
SELECT
  schemaname,
  tablename,
  policyname as "Policy Name",
  cmd as "Command",
  permissive as "Permissive",
  roles,
  qual as "USING Expression",
  with_check as "WITH CHECK Expression"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename, cmd, policyname;

-- 3. Testar se auth.uid() está funcionando
SELECT
  auth.uid() as "Current User ID",
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NOT AUTHENTICATED'
    ELSE '✅ AUTHENTICATED'
  END as "Auth Status";

-- 4. Verificar estrutura da tabela mindmaps
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mindmaps'
ORDER BY ordinal_position;

-- 5. Contar quantos mindmaps existem para o usuário atual
SELECT
  COUNT(*) as "Total Mindmaps",
  user_id
FROM public.mindmaps
WHERE user_id = auth.uid()
GROUP BY user_id;

-- 6. Tentar um INSERT de teste (será revertido automaticamente)
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Tentar inserir
  INSERT INTO public.mindmaps (user_id, title, description)
  VALUES (auth.uid(), 'TEST - DELETE ME', 'Teste de RLS policy')
  RETURNING id INTO test_id;

  RAISE NOTICE '✅ INSERT bem-sucedido! ID: %', test_id;

  -- Remover o teste
  DELETE FROM public.mindmaps WHERE id = test_id;
  RAISE NOTICE '✅ Teste concluído - registro removido';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO no INSERT: %', SQLERRM;
END $$;

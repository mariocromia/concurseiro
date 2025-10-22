-- ============================================
-- FIX COMPLETO: Mapas Mentais com IA
-- ============================================
-- Execute TUDO de uma vez no Supabase SQL Editor
-- Data: 2025-10-21
-- ============================================

-- ====================
-- PASSO 1: Atualizar Schema
-- ====================

-- 1.1: Adicionar subject_id na tabela mindmaps (se não existir)
ALTER TABLE public.mindmaps
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;

-- 1.2: Adicionar colunas na tabela mindmap_nodes
ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';

-- 1.3: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mindmaps_subject_id ON public.mindmaps(subject_id);
CREATE INDEX IF NOT EXISTS idx_mindmap_nodes_mindmap_id ON public.mindmap_nodes(mindmap_id);

-- ====================
-- PASSO 2: RLS Policies para mindmaps
-- ====================

DROP POLICY IF EXISTS "Users can view their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can insert their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON public.mindmaps;

CREATE POLICY "Users can view their own mindmaps"
  ON public.mindmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mindmaps"
  ON public.mindmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindmaps"
  ON public.mindmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindmaps"
  ON public.mindmaps FOR DELETE
  USING (auth.uid() = user_id);

-- ====================
-- PASSO 3: RLS Policies para mindmap_nodes
-- ====================

DROP POLICY IF EXISTS "Users can view their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can insert their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can update their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can delete their own mindmap nodes" ON public.mindmap_nodes;

CREATE POLICY "Users can view their own mindmap nodes"
  ON public.mindmap_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own mindmap nodes"
  ON public.mindmap_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own mindmap nodes"
  ON public.mindmap_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own mindmap nodes"
  ON public.mindmap_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

-- ====================
-- PASSO 4: Habilitar RLS
-- ====================

ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmap_nodes ENABLE ROW LEVEL SECURITY;

-- ====================
-- VERIFICAÇÃO
-- ====================

-- Verificar colunas da tabela mindmap_nodes
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mindmap_nodes'
ORDER BY ordinal_position;

-- Verificar policies criadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE
    WHEN cmd = 'SELECT' THEN '✅ Leitura'
    WHEN cmd = 'INSERT' THEN '✅ Criação'
    WHEN cmd = 'UPDATE' THEN '✅ Atualização'
    WHEN cmd = 'DELETE' THEN '✅ Exclusão'
  END as "Tipo"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename, cmd, policyname;

-- Verificar RLS habilitado
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ RLS Habilitado'
    ELSE '❌ RLS Desabilitado'
  END as "Status RLS"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename;

-- Verificar autenticação
SELECT
  auth.uid() as "Current User ID",
  CASE
    WHEN auth.uid() IS NULL THEN '❌ NÃO AUTENTICADO'
    ELSE '✅ AUTENTICADO'
  END as "Auth Status";

-- ====================
-- TESTE FINAL (opcional - descomente para testar)
-- ====================

-- -- Teste de INSERT (será revertido)
-- DO $$
-- DECLARE
--   test_mindmap_id UUID;
--   test_node_id UUID;
-- BEGIN
--   -- Inserir mindmap de teste
--   INSERT INTO public.mindmaps (user_id, title, description)
--   VALUES (auth.uid(), 'TEST - DELETE ME', 'Teste de RLS')
--   RETURNING id INTO test_mindmap_id;
--
--   RAISE NOTICE '✅ Mindmap criado! ID: %', test_mindmap_id;
--
--   -- Inserir node de teste
--   INSERT INTO public.mindmap_nodes (mindmap_id, text, position_x, position_y, color)
--   VALUES (test_mindmap_id, 'Teste', 0, 0, '#8B5CF6')
--   RETURNING id INTO test_node_id;
--
--   RAISE NOTICE '✅ Node criado! ID: %', test_node_id;
--
--   -- Limpar testes
--   DELETE FROM public.mindmap_nodes WHERE id = test_node_id;
--   DELETE FROM public.mindmaps WHERE id = test_mindmap_id;
--
--   RAISE NOTICE '✅ Teste concluído - registros removidos';
--   RAISE NOTICE '';
--   RAISE NOTICE '🎉 TUDO FUNCIONANDO CORRETAMENTE!';
--
-- EXCEPTION
--   WHEN OTHERS THEN
--     RAISE NOTICE '❌ ERRO: %', SQLERRM;
--     RAISE NOTICE 'Verifique as policies e o schema acima';
-- END $$;

-- ====================
-- FIM DO SCRIPT
-- ====================

-- ✅ Se chegou aqui sem erros, está tudo pronto!
-- ✅ Agora teste na aplicação em: http://localhost:3000

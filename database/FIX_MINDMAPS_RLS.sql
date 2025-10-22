-- ============================================
-- FIX: Adicionar RLS Policies para mindmaps
-- ============================================
-- Execute este script no Supabase SQL Editor

-- Policies para mindmaps
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

-- Policies para mindmap_nodes
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

-- Verificar se RLS está habilitado
ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmap_nodes ENABLE ROW LEVEL SECURITY;

-- Verificar policies criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename, policyname;

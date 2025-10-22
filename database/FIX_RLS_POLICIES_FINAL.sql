-- ============================================
-- FIX FINAL: RLS Policies para Mapas Mentais
-- ============================================
-- Este script corrige as policies para funcionar com Supabase Server-Side
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can view their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can insert their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON public.mindmaps;

DROP POLICY IF EXISTS "Users can view their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can insert their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can update their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can delete their own mindmap nodes" ON public.mindmap_nodes;

-- ============================================
-- POLICIES PARA MINDMAPS
-- ============================================

-- SELECT: Usuários podem ver seus próprios mapas
CREATE POLICY "mindmaps_select_policy"
  ON public.mindmaps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: Usuários podem criar mapas para si mesmos
CREATE POLICY "mindmaps_insert_policy"
  ON public.mindmaps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Usuários podem atualizar seus próprios mapas
CREATE POLICY "mindmaps_update_policy"
  ON public.mindmaps FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: Usuários podem deletar seus próprios mapas
CREATE POLICY "mindmaps_delete_policy"
  ON public.mindmaps FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- POLICIES PARA MINDMAP_NODES
-- ============================================

-- SELECT: Usuários podem ver nós de seus mapas
CREATE POLICY "mindmap_nodes_select_policy"
  ON public.mindmap_nodes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

-- INSERT: Usuários podem criar nós em seus mapas
CREATE POLICY "mindmap_nodes_insert_policy"
  ON public.mindmap_nodes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

-- UPDATE: Usuários podem atualizar nós de seus mapas
CREATE POLICY "mindmap_nodes_update_policy"
  ON public.mindmap_nodes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

-- DELETE: Usuários podem deletar nós de seus mapas
CREATE POLICY "mindmap_nodes_delete_policy"
  ON public.mindmap_nodes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

-- ============================================
-- GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================

ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmap_nodes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT
  tablename,
  policyname,
  cmd as "Command",
  roles as "Roles"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- FIX V2: Criar tabelas 'chapters' e 'pages' - VERSÃO CORRIGIDA
-- Data: 2025-10-28
-- Problema: Políticas RLS com erro "column user_id does not exist"
-- ============================================================================

-- PASSO 1: Dropar tudo que pode existir (limpar estado)
DROP POLICY IF EXISTS "Users can delete their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can create their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;

DROP POLICY IF EXISTS "Users can delete their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can update their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can create their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can view their own chapters" ON public.chapters;

DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;

-- PASSO 2: Criar tabela chapters
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 3: Criar tabela pages
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PASSO 4: Criar índices ANTES de habilitar RLS
CREATE INDEX idx_chapters_user_id ON public.chapters(user_id);
CREATE INDEX idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX idx_chapters_order ON public.chapters(order_index);

CREATE INDEX idx_pages_user_id ON public.pages(user_id);
CREATE INDEX idx_pages_chapter_id ON public.pages(chapter_id);
CREATE INDEX idx_pages_order ON public.pages(order_index);

-- PASSO 5: Habilitar Row Level Security
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Criar políticas RLS para chapters (usando sintaxe correta)
CREATE POLICY "chapters_select_policy"
  ON public.chapters
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "chapters_insert_policy"
  ON public.chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chapters_update_policy"
  ON public.chapters
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chapters_delete_policy"
  ON public.chapters
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- PASSO 7: Criar políticas RLS para pages
CREATE POLICY "pages_select_policy"
  ON public.pages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pages_insert_policy"
  ON public.pages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pages_update_policy"
  ON public.pages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pages_delete_policy"
  ON public.pages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- PASSO 8: Verificação final
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('chapters', 'pages')
ORDER BY tablename, indexname;

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN ('chapters', 'pages')
ORDER BY tablename, policyname;

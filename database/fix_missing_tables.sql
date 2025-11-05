-- ============================================================================
-- FIX: Criar tabelas 'chapters' e 'pages' que o código frontend espera
-- Data: 2025-10-28
-- Problema: Código usa 'chapters' e 'pages' mas banco tem 'notebook_sections' e 'notebook_pages'
-- ============================================================================

-- 1. Criar tabela chapters (equivalente a notebook_sections simplificada)
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela pages (equivalente a notebook_pages simplificada)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS para chapters
CREATE POLICY "Users can view their own chapters"
  ON public.chapters FOR SELECT
  USING ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can create their own chapters"
  ON public.chapters FOR INSERT
  WITH CHECK ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can update their own chapters"
  ON public.chapters FOR UPDATE
  USING ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can delete their own chapters"
  ON public.chapters FOR DELETE
  USING ((auth.uid())::uuid = user_id);

-- 5. Criar políticas RLS para pages
CREATE POLICY "Users can view their own pages"
  ON public.pages FOR SELECT
  USING ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can create their own pages"
  ON public.pages FOR INSERT
  WITH CHECK ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can update their own pages"
  ON public.pages FOR UPDATE
  USING ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can delete their own pages"
  ON public.pages FOR DELETE
  USING ((auth.uid())::uuid = user_id);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_chapters_user_id ON public.chapters(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON public.chapters(order_index);

CREATE INDEX IF NOT EXISTS idx_pages_user_id ON public.pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_chapter_id ON public.pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_pages_order ON public.pages(order_index);

-- 7. Verificação (execute separadamente após a migração)
-- SELECT 'chapters' AS table_name, COUNT(*) AS row_count FROM public.chapters
-- UNION ALL
-- SELECT 'pages' AS table_name, COUNT(*) AS row_count FROM public.pages;

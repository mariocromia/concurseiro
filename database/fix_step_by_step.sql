-- ============================================================================
-- FIX: Criar tabelas passo a passo (execute LINHA POR LINHA)
-- Data: 2025-10-28
-- INSTRUÇÕES: Execute cada bloco separadamente e verifique se deu certo
-- ============================================================================

-- ========================================
-- BLOCO 1: LIMPAR (se já executou antes)
-- ========================================
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;

-- ========================================
-- BLOCO 2: CRIAR TABELA CHAPTERS
-- Execute e veja se retorna "CREATE TABLE"
-- ========================================
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- BLOCO 3: CRIAR TABELA PAGES
-- Execute e veja se retorna "CREATE TABLE"
-- ========================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  title VARCHAR(255),
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- BLOCO 4: ADICIONAR FOREIGN KEYS
-- Execute uma por vez
-- ========================================
ALTER TABLE public.chapters
  ADD CONSTRAINT fk_chapters_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.chapters
  ADD CONSTRAINT fk_chapters_subject
  FOREIGN KEY (subject_id)
  REFERENCES public.subjects(id)
  ON DELETE CASCADE;

ALTER TABLE public.pages
  ADD CONSTRAINT fk_pages_user
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.pages
  ADD CONSTRAINT fk_pages_chapter
  FOREIGN KEY (chapter_id)
  REFERENCES public.chapters(id)
  ON DELETE CASCADE;

-- ========================================
-- BLOCO 5: CRIAR ÍNDICES
-- ========================================
CREATE INDEX idx_chapters_user_id ON public.chapters(user_id);
CREATE INDEX idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX idx_pages_user_id ON public.pages(user_id);
CREATE INDEX idx_pages_chapter_id ON public.pages(chapter_id);

-- ========================================
-- BLOCO 6: HABILITAR RLS
-- ========================================
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- BLOCO 7: POLÍTICAS RLS - CHAPTERS
-- Execute uma por vez e veja se alguma dá erro
-- ========================================
CREATE POLICY "chapters_select"
  ON public.chapters
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "chapters_insert"
  ON public.chapters
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "chapters_update"
  ON public.chapters
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "chapters_delete"
  ON public.chapters
  FOR DELETE
  USING (user_id = auth.uid());

-- ========================================
-- BLOCO 8: POLÍTICAS RLS - PAGES
-- Execute uma por vez e veja se alguma dá erro
-- ========================================
CREATE POLICY "pages_select"
  ON public.pages
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "pages_insert"
  ON public.pages
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pages_update"
  ON public.pages
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "pages_delete"
  ON public.pages
  FOR DELETE
  USING (user_id = auth.uid());

-- ========================================
-- BLOCO 9: VERIFICAÇÃO
-- Deve mostrar as tabelas criadas
-- ========================================
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('chapters', 'pages')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

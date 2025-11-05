-- ============================================================================
-- FIX DEFINITIVO: Criar tabelas chapters e pages
-- Data: 2025-10-28
-- Baseado no padrão EXATO do schema.sql existente
-- ============================================================================

-- PASSO 1: Limpar tudo (se já executou antes)
DROP POLICY IF EXISTS "Usuários podem deletar suas páginas" ON public.pages;
DROP POLICY IF EXISTS "Usuários podem atualizar suas páginas" ON public.pages;
DROP POLICY IF EXISTS "Usuários podem inserir suas páginas" ON public.pages;
DROP POLICY IF EXISTS "Usuários podem ver suas páginas" ON public.pages;

DROP POLICY IF EXISTS "Usuários podem deletar seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem atualizar seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem inserir seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem ver seus capítulos" ON public.chapters;

DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;

-- PASSO 2: Criar tabela chapters (seguindo padrão do schema.sql)
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 3: Criar tabela pages (seguindo padrão do schema.sql)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 4: Habilitar RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Criar políticas RLS para chapters (EXATAMENTE como subjects)
CREATE POLICY "Usuários podem ver seus capítulos" ON public.chapters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus capítulos" ON public.chapters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus capítulos" ON public.chapters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus capítulos" ON public.chapters FOR DELETE USING (auth.uid() = user_id);

-- PASSO 6: Criar políticas RLS para pages (EXATAMENTE como subjects)
CREATE POLICY "Usuários podem ver suas páginas" ON public.pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas páginas" ON public.pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas páginas" ON public.pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas páginas" ON public.pages FOR DELETE USING (auth.uid() = user_id);

-- PASSO 7: Criar índices
CREATE INDEX idx_chapters_user_id ON public.chapters(user_id);
CREATE INDEX idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX idx_chapters_order ON public.chapters(order_index);

CREATE INDEX idx_pages_user_id ON public.pages(user_id);
CREATE INDEX idx_pages_chapter_id ON public.pages(chapter_id);
CREATE INDEX idx_pages_order ON public.pages(order_index);

-- PASSO 8: Verificação
SELECT 'Tabelas criadas com sucesso!' AS status;

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('chapters', 'pages')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

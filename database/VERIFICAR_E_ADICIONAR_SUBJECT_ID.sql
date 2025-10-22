-- ============================================
-- VERIFICAR E ADICIONAR subject_id em mindmaps
-- ============================================

-- 1. Verificar estrutura atual da tabela mindmaps
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mindmaps'
ORDER BY ordinal_position;

-- 2. Adicionar coluna subject_id se não existir
ALTER TABLE public.mindmaps
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;

-- 3. Verificar novamente (confirmar que foi adicionada)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mindmaps'
ORDER BY ordinal_position;

-- 4. Criar índice para performance (opcional mas recomendado)
CREATE INDEX IF NOT EXISTS idx_mindmaps_subject_id ON public.mindmaps(subject_id);

-- ✅ Pronto! Agora reinicie o servidor Node.js para limpar o cache

-- SCRIPT PARA ADICIONAR COLUNA DESCRIPTION NA TABELA STUDY_GOALS

-- Adicionar coluna description se não existir
ALTER TABLE public.study_goals
ADD COLUMN IF NOT EXISTS description TEXT;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'study_goals'
ORDER BY ordinal_position;

-- ============================================
-- ADICIONAR COLUNA subject_id à tabela saved_exercise_results
-- ============================================
-- Execute este SQL no Supabase SQL Editor
-- Vai adicionar a coluna apenas se ela não existir

-- Adicionar coluna subject_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'saved_exercise_results'
        AND column_name = 'subject_id'
    ) THEN
        ALTER TABLE public.saved_exercise_results
        ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;

        RAISE NOTICE '✅ Coluna subject_id adicionada com sucesso!';
    ELSE
        RAISE NOTICE '✅ Coluna subject_id já existe!';
    END IF;
END $$;

-- Verificar a estrutura da tabela
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'saved_exercise_results'
ORDER BY ordinal_position;

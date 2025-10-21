-- ============================================
-- VERIFICAR STATUS DA COLUNA subject_id
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a coluna existe
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'saved_exercise_results'
            AND column_name = 'subject_id'
        ) THEN '✅ Coluna subject_id EXISTE'
        ELSE '❌ Coluna subject_id NÃO EXISTE - Execute ADD_SUBJECT_ID_COLUMN.sql'
    END as status;

-- 2. Ver a estrutura completa da tabela
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'saved_exercise_results'
ORDER BY ordinal_position;

-- 3. Ver os exercícios existentes e seus subject_id
SELECT
    id,
    title,
    subject_id,
    CASE
        WHEN subject_id IS NULL THEN '⚠️ SEM MATÉRIA'
        ELSE '✅ COM MATÉRIA'
    END as status,
    total_questions,
    score_percentage,
    created_at
FROM public.saved_exercise_results
ORDER BY created_at DESC
LIMIT 20;

-- 4. Contar exercícios com e sem subject_id
SELECT
    COUNT(*) FILTER (WHERE subject_id IS NULL) as sem_materia,
    COUNT(*) FILTER (WHERE subject_id IS NOT NULL) as com_materia,
    COUNT(*) as total
FROM public.saved_exercise_results;

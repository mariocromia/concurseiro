-- ============================================
-- ASSOCIAR EXERCÍCIOS ANTIGOS A MATÉRIAS
-- ============================================
-- Este SQL associa os exercícios que não têm subject_id

-- PASSO 1: Ver suas matérias e seus IDs
SELECT id, name, color
FROM public.subjects
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'
ORDER BY name;

-- PASSO 2: Ver os exercícios sem matéria
SELECT id, title, created_at
FROM public.saved_exercise_results
WHERE subject_id IS NULL
ORDER BY created_at DESC;

-- ============================================
-- PASSO 3: ASSOCIAR EXERCÍCIOS A MATÉRIAS
-- ============================================
-- INSTRUÇÕES:
-- 1. Execute o PASSO 1 para ver o ID da matéria que você quer
-- 2. Copie o ID da matéria (exemplo: '3fa3b812-4a9b-4b5b-8779-7ad90ddc1b37')
-- 3. Substitua 'SEU_SUBJECT_ID_AQUI' pelo ID copiado
-- 4. Execute o UPDATE abaixo

-- Exemplo: Associar TODOS os exercícios sem matéria a uma matéria específica
-- UPDATE public.saved_exercise_results
-- SET subject_id = 'SEU_SUBJECT_ID_AQUI'
-- WHERE subject_id IS NULL;

-- Ou associar apenas exercícios com título específico:
-- UPDATE public.saved_exercise_results
-- SET subject_id = 'SEU_SUBJECT_ID_AQUI'
-- WHERE subject_id IS NULL
-- AND title LIKE '%História%';

-- ============================================
-- VERIFICAR RESULTADO
-- ============================================
-- Após executar o UPDATE, execute isto para conferir:
SELECT
    COUNT(*) FILTER (WHERE subject_id IS NULL) as sem_materia,
    COUNT(*) FILTER (WHERE subject_id IS NOT NULL) as com_materia,
    COUNT(*) as total
FROM public.saved_exercise_results;

-- Ver exercícios agrupados por matéria:
SELECT
    s.name as materia,
    COUNT(e.id) as quantidade_exercicios
FROM public.saved_exercise_results e
LEFT JOIN public.subjects s ON e.subject_id = s.id
GROUP BY s.name
ORDER BY quantidade_exercicios DESC;

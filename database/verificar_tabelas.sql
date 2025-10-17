-- SCRIPT PARA VERIFICAR SE AS TABELAS EXISTEM NO SUPABASE

-- 1. Verificar se as tabelas existem
SELECT
    table_name,
    table_type
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name IN (
        'users',
        'study_goals',
        'subjects',
        'study_sessions',
        'tasks',
        'notebooks',
        'revisions',
        'questions',
        'exams'
    )
ORDER BY
    table_name;

-- 2. Verificar colunas da tabela subjects
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'subjects'
ORDER BY
    ordinal_position;

-- 3. Verificar se há RLS (Row Level Security) habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    schemaname = 'public'
    AND tablename IN ('users', 'subjects', 'study_goals', 'study_sessions', 'tasks');

-- 4. Verificar políticas RLS da tabela subjects
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename = 'subjects';

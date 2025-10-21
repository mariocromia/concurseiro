-- ============================================
-- SCRIPT: Verificar dados de exercícios/questões
-- Data: 2025-10-20
-- ============================================

-- Seu user_id (substitua se necessário)
-- User ID: 0b17dba0-7c78-4c43-a2cf-f6d890f8d329
-- Email: netsacolas@gmail.com

-- ============================================
-- 1. VERIFICAR QUESTION_ATTEMPTS (Banco de Questões)
-- ============================================
SELECT
  'question_attempts' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_correct THEN 1 END) as total_acertos,
  COUNT(CASE WHEN NOT is_correct THEN 1 END) as total_erros,
  MIN(created_at) as primeira_tentativa,
  MAX(created_at) as ultima_tentativa
FROM public.question_attempts
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid;

-- Detalhes das últimas 10 tentativas
SELECT
  qa.id,
  qa.created_at,
  qa.is_correct,
  qa.selected_answer,
  q.question_text,
  q.correct_answer,
  s.name as materia
FROM public.question_attempts qa
LEFT JOIN public.questions q ON qa.question_id = q.id
LEFT JOIN public.subjects s ON q.subject_id = s.id
WHERE qa.user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY qa.created_at DESC
LIMIT 10;

-- ============================================
-- 2. VERIFICAR EXAM_RESULTS (Simulados)
-- ============================================
SELECT
  'exam_results' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_correct THEN 1 END) as total_acertos,
  COUNT(CASE WHEN NOT is_correct THEN 1 END) as total_erros,
  COUNT(DISTINCT exam_id) as total_simulados,
  MIN(answered_at) as primeira_resposta,
  MAX(answered_at) as ultima_resposta
FROM public.exam_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid;

-- Detalhes dos simulados
SELECT
  e.id,
  e.title,
  e.exam_type,
  e.total_questions,
  e.created_at,
  COUNT(er.id) as questoes_respondidas,
  COUNT(CASE WHEN er.is_correct THEN 1 END) as acertos,
  ROUND(
    (COUNT(CASE WHEN er.is_correct THEN 1 END)::numeric / NULLIF(COUNT(er.id), 0)) * 100,
    2
  ) as porcentagem
FROM public.exams e
LEFT JOIN public.exam_results er ON e.id = er.exam_id
WHERE e.user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
GROUP BY e.id, e.title, e.exam_type, e.total_questions, e.created_at
ORDER BY e.created_at DESC;

-- ============================================
-- 3. VERIFICAR SAVED_EXERCISE_RESULTS (Exercícios IA)
-- ============================================
SELECT
  'saved_exercise_results' as tabela,
  COUNT(*) as total_registros,
  SUM(total_questions) as soma_questoes,
  SUM(correct_answers) as soma_acertos,
  ROUND(AVG(score_percentage), 2) as media_nota,
  MIN(created_at) as primeiro_exercicio,
  MAX(created_at) as ultimo_exercicio
FROM public.saved_exercise_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid;

-- Detalhes dos exercícios IA
SELECT
  ser.id,
  ser.title,
  ser.total_questions,
  ser.correct_answers,
  ser.score_percentage,
  ser.created_at,
  s.name as materia,
  s.color
FROM public.saved_exercise_results ser
LEFT JOIN public.subjects s ON ser.subject_id = s.id
WHERE ser.user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY ser.created_at DESC
LIMIT 10;

-- ============================================
-- 4. RESUMO GERAL
-- ============================================
SELECT
  'RESUMO GERAL' as tipo,
  (SELECT COUNT(*) FROM public.question_attempts WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as tentativas_questoes,
  (SELECT COUNT(*) FROM public.exam_results WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as respostas_simulados,
  (SELECT COUNT(*) FROM public.saved_exercise_results WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as exercicios_ia;

-- ============================================
-- 5. VERIFICAR SE AS TABELAS EXISTEM
-- ============================================
SELECT
  table_name,
  CASE
    WHEN table_name IN (
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM (
  VALUES
    ('question_attempts'),
    ('exam_results'),
    ('saved_exercise_results'),
    ('questions'),
    ('exams')
) AS t(table_name);

-- ============================================
-- 6. VERIFICAR RLS (Row Level Security)
-- ============================================
SELECT
  schemaname,
  tablename,
  CASE
    WHEN rowsecurity THEN '🔒 RLS Ativado'
    ELSE '⚠️ RLS Desativado'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'question_attempts',
    'exam_results',
    'saved_exercise_results'
  )
ORDER BY tablename;

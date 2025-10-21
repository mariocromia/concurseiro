-- ============================================
-- SCRIPT: Verificar dados de exercícios/questões (SOMENTE CONSULTA)
-- Data: 2025-10-20
-- ============================================

-- Seu user_id (substitua se necessário)
-- User ID: 0b17dba0-7c78-4c43-a2cf-f6d890f8d329
-- Email: netsacolas@gmail.com

-- ============================================
-- RESUMO RÁPIDO - EXECUTE ESTE PRIMEIRO
-- ============================================
SELECT
  'RESUMO GERAL' as tipo,
  (SELECT COUNT(*) FROM public.question_attempts WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as tentativas_questoes,
  (SELECT COUNT(*) FROM public.exam_results WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as respostas_simulados,
  (SELECT COUNT(*) FROM public.saved_exercise_results WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as exercicios_ia;

-- ============================================
-- DETALHES: Question Attempts (Banco de Questões)
-- ============================================
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN is_correct THEN 1 END) as acertos,
  COUNT(CASE WHEN NOT is_correct THEN 1 END) as erros,
  ROUND(
    (COUNT(CASE WHEN is_correct THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as taxa_acerto_pct,
  MIN(created_at)::date as primeira_data,
  MAX(created_at)::date as ultima_data
FROM public.question_attempts
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid;

-- ============================================
-- DETALHES: Exam Results (Simulados)
-- ============================================
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN is_correct THEN 1 END) as acertos,
  COUNT(CASE WHEN NOT is_correct THEN 1 END) as erros,
  ROUND(
    (COUNT(CASE WHEN is_correct THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as taxa_acerto_pct,
  COUNT(DISTINCT exam_id) as total_simulados,
  MIN(answered_at)::date as primeira_data,
  MAX(answered_at)::date as ultima_data
FROM public.exam_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid;

-- ============================================
-- DETALHES: Saved Exercise Results (Exercícios IA)
-- ============================================
SELECT
  COUNT(*) as total_exercicios,
  SUM(total_questions) as total_questoes,
  SUM(correct_answers) as total_acertos,
  ROUND(
    (SUM(correct_answers)::numeric / NULLIF(SUM(total_questions), 0)) * 100,
    2
  ) as taxa_acerto_pct,
  ROUND(AVG(score_percentage), 2) as media_nota,
  MIN(created_at)::date as primeira_data,
  MAX(created_at)::date as ultima_data
FROM public.saved_exercise_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid;

-- ============================================
-- ÚLTIMOS 10 EXERCÍCIOS IA (se houver)
-- ============================================
SELECT
  title,
  total_questions as questoes,
  correct_answers as acertos,
  ROUND(score_percentage, 1) as nota,
  created_at::date as data,
  created_at::time as hora
FROM public.saved_exercise_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- ÚLTIMOS 10 SIMULADOS (se houver)
-- ============================================
SELECT
  e.title,
  e.total_questions as questoes_total,
  COUNT(er.id) as respondidas,
  COUNT(CASE WHEN er.is_correct THEN 1 END) as acertos,
  ROUND(
    (COUNT(CASE WHEN er.is_correct THEN 1 END)::numeric / NULLIF(COUNT(er.id), 0)) * 100,
    1
  ) as nota,
  e.created_at::date as data
FROM public.exams e
LEFT JOIN public.exam_results er ON e.id = er.exam_id
WHERE e.user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
GROUP BY e.id, e.title, e.total_questions, e.created_at
ORDER BY e.created_at DESC
LIMIT 10;

-- ============================================
-- ÚLTIMAS 10 QUESTÕES INDIVIDUAIS (se houver)
-- ============================================
SELECT
  CASE WHEN qa.is_correct THEN '✅' ELSE '❌' END as resultado,
  LEFT(q.question_text, 80) as questao,
  s.name as materia,
  qa.created_at::date as data,
  qa.created_at::time as hora
FROM public.question_attempts qa
LEFT JOIN public.questions q ON qa.question_id = q.id
LEFT JOIN public.subjects s ON q.subject_id = s.id
WHERE qa.user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY qa.created_at DESC
LIMIT 10;

-- ============================================
-- VERIFICAR SE TABELAS EXISTEM
-- ============================================
SELECT
  tablename,
  '✅ Existe' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'question_attempts',
    'exam_results',
    'saved_exercise_results',
    'questions',
    'exams'
  )
ORDER BY tablename;

-- ============================================
-- VERIFICAR RLS (Row Level Security)
-- ============================================
SELECT
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

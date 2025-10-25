-- QUERY DE TESTE: Verificar registros study_sessions após 25/10/2025
-- Execute esta query no SQL Editor do Supabase

-- 1. Total de registros na tabela
SELECT COUNT(*) as total_registros
FROM study_sessions;

-- 2. Registros após 25/10/2025
SELECT
  id,
  user_id,
  subject_id,
  started_at,
  duration,
  DATE(started_at) as data_sessao
FROM study_sessions
WHERE started_at > '2025-10-25T23:59:59Z'
ORDER BY started_at DESC
LIMIT 20;

-- 3. Contagem por data (últimos 10 dias)
SELECT
  DATE(started_at) as data,
  COUNT(*) as quantidade_sessoes,
  SUM(duration) as total_segundos,
  ROUND(SUM(duration) / 3600.0, 2) as total_horas
FROM study_sessions
WHERE started_at >= '2025-10-20T00:00:00Z'
GROUP BY DATE(started_at)
ORDER BY data DESC;

-- 4. Verificar dia 26/10/2025 especificamente
SELECT
  id,
  subject_id,
  started_at,
  duration,
  TO_CHAR(started_at, 'YYYY-MM-DD HH24:MI:SS') as data_hora_formatada
FROM study_sessions
WHERE DATE(started_at) = '2025-10-26'
ORDER BY started_at;

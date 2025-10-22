-- ============================================
-- 🚨 DIAGNÓSTICO URGENTE - PERDA DE DADOS NO CALENDÁRIO
-- ============================================
-- Execute TODOS estes comandos no Supabase SQL Editor
-- Copie os resultados de CADA query e me envie

-- ============================================
-- 1. VERIFICAR SE HÁ REGISTROS NA TABELA
-- ============================================
SELECT COUNT(*) as total_registros
FROM study_schedules;

-- ⬆️ RESULTADO ESPERADO:
-- Se = 0: Dados não foram salvos (problema no INSERT)
-- Se > 0: Dados foram salvos (problema no SELECT/carregamento)


-- ============================================
-- 2. VER OS ÚLTIMOS 20 REGISTROS CRIADOS
-- ============================================
SELECT
  id,
  user_id,
  subject_id,
  title,
  scheduled_date,

  -- Campos antigos (se existirem)
  scheduled_time,
  planned_duration,
  study_type,
  status,

  -- Campos novos (se existirem)
  start_time,
  duration,
  is_completed,

  color,
  created_at,
  updated_at
FROM study_schedules
ORDER BY created_at DESC
LIMIT 20;

-- ⬆️ RESULTADO ESPERADO:
-- Mostra os dados completos dos últimos registros
-- ATENÇÃO: Verifique se user_id está correto!
-- ATENÇÃO: Verifique quais campos têm dados (antigos ou novos)


-- ============================================
-- 3. VERIFICAR ESTRUTURA EXATA DA TABELA
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'study_schedules'
ORDER BY ordinal_position;

-- ⬆️ RESULTADO ESPERADO:
-- Lista TODAS as colunas da tabela
-- Mostra quais campos existem (start_time ou scheduled_time?)
-- Mostra quais são NOT NULL


-- ============================================
-- 4. VERIFICAR POLÍTICAS RLS (Row Level Security)
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,  -- comando: SELECT, INSERT, UPDATE, DELETE
  qual, -- condição USING
  with_check -- condição WITH CHECK
FROM pg_policies
WHERE tablename = 'study_schedules';

-- ⬆️ RESULTADO ESPERADO:
-- Lista todas as políticas de segurança
-- DEVE ter política para SELECT
-- Política deve permitir: auth.uid() = user_id


-- ============================================
-- 5. CONTAR REGISTROS POR USUÁRIO
-- ============================================
SELECT
  user_id,
  COUNT(*) as quantidade_atividades,
  MIN(created_at) as primeira_criacao,
  MAX(created_at) as ultima_criacao
FROM study_schedules
GROUP BY user_id
ORDER BY quantidade_atividades DESC;

-- ⬆️ RESULTADO ESPERADO:
-- Mostra quantas atividades cada usuário tem
-- Ajuda a identificar se salvou com user_id errado


-- ============================================
-- 6. VERIFICAR SE RLS ESTÁ ATIVADO
-- ============================================
SELECT
  tablename,
  rowsecurity as rls_ativado
FROM pg_tables
WHERE tablename = 'study_schedules';

-- ⬆️ RESULTADO ESPERADO:
-- rls_ativado = true: RLS está ativo (correto)
-- rls_ativado = false: RLS desativado (pode causar problemas)


-- ============================================
-- 7. TESTAR SELECT SIMULANDO USUÁRIO
-- ============================================
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo user_id do usuário logado
-- Para pegar seu user_id, execute primeiro: SELECT auth.uid();

SELECT
  id,
  title,
  scheduled_date,
  COALESCE(start_time::text, scheduled_time::text) as horario,
  COALESCE(duration, planned_duration) as duracao_minutos,
  COALESCE(is_completed, (status = 'completed')) as concluida
FROM study_schedules
WHERE user_id = auth.uid()  -- Usa o user_id do usuário autenticado
ORDER BY scheduled_date DESC, created_at DESC
LIMIT 20;

-- ⬆️ RESULTADO ESPERADO:
-- Se retornar registros: Dados existem e políticas funcionam
-- Se retornar vazio: Ou não há dados, ou políticas bloqueiam, ou user_id diferente


-- ============================================
-- 8. VERIFICAR CAMPOS OBRIGATÓRIOS (NOT NULL)
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'study_schedules'
  AND is_nullable = 'NO'  -- Apenas campos obrigatórios
ORDER BY ordinal_position;

-- ⬆️ RESULTADO ESPERADO:
-- Lista todos os campos que NÃO podem ser NULL
-- Ajuda a entender quais campos DEVEM ser preenchidos no INSERT


-- ============================================
-- 9. VERIFICAR SE HÁ REGISTROS HOJE
-- ============================================
SELECT
  COUNT(*) as registros_hoje,
  MIN(created_at) as primeiro_hoje,
  MAX(created_at) as ultimo_hoje
FROM study_schedules
WHERE DATE(created_at) = CURRENT_DATE;

-- ⬆️ RESULTADO ESPERADO:
-- Se > 0: Houve inserções hoje (provavelmente as que você testou)
-- Se = 0: Não houve inserções hoje (dados são antigos ou não salvaram)


-- ============================================
-- 10. VERIFICAR INTEGRIDADE DOS DADOS
-- ============================================
SELECT
  'Registros sem user_id' as problema,
  COUNT(*) as quantidade
FROM study_schedules
WHERE user_id IS NULL

UNION ALL

SELECT
  'Registros sem título' as problema,
  COUNT(*) as quantidade
FROM study_schedules
WHERE title IS NULL OR title = ''

UNION ALL

SELECT
  'Registros sem data' as problema,
  COUNT(*) as quantidade
FROM study_schedules
WHERE scheduled_date IS NULL;

-- ⬆️ RESULTADO ESPERADO:
-- Todas as quantidades devem ser 0
-- Se > 0: Há dados incompletos/corrompidos


-- ============================================
-- INSTRUÇÕES PARA VOCÊ
-- ============================================
/*

EXECUTE CADA QUERY ACIMA NO SUPABASE SQL EDITOR E ME ENVIE:

✅ Query 1: Total de registros
✅ Query 2: Últimos 20 registros (copie TUDO)
✅ Query 3: Estrutura da tabela (lista de colunas)
✅ Query 4: Políticas RLS
✅ Query 5: Registros por usuário
✅ Query 6: Se RLS está ativado
✅ Query 7: Registros do usuário logado
✅ Query 8: Campos obrigatórios
✅ Query 9: Registros de hoje
✅ Query 10: Problemas de integridade

TAMBÉM ME ENVIE:
📸 Screenshots dos resultados
📋 Logs do console ao recarregar a página (F12)
🔍 Qualquer erro que aparecer

Com essas informações, identificarei EXATAMENTE o problema! 🎯

*/

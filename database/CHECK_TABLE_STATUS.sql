-- ============================================
-- SCRIPT DE VERIFICAÇÃO: study_schedules
-- Execute este script no Supabase SQL Editor para verificar o status da tabela
-- ============================================

-- 🔍 Verificar se a tabela existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'study_schedules'
  ) THEN
    RAISE NOTICE '✅ Tabela study_schedules EXISTE';
  ELSE
    RAISE NOTICE '❌ Tabela study_schedules NÃO EXISTE - precisa executar a migração!';
  END IF;
END $$;

-- 📊 Mostrar estrutura da tabela
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'study_schedules'
ORDER BY ordinal_position;

-- 🔒 Verificar políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'study_schedules';

-- 📈 Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'study_schedules';

-- 📝 Contar registros na tabela (se existir)
DO $$
DECLARE
  record_count INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'study_schedules'
  ) THEN
    SELECT COUNT(*) INTO record_count FROM study_schedules;
    RAISE NOTICE '📝 Total de registros na tabela: %', record_count;
  END IF;
END $$;

-- ✅ Verificar colunas essenciais para o calendário
DO $$
DECLARE
  has_title BOOLEAN;
  has_description BOOLEAN;
  has_scheduled_date BOOLEAN;
  has_start_time BOOLEAN;
  has_duration BOOLEAN;
  has_is_completed BOOLEAN;
  has_color BOOLEAN;
  has_subject_id BOOLEAN;
  subject_id_nullable BOOLEAN;
BEGIN
  -- Verificar cada coluna
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'title') INTO has_title;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'description') INTO has_description;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'scheduled_date') INTO has_scheduled_date;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'start_time') INTO has_start_time;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'duration') INTO has_duration;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'is_completed') INTO has_is_completed;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'color') INTO has_color;
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'study_schedules' AND column_name = 'subject_id') INTO has_subject_id;

  -- Verificar se subject_id permite NULL
  SELECT is_nullable = 'YES' INTO subject_id_nullable
  FROM information_schema.columns
  WHERE table_name = 'study_schedules' AND column_name = 'subject_id';

  -- Exibir resultado
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '📋 VERIFICAÇÃO DE COLUNAS ESSENCIAIS';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'title: %', CASE WHEN has_title THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'description: %', CASE WHEN has_description THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'scheduled_date: %', CASE WHEN has_scheduled_date THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'start_time: %', CASE WHEN has_start_time THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'duration: %', CASE WHEN has_duration THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'is_completed: %', CASE WHEN has_is_completed THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'color: %', CASE WHEN has_color THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'subject_id: %', CASE WHEN has_subject_id THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'subject_id permite NULL: %', CASE WHEN subject_id_nullable THEN '✅' ELSE '❌ (precisa permitir para eventos)' END;
  RAISE NOTICE '============================================';

  -- Verificar se todas as colunas existem
  IF has_title AND has_description AND has_scheduled_date AND has_start_time AND has_duration AND has_is_completed AND has_color AND has_subject_id AND subject_id_nullable THEN
    RAISE NOTICE '✅ PERFEITO! Todas as colunas necessárias existem';
    RAISE NOTICE '🚀 O calendário deve funcionar corretamente';
  ELSE
    RAISE NOTICE '⚠️ ATENÇÃO! Algumas colunas estão faltando ou mal configuradas';
    RAISE NOTICE '📝 Execute a migração: 2025-10-22_fix_study_schedules_for_calendar.sql';
  END IF;
  RAISE NOTICE '';
END $$;

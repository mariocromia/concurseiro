-- ============================================
-- MIGRAÇÃO: Ajustar study_schedules para o Calendário de Estudos
-- Data: 2025-10-22
-- Descrição: Adiciona/ajusta colunas necessárias para o calendário funcionar
-- ============================================

-- 🔍 Primeiro, vamos garantir que a tabela existe
CREATE TABLE IF NOT EXISTS study_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL, -- Permitir NULL para eventos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ Adicionar colunas necessárias para o calendário (se não existirem)

-- Título da atividade
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'title'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Nova Atividade';
    RAISE NOTICE '✅ Coluna title adicionada';
  ELSE
    RAISE NOTICE '⏭️ Coluna title já existe';
  END IF;
END $$;

-- Descrição da atividade
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'description'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN description TEXT;
    RAISE NOTICE '✅ Coluna description adicionada';
  ELSE
    RAISE NOTICE '⏭️ Coluna description já existe';
  END IF;
END $$;

-- Data do agendamento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE;
    RAISE NOTICE '✅ Coluna scheduled_date adicionada';
  ELSE
    RAISE NOTICE '⏭️ Coluna scheduled_date já existe';
  END IF;
END $$;

-- Horário de início (TIME ao invés de scheduled_time)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN start_time TIME NOT NULL DEFAULT '08:00';
    RAISE NOTICE '✅ Coluna start_time adicionada';
  ELSE
    RAISE NOTICE '⏭️ Coluna start_time já existe';
  END IF;
END $$;

-- Duração em minutos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'duration'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN duration INTEGER NOT NULL DEFAULT 60;
    RAISE NOTICE '✅ Coluna duration adicionada';
  ELSE
    RAISE NOTICE '⏭️ Coluna duration já existe';
  END IF;
END $$;

-- Status de conclusão (booleano simples)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN is_completed BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ Coluna is_completed adicionada';
  ELSE
    RAISE NOTICE '⏭️ Coluna is_completed já existe';
  END IF;
END $$;

-- Cor do agendamento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'color'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN color VARCHAR(7);
    RAISE NOTICE '✅ Coluna color adicionada';
  ELSE
    RAISE NOTICE '⏭️ Coluna color já existe';
  END IF;
END $$;

-- ✅ Tornar subject_id NULLABLE (para permitir eventos sem matéria)
DO $$
BEGIN
  ALTER TABLE study_schedules ALTER COLUMN subject_id DROP NOT NULL;
  RAISE NOTICE '✅ subject_id agora permite NULL (para eventos)';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⏭️ subject_id já permite NULL ou houve erro: %', SQLERRM;
END $$;

-- ✅ Remover DEFAULT das colunas essenciais (se existir)
DO $$
BEGIN
  ALTER TABLE study_schedules ALTER COLUMN title DROP DEFAULT;
  ALTER TABLE study_schedules ALTER COLUMN scheduled_date DROP DEFAULT;
  ALTER TABLE study_schedules ALTER COLUMN start_time DROP DEFAULT;
  ALTER TABLE study_schedules ALTER COLUMN duration DROP DEFAULT;
  RAISE NOTICE '✅ DEFAULTs removidos de colunas essenciais';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⏭️ Alguns defaults não existiam ou houve erro: %', SQLERRM;
END $$;

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_study_schedules_user_id ON study_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_study_schedules_subject_id ON study_schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_schedules_scheduled_date ON study_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_study_schedules_is_completed ON study_schedules(is_completed);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE study_schedules ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own schedules" ON study_schedules;
DROP POLICY IF EXISTS "Users can insert own schedules" ON study_schedules;
DROP POLICY IF EXISTS "Users can update own schedules" ON study_schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON study_schedules;

-- Criar políticas novas
CREATE POLICY "Users can view own schedules"
  ON study_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
  ON study_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON study_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON study_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_study_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS study_schedules_updated_at ON study_schedules;
CREATE TRIGGER study_schedules_updated_at
  BEFORE UPDATE ON study_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_study_schedules_updated_at();

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'study_schedules'
  AND column_name IN ('title', 'description', 'scheduled_date', 'start_time', 'duration', 'is_completed', 'color');

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '📊 VERIFICAÇÃO DA TABELA study_schedules';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Colunas essenciais encontradas: %/7', column_count;

  IF column_count = 7 THEN
    RAISE NOTICE '✅ SUCESSO! Tabela configurada corretamente para o calendário';
  ELSE
    RAISE NOTICE '⚠️ ATENÇÃO! Algumas colunas podem estar faltando';
  END IF;

  RAISE NOTICE '============================================';
END $$;

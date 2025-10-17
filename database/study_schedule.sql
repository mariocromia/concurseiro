-- Tabela de agendamentos de estudo
CREATE TABLE IF NOT EXISTS study_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,

  -- Data e hora
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  planned_duration INTEGER NOT NULL, -- em minutos

  -- Tipo de estudo
  study_type VARCHAR(20) NOT NULL CHECK (study_type IN ('conteudo', 'questoes', 'revisao')),
  planned_questions INTEGER, -- quantidade planejada de questões

  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('daily', 'weekly', 'custom')),
  recurrence_days INTEGER[], -- dias da semana (0=domingo, 6=sábado)
  recurrence_end_date DATE,
  parent_schedule_id UUID REFERENCES study_schedules(id) ON DELETE CASCADE,

  -- Status e conclusão
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  actual_duration INTEGER, -- duração real em minutos
  completed_questions INTEGER, -- questões realmente feitas
  correct_questions INTEGER, -- questões corretas
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna correct_questions se não existir (para tabelas já criadas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'study_schedules' AND column_name = 'correct_questions'
  ) THEN
    ALTER TABLE study_schedules ADD COLUMN correct_questions INTEGER;
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_study_schedules_user_id ON study_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_study_schedules_subject_id ON study_schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_schedules_scheduled_date ON study_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_study_schedules_status ON study_schedules(status);
CREATE INDEX IF NOT EXISTS idx_study_schedules_parent ON study_schedules(parent_schedule_id);

-- RLS Policies
ALTER TABLE study_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own schedules" ON study_schedules;
CREATE POLICY "Users can view own schedules"
  ON study_schedules FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own schedules" ON study_schedules;
CREATE POLICY "Users can insert own schedules"
  ON study_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own schedules" ON study_schedules;
CREATE POLICY "Users can update own schedules"
  ON study_schedules FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own schedules" ON study_schedules;
CREATE POLICY "Users can delete own schedules"
  ON study_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
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

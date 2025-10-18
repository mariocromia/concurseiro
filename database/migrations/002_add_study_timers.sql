-- ============================================
-- MIGRATION: Add study_timers table
-- Created: 2025-10-18
-- Purpose: Persistent server-controlled study timers
-- ============================================

-- Create study_timers table
CREATE TABLE IF NOT EXISTS public.study_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  activity_name VARCHAR(255),
  study_type VARCHAR(20) NOT NULL CHECK (study_type IN ('conteudo', 'questoes', 'revisao')),
  planned_questions INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  is_running BOOLEAN DEFAULT true NOT NULL,
  elapsed_seconds INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_study_timers_user_id ON public.study_timers(user_id);
CREATE INDEX idx_study_timers_user_running ON public.study_timers(user_id, is_running) WHERE is_running = true;
CREATE INDEX idx_study_timers_created_at ON public.study_timers(created_at);

-- Create unique index to prevent multiple active timers per user
CREATE UNIQUE INDEX idx_one_active_timer_per_user
  ON public.study_timers(user_id)
  WHERE is_running = true;

-- Enable RLS
ALTER TABLE public.study_timers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Usuários podem ver seus próprios timers"
  ON public.study_timers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios timers"
  ON public.study_timers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios timers"
  ON public.study_timers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios timers"
  ON public.study_timers FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_study_timers_updated_at
  BEFORE UPDATE ON public.study_timers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.study_timers IS 'Server-controlled persistent study timers that continue running even when browser/PC is closed';

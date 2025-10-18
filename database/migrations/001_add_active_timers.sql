-- ============================================
-- MIGRATION: Adicionar tabela active_timers
-- Data: 2025-10-18
-- Descrição: Tabela para gerenciar cronômetros ativos do sistema
-- ============================================

-- Criar tabela active_timers
CREATE TABLE IF NOT EXISTS public.active_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  study_type VARCHAR(20) NOT NULL CHECK (study_type IN ('conteudo', 'questoes', 'revisao')),
  planned_questions INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_running BOOLEAN DEFAULT true,
  is_paused BOOLEAN DEFAULT false,
  paused_at TIMESTAMP WITH TIME ZONE,
  paused_elapsed_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_active_timers_user_id ON public.active_timers(user_id);
CREATE INDEX idx_active_timers_is_running ON public.active_timers(is_running);

-- Habilitar RLS
ALTER TABLE public.active_timers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios timers" ON public.active_timers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios timers" ON public.active_timers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios timers" ON public.active_timers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios timers" ON public.active_timers
  FOR DELETE USING (auth.uid() = user_id);

-- Constraint: apenas um timer ativo por usuário
CREATE UNIQUE INDEX idx_one_active_timer_per_user
  ON public.active_timers(user_id)
  WHERE is_running = true;

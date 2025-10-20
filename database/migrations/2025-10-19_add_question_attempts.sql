-- ============================================
-- MIGRATION: Adicionar tabela question_attempts
-- Data: 2025-10-19
-- Descrição: Cria tabela para armazenar tentativas de resposta às questões
-- ============================================

-- Criar tabela question_attempts
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  selected_answer CHAR(1), -- 'A', 'B', 'C', 'D', 'E'
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON public.question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id ON public.question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_created_at ON public.question_attempts(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver suas próprias tentativas"
  ON public.question_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias tentativas"
  ON public.question_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias tentativas"
  ON public.question_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias tentativas"
  ON public.question_attempts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentário da tabela
COMMENT ON TABLE public.question_attempts IS 'Armazena tentativas de resposta às questões do banco de questões';
COMMENT ON COLUMN public.question_attempts.time_spent_seconds IS 'Tempo gasto para responder a questão (em segundos)';

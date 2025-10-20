-- ============================================
-- Migration: Adicionar colunas study_type e planned_questions
-- Data: 2025-10-20
-- Descrição: Permite registrar o tipo de estudo (conteúdo, questões, revisão)
--            e quantidade planejada de questões
-- ============================================

-- Adicionar coluna study_type
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS study_type TEXT DEFAULT 'conteudo' CHECK (study_type IN ('conteudo', 'questoes', 'revisao'));

-- Adicionar coluna planned_questions (para quando study_type = 'questoes')
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS planned_questions INTEGER;

-- Adicionar comentários
COMMENT ON COLUMN public.study_sessions.study_type IS 'Tipo de estudo: conteudo (padrão), questoes ou revisao';
COMMENT ON COLUMN public.study_sessions.planned_questions IS 'Quantidade planejada de questões quando study_type = questoes';

-- Criar índice para melhorar performance de queries por tipo
CREATE INDEX IF NOT EXISTS idx_study_sessions_study_type ON public.study_sessions(study_type);

-- ============================================
-- ROLLBACK (caso necessário):
-- ============================================
-- ALTER TABLE public.study_sessions DROP COLUMN IF EXISTS study_type;
-- ALTER TABLE public.study_sessions DROP COLUMN IF EXISTS planned_questions;
-- DROP INDEX IF EXISTS idx_study_sessions_study_type;

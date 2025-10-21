-- ============================================
-- ADICIONAR COLUNA study_type EM study_sessions
-- ============================================
-- Este SQL adiciona o campo study_type na tabela study_sessions
-- para diferenciar entre conteúdo, questões e revisão

-- Adicionar coluna study_type (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'study_sessions'
    AND column_name = 'study_type'
  ) THEN
    ALTER TABLE public.study_sessions
    ADD COLUMN study_type VARCHAR(20) DEFAULT 'conteudo'
    CHECK (study_type IN ('conteudo', 'questoes', 'revisao'));

    RAISE NOTICE 'Coluna study_type adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna study_type já existe.';
  END IF;
END $$;

-- Adicionar colunas de questões (se não existirem)
DO $$
BEGIN
  -- completed_questions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'study_sessions'
    AND column_name = 'completed_questions'
  ) THEN
    ALTER TABLE public.study_sessions
    ADD COLUMN completed_questions INTEGER DEFAULT 0;

    RAISE NOTICE 'Coluna completed_questions adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna completed_questions já existe.';
  END IF;

  -- correct_questions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'study_sessions'
    AND column_name = 'correct_questions'
  ) THEN
    ALTER TABLE public.study_sessions
    ADD COLUMN correct_questions INTEGER DEFAULT 0;

    RAISE NOTICE 'Coluna correct_questions adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna correct_questions já existe.';
  END IF;
END $$;

-- ============================================
-- VERIFICAR RESULTADO
-- ============================================
-- Execute isto para confirmar:
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'study_sessions'
AND column_name IN ('study_type', 'completed_questions', 'correct_questions')
ORDER BY column_name;

-- Ver estrutura completa da tabela:
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'study_sessions'
ORDER BY ordinal_position;

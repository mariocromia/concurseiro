-- ============================================
-- EXECUTAR ESTE SQL NO SUPABASE IMEDIATAMENTE
-- ============================================

-- 1. Criar tabela study_timers
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

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_study_timers_user_id ON public.study_timers(user_id);
CREATE INDEX IF NOT EXISTS idx_study_timers_user_running ON public.study_timers(user_id, is_running) WHERE is_running = true;
CREATE INDEX IF NOT EXISTS idx_study_timers_created_at ON public.study_timers(created_at);

-- 3. Constraint único (1 timer ativo por usuário)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_timer_per_user
  ON public.study_timers(user_id)
  WHERE is_running = true;

-- 4. Habilitar RLS
ALTER TABLE public.study_timers ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (DROP se já existir)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios timers" ON public.study_timers;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios timers" ON public.study_timers;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios timers" ON public.study_timers;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios timers" ON public.study_timers;

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

-- 6. Comentário
COMMENT ON TABLE public.study_timers IS 'Server-controlled persistent study timers';

-- ============================================
-- VERIFICAR SE DEU CERTO
-- ============================================
SELECT 'Tabela study_timers criada com sucesso!' as status;
SELECT tablename, schemaname FROM pg_tables WHERE tablename = 'study_timers';

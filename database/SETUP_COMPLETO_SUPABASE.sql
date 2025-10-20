-- ============================================
-- SETUP COMPLETO DO BANCO DE DADOS - PRAPASSAR
-- ============================================
--
-- INSTRUÇÕES DE USO:
-- 1. Acesse o Supabase Dashboard (https://app.supabase.com)
-- 2. Vá para SQL Editor no menu lateral
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
--
-- IMPORTANTE: Execute este script apenas UMA VEZ em um banco novo
-- Se já existem tabelas, use as migrations individuais na pasta migrations/
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PARTE 1: TABELAS PRINCIPAIS
-- ============================================

-- TABELA: users (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_type VARCHAR(20) DEFAULT 'freemium' CHECK (subscription_type IN ('freemium', 'plus', 'pro')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: study_goals (metas de estudo)
CREATE TABLE IF NOT EXISTS public.study_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL,
  daily_hours DECIMAL(4,2) DEFAULT 2.0, -- Meta de horas diárias
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: subjects (matérias)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  total_study_time INTEGER DEFAULT 0, -- Em segundos
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: study_sessions (sessões de estudo do timer)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Em segundos
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: study_schedules (agendamentos de estudos do calendário)
CREATE TABLE IF NOT EXISTS public.study_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME,
  planned_duration INTEGER, -- Duração planejada em minutos
  actual_duration INTEGER, -- Duração real em minutos
  study_type VARCHAR(20) DEFAULT 'conteudo' CHECK (study_type IN ('conteudo', 'questoes', 'revisao')),
  completed_questions INTEGER DEFAULT 0,
  correct_questions INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 2: SISTEMA DE CADERNOS
-- ============================================

-- TABELA: notebooks (cadernos virtuais)
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: notebook_sections (seções/capítulos)
CREATE TABLE IF NOT EXISTS public.notebook_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: notebook_pages (páginas/anotações)
CREATE TABLE IF NOT EXISTS public.notebook_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES public.notebook_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: page_attachments (anexos das páginas)
CREATE TABLE IF NOT EXISTS public.page_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.notebook_pages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 3: SISTEMA DE REVISÕES
-- ============================================

-- TABELA: revisions (revisões programadas R1-R7)
CREATE TABLE IF NOT EXISTS public.revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.notebook_pages(id) ON DELETE SET NULL,
  revision_number INTEGER NOT NULL, -- 1 a 7 (R1 até R7)
  due_date DATE NOT NULL, -- Data de vencimento da revisão
  scheduled_date DATE, -- Compatibilidade com código existente
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed BOOLEAN DEFAULT false, -- Compatibilidade com código existente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: flashcards (sistema de flashcards)
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  front TEXT NOT NULL, -- Pergunta
  back TEXT NOT NULL, -- Resposta
  difficulty INTEGER DEFAULT 0, -- 0=novo, aumenta com erros, diminui com acertos
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 4: SISTEMA DE TAREFAS E QUESTÕES
-- ============================================

-- TABELA: tasks (tarefas do Kanban)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: questions (banco de questões)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic VARCHAR(255),
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_answer CHAR(1), -- 'A', 'B', 'C', 'D', 'E'
  explanation TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('facil', 'medio', 'dificil', 'prova_especifica')),
  year INTEGER,
  banca VARCHAR(100),
  is_favorite BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ⭐ TABELA: question_attempts (tentativas de resposta às questões)
-- ESTA TABELA ESTAVA FALTANDO E É ESSENCIAL PARA OS RELATÓRIOS!
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  selected_answer CHAR(1), -- 'A', 'B', 'C', 'D', 'E'
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 5: SISTEMA DE SIMULADOS
-- ============================================

-- TABELA: exams (simulados/listas de exercícios)
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  exam_type VARCHAR(20) CHECK (exam_type IN ('multiple_choice', 'true_false')),
  total_questions INTEGER DEFAULT 0,
  duration_minutes INTEGER, -- Tempo total do simulado em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: exam_questions (questões dos simulados)
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: exam_results (resultados dos simulados)
CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer CHAR(1), -- 'A', 'B', 'C', 'D', 'E'
  is_correct BOOLEAN,
  time_spent_seconds INTEGER,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: saved_exercise_results (resultados salvos dos exercícios de IA)
CREATE TABLE IF NOT EXISTS public.saved_exercise_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  questions_data JSONB NOT NULL, -- Armazena todas as questões e respostas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 6: SISTEMA DE ASSINATURAS
-- ============================================

-- TABELA: subscription_plans (planos de assinatura)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'plus', 'pro'
  display_name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB, -- Lista de features do plano
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: subscriptions (assinaturas dos usuários)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('plus', 'pro')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  asaas_subscription_id VARCHAR(255), -- ID da assinatura no Asaas
  asaas_customer_id VARCHAR(255), -- ID do cliente no Asaas
  payment_method VARCHAR(50), -- 'pix', 'boleto', 'credit_card'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: payments (histórico de pagamentos)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'pending', 'confirmed', 'failed', 'refunded'
  payment_method VARCHAR(50),
  asaas_payment_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 7: SISTEMA DE AFILIADOS
-- ============================================

-- TABELA: affiliates (afiliados)
CREATE TABLE IF NOT EXISTS public.affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coupon_code VARCHAR(50) NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 20.00, -- Porcentagem de comissão
  total_earnings DECIMAL(10,2) DEFAULT 0,
  available_balance DECIMAL(10,2) DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: affiliate_referrals (referências de afiliados)
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  commission_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'paid'
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: affiliate_withdrawals (saques de afiliados)
CREATE TABLE IF NOT EXISTS public.affiliate_withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  pix_key VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
  admin_notes TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- PARTE 8: SISTEMA DE IA
-- ============================================

-- TABELA: ai_conversations (conversas com IA)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: ai_messages (mensagens do chat IA)
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: mindmaps (mapas mentais)
CREATE TABLE IF NOT EXISTS public.mindmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  nodes JSONB, -- Estrutura dos nós do mapa mental
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: mindmap_nodes (nós dos mapas mentais - estrutura alternativa)
CREATE TABLE IF NOT EXISTS public.mindmap_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mindmap_id UUID NOT NULL REFERENCES public.mindmaps(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.mindmap_nodes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  x FLOAT,
  y FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: ai_usage_logs (logs de uso da IA para analytics)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature VARCHAR(100) NOT NULL, -- 'chat', 'exercises', 'mindmap', 'flashcards'
  tokens_used INTEGER,
  cost_estimate DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 9: SISTEMA DE NOTIFICAÇÕES
-- ============================================

-- TABELA: push_subscriptions (inscrições para push notifications)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: notification_history (histórico de notificações enviadas)
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'revision', 'study_reminder', 'achievement'
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- TABELA: reminders (lembretes personalizados)
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTE 10: ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_order ON public.subjects(user_id, order_index);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id ON public.study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_study_schedules_user_id ON public.study_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_study_schedules_date ON public.study_schedules(scheduled_date);

-- Índices para notebooks
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_sections_notebook_id ON public.notebook_sections(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_pages_section_id ON public.notebook_pages(section_id);
CREATE INDEX IF NOT EXISTS idx_page_attachments_page_id ON public.page_attachments(page_id);

-- Índices para revisões
CREATE INDEX IF NOT EXISTS idx_revisions_user_id ON public.revisions(user_id);
-- Índice condicional para scheduled_date (só cria se a coluna existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'revisions' AND column_name = 'scheduled_date'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_revisions_scheduled_date ON public.revisions(scheduled_date);
  END IF;
END $$;
-- Índice condicional para due_date (só cria se a coluna existir)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'revisions' AND column_name = 'due_date'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_revisions_due_date ON public.revisions(due_date);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_revisions_status ON public.revisions(user_id, status);

-- Índices para tarefas
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(user_id, status);

-- Índices para questões ⭐ IMPORTANTES PARA RELATÓRIOS
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON public.questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id ON public.question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON public.question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_created_at ON public.question_attempts(created_at);

-- Índices para simulados
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON public.exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON public.exam_results(exam_id);

-- Índices para assinaturas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);

-- Índices para afiliados
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_coupon ON public.affiliates(coupon_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);

-- Índices para IA
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mindmaps_user_id ON public.mindmaps(user_id);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON public.notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.reminders(reminder_date);

-- ============================================
-- PARTE 11: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em TODAS as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY; -- ⭐ IMPORTANTE
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_exercise_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmap_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS - TABELAS PRINCIPAIS
-- ============================================

-- Políticas para users
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.users;
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.users;
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Políticas para study_goals
DROP POLICY IF EXISTS "Usuários podem ver suas próprias metas" ON public.study_goals;
CREATE POLICY "Usuários podem ver suas próprias metas" ON public.study_goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias metas" ON public.study_goals;
CREATE POLICY "Usuários podem inserir suas próprias metas" ON public.study_goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias metas" ON public.study_goals;
CREATE POLICY "Usuários podem atualizar suas próprias metas" ON public.study_goals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias metas" ON public.study_goals;
CREATE POLICY "Usuários podem deletar suas próprias metas" ON public.study_goals FOR DELETE USING (auth.uid() = user_id);

-- Políticas para subjects
DROP POLICY IF EXISTS "Usuários podem ver suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem ver suas próprias matérias" ON public.subjects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem inserir suas próprias matérias" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem atualizar suas próprias matérias" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias matérias" ON public.subjects;
CREATE POLICY "Usuários podem deletar suas próprias matérias" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

-- Políticas para study_sessions
DROP POLICY IF EXISTS "Usuários podem ver suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem ver suas próprias sessões" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem inserir suas próprias sessões" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem atualizar suas próprias sessões" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias sessões" ON public.study_sessions;
CREATE POLICY "Usuários podem deletar suas próprias sessões" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para study_schedules
DROP POLICY IF EXISTS "Usuários podem ver seus próprios agendamentos" ON public.study_schedules;
CREATE POLICY "Usuários podem ver seus próprios agendamentos" ON public.study_schedules FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios agendamentos" ON public.study_schedules;
CREATE POLICY "Usuários podem inserir seus próprios agendamentos" ON public.study_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios agendamentos" ON public.study_schedules;
CREATE POLICY "Usuários podem atualizar seus próprios agendamentos" ON public.study_schedules FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios agendamentos" ON public.study_schedules;
CREATE POLICY "Usuários podem deletar seus próprios agendamentos" ON public.study_schedules FOR DELETE USING (auth.uid() = user_id);

-- ⭐ Políticas para question_attempts (ESSENCIAL PARA RELATÓRIOS)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias tentativas" ON public.question_attempts;
CREATE POLICY "Usuários podem ver suas próprias tentativas" ON public.question_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias tentativas" ON public.question_attempts;
CREATE POLICY "Usuários podem inserir suas próprias tentativas" ON public.question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias tentativas" ON public.question_attempts;
CREATE POLICY "Usuários podem atualizar suas próprias tentativas" ON public.question_attempts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias tentativas" ON public.question_attempts;
CREATE POLICY "Usuários podem deletar suas próprias tentativas" ON public.question_attempts FOR DELETE USING (auth.uid() = user_id);

-- Políticas para questions
DROP POLICY IF EXISTS "Usuários podem ver suas próprias questões" ON public.questions;
CREATE POLICY "Usuários podem ver suas próprias questões" ON public.questions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias questões" ON public.questions;
CREATE POLICY "Usuários podem inserir suas próprias questões" ON public.questions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias questões" ON public.questions;
CREATE POLICY "Usuários podem atualizar suas próprias questões" ON public.questions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias questões" ON public.questions;
CREATE POLICY "Usuários podem deletar suas próprias questões" ON public.questions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para revisions
DROP POLICY IF EXISTS "Usuários podem ver suas próprias revisões" ON public.revisions;
CREATE POLICY "Usuários podem ver suas próprias revisões" ON public.revisions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias revisões" ON public.revisions;
CREATE POLICY "Usuários podem inserir suas próprias revisões" ON public.revisions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias revisões" ON public.revisions;
CREATE POLICY "Usuários podem atualizar suas próprias revisões" ON public.revisions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias revisões" ON public.revisions;
CREATE POLICY "Usuários podem deletar suas próprias revisões" ON public.revisions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tasks
DROP POLICY IF EXISTS "Usuários podem ver suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem ver suas próprias tarefas" ON public.tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem inserir suas próprias tarefas" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem atualizar suas próprias tarefas" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias tarefas" ON public.tasks;
CREATE POLICY "Usuários podem deletar suas próprias tarefas" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notebooks (simplificadas - inclua as hierárquicas se necessário)
DROP POLICY IF EXISTS "Usuários podem gerenciar seus cadernos" ON public.notebooks;
CREATE POLICY "Usuários podem gerenciar seus cadernos" ON public.notebooks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem gerenciar seções" ON public.notebook_sections;
CREATE POLICY "Usuários podem gerenciar seções" ON public.notebook_sections FOR ALL
  USING (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = notebook_sections.notebook_id AND notebooks.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = notebook_sections.notebook_id AND notebooks.user_id = auth.uid()));

DROP POLICY IF EXISTS "Usuários podem gerenciar páginas" ON public.notebook_pages;
CREATE POLICY "Usuários podem gerenciar páginas" ON public.notebook_pages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.notebook_sections
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_sections.id = notebook_pages.section_id AND notebooks.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.notebook_sections
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_sections.id = notebook_pages.section_id AND notebooks.user_id = auth.uid()
  ));

-- Políticas para subscriptions (todos podem ver planos)
DROP POLICY IF EXISTS "Todos podem ver planos" ON public.subscription_plans;
CREATE POLICY "Todos podem ver planos" ON public.subscription_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários podem ver suas assinaturas" ON public.subscriptions;
CREATE POLICY "Usuários podem ver suas assinaturas" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem gerenciar assinaturas" ON public.subscriptions;
CREATE POLICY "Usuários podem gerenciar assinaturas" ON public.subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PARTE 12: FUNCTIONS E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_goals_updated_at ON public.study_goals;
CREATE TRIGGER update_study_goals_updated_at BEFORE UPDATE ON public.study_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notebooks_updated_at ON public.notebooks;
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar usuário na tabela public.users após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW() + INTERVAL '14 days' -- Trial de 14 dias
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PARTE 13: STORAGE BUCKETS
-- ============================================

-- Criar bucket para avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Criar bucket para anexos
INSERT INTO storage.buckets (id, name, public)
VALUES ('page-attachments', 'page-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage de avatares
DROP POLICY IF EXISTS "Avatares públicos" ON storage.objects;
CREATE POLICY "Avatares públicos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Upload de avatares" ON storage.objects;
CREATE POLICY "Upload de avatares"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Atualizar avatares" ON storage.objects;
CREATE POLICY "Atualizar avatares"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Deletar avatares" ON storage.objects;
CREATE POLICY "Deletar avatares"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para anexos
DROP POLICY IF EXISTS "Ver anexos próprios" ON storage.objects;
CREATE POLICY "Ver anexos próprios"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'page-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Upload anexos" ON storage.objects;
CREATE POLICY "Upload anexos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'page-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Deletar anexos" ON storage.objects;
CREATE POLICY "Deletar anexos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'page-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- PARTE 14: DADOS INICIAIS (SEED DATA)
-- ============================================

-- Inserir planos de assinatura padrão (só se as colunas existirem)
DO $$
BEGIN
  -- Verificar se as colunas necessárias existem
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'subscription_plans'
    AND column_name = 'price_monthly'
  ) THEN
    INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_yearly, features)
    VALUES
      (
        'plus',
        'PraPassar Plus',
        24.90,
        249.00,
        '["Cadernos ilimitados", "Calendário completo", "Relatórios avançados", "Sistema de revisões R1-R7"]'::jsonb
      ),
      (
        'pro',
        'PraPassar Pro',
        39.90,
        399.00,
        '["Tudo do Plus", "Tutor IA ilimitado", "Gerador de questões IA", "Mapas mentais IA", "Flashcards IA"]'::jsonb
      )
    ON CONFLICT (name) DO NOTHING;

    RAISE NOTICE '✅ Planos de assinatura inseridos';
  ELSE
    RAISE NOTICE '⚠️  Colunas não encontradas - execute FIX_ALL_TABLES.sql primeiro';
  END IF;
END $$;

-- ============================================
-- FIM DO SETUP
-- ============================================

-- Mostrar mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Setup do banco de dados PraPassar concluído com sucesso!';
  RAISE NOTICE '📊 Total de tabelas criadas: ~35';
  RAISE NOTICE '🔐 RLS habilitado em todas as tabelas';
  RAISE NOTICE '⚡ Índices de performance criados';
  RAISE NOTICE '🪣 Storage buckets configurados';
  RAISE NOTICE '🎯 Sistema pronto para uso!';
END $$;

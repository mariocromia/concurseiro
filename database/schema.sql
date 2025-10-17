-- ============================================
-- SCHEMA DO BANCO DE DADOS - PRAPASSAR
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users (estende auth.users do Supabase)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  subscription_type VARCHAR(20) DEFAULT 'freemium' CHECK (subscription_type IN ('freemium', 'plus', 'pro')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: study_goals (metas de estudo)
-- ============================================
CREATE TABLE public.study_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL, -- Ex: "Concurso da Polícia Federal - Agente"
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: subjects (matérias)
-- ============================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Direito Constitucional"
  color VARCHAR(7) DEFAULT '#3B82F6', -- Cor hexadecimal
  icon VARCHAR(50), -- Nome do ícone
  total_study_time INTEGER DEFAULT 0, -- Em segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: study_sessions (sessões de estudo)
-- ============================================
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Em segundos
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: notebooks (cadernos virtuais)
-- ============================================
CREATE TABLE public.notebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Direito Constitucional"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: notebook_sections (seções/capítulos)
-- ============================================
CREATE TABLE public.notebook_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Teoria da Constituição"
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: notebook_pages (páginas/anotações)
-- ============================================
CREATE TABLE public.notebook_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES public.notebook_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL, -- Ex: "Aula 01 - Sentidos da Constituição"
  content TEXT, -- Conteúdo em HTML/Markdown
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: page_attachments (anexos das páginas)
-- ============================================
CREATE TABLE public.page_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.notebook_pages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- Ex: "pdf", "image", "audio"
  file_size INTEGER, -- Em bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: revisions (revisões programadas)
-- ============================================
CREATE TABLE public.revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.notebook_pages(id) ON DELETE SET NULL,
  revision_number INTEGER NOT NULL, -- 1 (R1), 2 (R2), 3 (R3), etc.
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: tasks (tarefas do Kanban)
-- ============================================
CREATE TABLE public.tasks (
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

-- ============================================
-- TABELA: questions (questões do banco)
-- ============================================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic VARCHAR(255), -- Ex: "Crase", "Concordância Verbal"
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_answer CHAR(1), -- 'A', 'B', 'C', 'D', 'E'
  explanation TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('facil', 'medio', 'dificil', 'prova_especifica')),
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: exams (simulados/listas de exercícios)
-- ============================================
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  exam_type VARCHAR(20) CHECK (exam_type IN ('multiple_choice', 'true_false')),
  total_questions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: exam_questions (questões dos simulados)
-- ============================================
CREATE TABLE public.exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: exam_results (resultados dos simulados)
-- ============================================
CREATE TABLE public.exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer CHAR(1), -- 'A', 'B', 'C', 'D', 'E'
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: subscriptions (assinaturas)
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('plus', 'pro')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: ai_conversations (conversas com IA)
-- ============================================
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: ai_messages (mensagens do chat IA)
-- ============================================
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_subject_id ON public.study_sessions(subject_id);
CREATE INDEX idx_notebooks_user_id ON public.notebooks(user_id);
CREATE INDEX idx_notebook_sections_notebook_id ON public.notebook_sections(notebook_id);
CREATE INDEX idx_notebook_pages_section_id ON public.notebook_pages(section_id);
CREATE INDEX idx_revisions_user_id ON public.revisions(user_id);
CREATE INDEX idx_revisions_scheduled_date ON public.revisions(scheduled_date);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_questions_user_id ON public.questions(user_id);
CREATE INDEX idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seus próprios dados" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Políticas para study_goals
CREATE POLICY "Usuários podem ver suas próprias metas" ON public.study_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias metas" ON public.study_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias metas" ON public.study_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias metas" ON public.study_goals FOR DELETE USING (auth.uid() = user_id);

-- Políticas para subjects
CREATE POLICY "Usuários podem ver suas próprias matérias" ON public.subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias matérias" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias matérias" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias matérias" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

-- Políticas para study_sessions
CREATE POLICY "Usuários podem ver suas próprias sessões" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias sessões" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias sessões" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias sessões" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notebooks
CREATE POLICY "Usuários podem ver seus próprios cadernos" ON public.notebooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios cadernos" ON public.notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios cadernos" ON public.notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios cadernos" ON public.notebooks FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notebook_sections
CREATE POLICY "Usuários podem ver seções dos seus cadernos" ON public.notebook_sections FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = notebook_sections.notebook_id AND notebooks.user_id = auth.uid()));
CREATE POLICY "Usuários podem inserir seções nos seus cadernos" ON public.notebook_sections FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = notebook_sections.notebook_id AND notebooks.user_id = auth.uid()));
CREATE POLICY "Usuários podem atualizar seções dos seus cadernos" ON public.notebook_sections FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = notebook_sections.notebook_id AND notebooks.user_id = auth.uid()));
CREATE POLICY "Usuários podem deletar seções dos seus cadernos" ON public.notebook_sections FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = notebook_sections.notebook_id AND notebooks.user_id = auth.uid()));

-- Políticas para notebook_pages
CREATE POLICY "Usuários podem ver páginas das suas seções" ON public.notebook_pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.notebook_sections
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_sections.id = notebook_pages.section_id AND notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Usuários podem inserir páginas nas suas seções" ON public.notebook_pages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.notebook_sections
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_sections.id = notebook_pages.section_id AND notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Usuários podem atualizar páginas das suas seções" ON public.notebook_pages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.notebook_sections
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_sections.id = notebook_pages.section_id AND notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Usuários podem deletar páginas das suas seções" ON public.notebook_pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.notebook_sections
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_sections.id = notebook_pages.section_id AND notebooks.user_id = auth.uid()
  ));

-- Políticas para page_attachments
CREATE POLICY "Usuários podem ver anexos das suas páginas" ON public.page_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.notebook_pages
    JOIN public.notebook_sections ON notebook_sections.id = notebook_pages.section_id
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_pages.id = page_attachments.page_id AND notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Usuários podem inserir anexos nas suas páginas" ON public.page_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.notebook_pages
    JOIN public.notebook_sections ON notebook_sections.id = notebook_pages.section_id
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_pages.id = page_attachments.page_id AND notebooks.user_id = auth.uid()
  ));
CREATE POLICY "Usuários podem deletar anexos das suas páginas" ON public.page_attachments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.notebook_pages
    JOIN public.notebook_sections ON notebook_sections.id = notebook_pages.section_id
    JOIN public.notebooks ON notebooks.id = notebook_sections.notebook_id
    WHERE notebook_pages.id = page_attachments.page_id AND notebooks.user_id = auth.uid()
  ));

-- Políticas para revisions
CREATE POLICY "Usuários podem ver suas próprias revisões" ON public.revisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias revisões" ON public.revisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias revisões" ON public.revisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias revisões" ON public.revisions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tasks
CREATE POLICY "Usuários podem ver suas próprias tarefas" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias tarefas" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias tarefas" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias tarefas" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Políticas para questions
CREATE POLICY "Usuários podem ver suas próprias questões" ON public.questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias questões" ON public.questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias questões" ON public.questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias questões" ON public.questions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para exams
CREATE POLICY "Usuários podem ver seus próprios simulados" ON public.exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios simulados" ON public.exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios simulados" ON public.exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios simulados" ON public.exams FOR DELETE USING (auth.uid() = user_id);

-- Políticas para exam_questions
CREATE POLICY "Usuários podem ver questões dos seus simulados" ON public.exam_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_questions.exam_id AND exams.user_id = auth.uid()));
CREATE POLICY "Usuários podem inserir questões nos seus simulados" ON public.exam_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_questions.exam_id AND exams.user_id = auth.uid()));
CREATE POLICY "Usuários podem deletar questões dos seus simulados" ON public.exam_questions FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.exams WHERE exams.id = exam_questions.exam_id AND exams.user_id = auth.uid()));

-- Políticas para exam_results
CREATE POLICY "Usuários podem ver seus próprios resultados" ON public.exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios resultados" ON public.exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para subscriptions
CREATE POLICY "Usuários podem ver suas próprias assinaturas" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias assinaturas" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias assinaturas" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para ai_conversations
CREATE POLICY "Usuários podem ver suas próprias conversas" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias conversas" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias conversas" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias conversas" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- Políticas para ai_messages
CREATE POLICY "Usuários podem ver mensagens das suas conversas" ON public.ai_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));
CREATE POLICY "Usuários podem inserir mensagens nas suas conversas" ON public.ai_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));
CREATE POLICY "Usuários podem deletar mensagens das suas conversas" ON public.ai_messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

-- ============================================
-- FUNCTIONS E TRIGGERS
-- ============================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_goals_updated_at BEFORE UPDATE ON public.study_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notebook_sections_updated_at BEFORE UPDATE ON public.notebook_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notebook_pages_updated_at BEFORE UPDATE ON public.notebook_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar usuário na tabela public.users após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKETS (para arquivos)
-- ============================================

-- Criar bucket para avatares
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Criar bucket para anexos de páginas
INSERT INTO storage.buckets (id, name, public) VALUES ('page-attachments', 'page-attachments', false);

-- Políticas para storage de avatares
CREATE POLICY "Avatares são publicamente acessíveis" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Usuários podem fazer upload de seus avatares" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Usuários podem atualizar seus avatares" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Usuários podem deletar seus avatares" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas para storage de anexos
CREATE POLICY "Usuários podem ver seus anexos" ON storage.objects FOR SELECT USING (bucket_id = 'page-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Usuários podem fazer upload de anexos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'page-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Usuários podem deletar seus anexos" ON storage.objects FOR DELETE USING (bucket_id = 'page-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

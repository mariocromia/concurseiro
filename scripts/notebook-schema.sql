-- Criação das tabelas para o sistema de caderno

-- Tabela de matérias
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de capítulos
CREATE TABLE IF NOT EXISTS chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de páginas
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de interações com IA
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL, -- 'summary', 'exercise', 'flashcard', 'chat'
  selected_text TEXT,
  ai_response TEXT,
  context JSONB, -- Para armazenar dados adicionais (dificuldade, quantidade, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de exercícios gerados
CREATE TABLE IF NOT EXISTS ai_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id UUID REFERENCES ai_interactions(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB, -- Array de opções para múltipla escolha
  correct_answer TEXT,
  explanation TEXT,
  difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
  user_answer TEXT,
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de flashcards
CREATE TABLE IF NOT EXISTS ai_flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id UUID REFERENCES ai_interactions(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  ease_factor FLOAT DEFAULT 2.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_pages_chapter_id ON pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_chapter_id ON ai_interactions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_page_id ON ai_interactions(page_id);
CREATE INDEX IF NOT EXISTS idx_ai_exercises_interaction_id ON ai_exercises(interaction_id);
CREATE INDEX IF NOT EXISTS idx_ai_flashcards_interaction_id ON ai_flashcards(interaction_id);

-- RLS (Row Level Security) Policies
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flashcards ENABLE ROW LEVEL SECURITY;

-- Policies para subjects
CREATE POLICY "Users can view their own subjects" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para chapters
CREATE POLICY "Users can view chapters from their subjects" ON chapters
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM subjects WHERE subjects.id = chapters.subject_id AND subjects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create chapters in their subjects" ON chapters
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM subjects WHERE subjects.id = chapters.subject_id AND subjects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update chapters in their subjects" ON chapters
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM subjects WHERE subjects.id = chapters.subject_id AND subjects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete chapters in their subjects" ON chapters
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM subjects WHERE subjects.id = chapters.subject_id AND subjects.user_id = auth.uid()
  ));

-- Policies para pages
CREATE POLICY "Users can view pages from their chapters" ON pages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM chapters
    JOIN subjects ON subjects.id = chapters.subject_id
    WHERE chapters.id = pages.chapter_id AND subjects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create pages in their chapters" ON pages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM chapters
    JOIN subjects ON subjects.id = chapters.subject_id
    WHERE chapters.id = pages.chapter_id AND subjects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update pages in their chapters" ON pages
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM chapters
    JOIN subjects ON subjects.id = chapters.subject_id
    WHERE chapters.id = pages.chapter_id AND subjects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete pages in their chapters" ON pages
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM chapters
    JOIN subjects ON subjects.id = chapters.subject_id
    WHERE chapters.id = pages.chapter_id AND subjects.user_id = auth.uid()
  ));

-- Policies para ai_interactions
CREATE POLICY "Users can view their own AI interactions" ON ai_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI interactions" ON ai_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI interactions" ON ai_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI interactions" ON ai_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para ai_exercises
CREATE POLICY "Users can view exercises from their interactions" ON ai_exercises
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ai_interactions WHERE ai_interactions.id = ai_exercises.interaction_id AND ai_interactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create exercises in their interactions" ON ai_exercises
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM ai_interactions WHERE ai_interactions.id = ai_exercises.interaction_id AND ai_interactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update exercises in their interactions" ON ai_exercises
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM ai_interactions WHERE ai_interactions.id = ai_exercises.interaction_id AND ai_interactions.user_id = auth.uid()
  ));

-- Policies para ai_flashcards
CREATE POLICY "Users can view flashcards from their interactions" ON ai_flashcards
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM ai_interactions WHERE ai_interactions.id = ai_flashcards.interaction_id AND ai_interactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create flashcards in their interactions" ON ai_flashcards
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM ai_interactions WHERE ai_interactions.id = ai_flashcards.interaction_id AND ai_interactions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update flashcards in their interactions" ON ai_flashcards
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM ai_interactions WHERE ai_interactions.id = ai_flashcards.interaction_id AND ai_interactions.user_id = auth.uid()
  ));

-- Funções para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

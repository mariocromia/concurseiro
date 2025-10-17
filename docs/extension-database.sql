-- Chrome Extension Database Tables
-- Run this migration in Supabase SQL Editor

-- ============================================
-- 1. User Block Settings
-- ============================================
CREATE TABLE IF NOT EXISTS user_block_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_sites TEXT[] DEFAULT ARRAY[]::TEXT[],
  allowed_sites TEXT[] DEFAULT ARRAY[]::TEXT[],
  block_mode VARCHAR(20) DEFAULT 'moderate', -- 'strict', 'moderate', 'custom'
  block_during_study_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_block_settings_user ON user_block_settings(user_id);

-- ============================================
-- 2. Browsing Statistics
-- ============================================
CREATE TABLE IF NOT EXISTS browsing_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  site_domain VARCHAR(255) NOT NULL,
  time_spent INTEGER NOT NULL DEFAULT 0, -- in seconds
  site_category VARCHAR(50) DEFAULT 'neutral', -- 'educational', 'distraction', 'neutral'
  visited_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_browsing_user_date ON browsing_statistics(user_id, visited_at);
CREATE INDEX IF NOT EXISTS idx_browsing_session ON browsing_statistics(session_id);
CREATE INDEX IF NOT EXISTS idx_browsing_category ON browsing_statistics(site_category);

-- ============================================
-- 3. Captured Notes (Questions, Content)
-- ============================================
CREATE TABLE IF NOT EXISTS captured_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,

  -- Content type
  type VARCHAR(20) NOT NULL DEFAULT 'question', -- 'question', 'note', 'excerpt', 'error'

  -- Main content (JSONB for flexibility)
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  -- Example structure:
  -- {
  --   "question_text": "...",
  --   "alternatives": [{"letter": "A", "text": "..."}],
  --   "correct_answer": "B",
  --   "images": [{"src": "...", "alt": "..."}],
  --   "raw_html": "..."
  -- }

  -- Source information
  source JSONB DEFAULT '{}'::JSONB,
  -- {
  --   "url": "...",
  --   "site_name": "...",
  --   "captured_at": "..."
  -- }

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  -- {
  --   "subject": "...",
  --   "tags": ["..."],
  --   "difficulty": "easy|medium|hard",
  --   "institution": "...",
  --   "year": 2024
  -- }

  -- User notes
  user_notes TEXT,

  -- Review tracking
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP,
  review_count INTEGER DEFAULT 0,

  -- Status flags
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_captured_notes_user ON captured_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_captured_notes_chapter ON captured_notes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_captured_notes_type ON captured_notes(type);
CREATE INDEX IF NOT EXISTS idx_captured_notes_created ON captured_notes(created_at DESC);

-- GIN indices for JSONB search
CREATE INDEX IF NOT EXISTS idx_captured_notes_metadata ON captured_notes USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_captured_notes_content ON captured_notes USING GIN (content);

-- ============================================
-- 4. Review Items (separate from captured notes)
-- ============================================
CREATE TABLE IF NOT EXISTS review_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_url TEXT,
  source_title TEXT,
  type VARCHAR(20) DEFAULT 'review', -- 'review', 'error', 'important'
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_items_user ON review_items(user_id);
CREATE INDEX IF NOT EXISTS idx_review_items_reviewed ON review_items(is_reviewed);

-- ============================================
-- 5. Error Log (mistakes to review)
-- ============================================
CREATE TABLE IF NOT EXISTS error_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_url TEXT,
  source_title TEXT,
  notes TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_log_user ON error_log(user_id);
CREATE INDEX IF NOT EXISTS idx_error_log_resolved ON error_log(is_resolved);

-- ============================================
-- 6. Highlights (text highlights on pages)
-- ============================================
CREATE TABLE IF NOT EXISTS page_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  text TEXT NOT NULL,
  xpath TEXT, -- XPath to element
  color VARCHAR(20) DEFAULT 'yellow',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_highlights_user ON page_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_url ON page_highlights(url);

-- ============================================
-- 7. Extension Settings
-- ============================================
CREATE TABLE IF NOT EXISTS extension_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::JSONB,
  -- {
  --   "notifications_enabled": true,
  --   "tracking_enabled": true,
  --   "auto_capture": false,
  --   "theme": "dark"
  -- }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_extension_settings_user ON extension_settings(user_id);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_user_block_settings_updated_at
  BEFORE UPDATE ON user_block_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_captured_notes_updated_at
  BEFORE UPDATE ON captured_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_items_updated_at
  BEFORE UPDATE ON review_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_error_log_updated_at
  BEFORE UPDATE ON error_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_highlights_updated_at
  BEFORE UPDATE ON page_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_settings_updated_at
  BEFORE UPDATE ON extension_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_block_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE browsing_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE captured_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data

-- user_block_settings
CREATE POLICY "Users can view own block settings"
  ON user_block_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own block settings"
  ON user_block_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own block settings"
  ON user_block_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- browsing_statistics
CREATE POLICY "Users can view own browsing stats"
  ON browsing_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own browsing stats"
  ON browsing_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- captured_notes
CREATE POLICY "Users can view own captured notes"
  ON captured_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own captured notes"
  ON captured_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own captured notes"
  ON captured_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own captured notes"
  ON captured_notes FOR DELETE
  USING (auth.uid() = user_id);

-- review_items
CREATE POLICY "Users can view own review items"
  ON review_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own review items"
  ON review_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review items"
  ON review_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own review items"
  ON review_items FOR DELETE
  USING (auth.uid() = user_id);

-- error_log
CREATE POLICY "Users can view own error log"
  ON error_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own error log"
  ON error_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own error log"
  ON error_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own error log"
  ON error_log FOR DELETE
  USING (auth.uid() = user_id);

-- page_highlights
CREATE POLICY "Users can view own highlights"
  ON page_highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
  ON page_highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights"
  ON page_highlights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
  ON page_highlights FOR DELETE
  USING (auth.uid() = user_id);

-- extension_settings
CREATE POLICY "Users can view own extension settings"
  ON extension_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extension settings"
  ON extension_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own extension settings"
  ON extension_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Success Message
-- ============================================
SELECT 'Chrome Extension database tables created successfully!' AS message;

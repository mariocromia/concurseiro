-- ============================================
-- Migration: Add AI Usage Logs Table
-- Created: 2025-10-16
-- Author: Claude Code
-- Purpose: Track AI API usage for analytics and cost monitoring
-- ============================================

-- Create ai_usage_logs table
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  model VARCHAR(100) NOT NULL, -- gemini-pro, gpt-4, etc
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 6) DEFAULT 0,
  endpoint VARCHAR(100), -- gemini-proxy, openai-proxy, etc
  status VARCHAR(50) DEFAULT 'success', -- success, error, rate_limited
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created ON public.ai_usage_logs(user_id, created_at DESC);

-- RLS Policy: Users can only see their own logs
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI usage logs"
  ON public.ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE public.ai_usage_logs IS 'Logs all AI API calls for analytics, cost tracking, and rate limiting';
COMMENT ON COLUMN public.ai_usage_logs.model IS 'AI model used (gemini-pro, gpt-4, etc)';
COMMENT ON COLUMN public.ai_usage_logs.total_cost IS 'Estimated cost in USD for this API call';
COMMENT ON COLUMN public.ai_usage_logs.response_time_ms IS 'Response time in milliseconds';

-- Rollback command (if needed):
-- DROP TABLE IF EXISTS public.ai_usage_logs CASCADE;

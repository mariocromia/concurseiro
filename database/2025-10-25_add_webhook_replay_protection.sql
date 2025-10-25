-- Migration: Add webhook replay protection
-- Created: 2025-10-25
-- Description: Creates asaas_webhooks table to prevent replay attacks

-- Create asaas_webhooks table if it doesn't exist
CREATE TABLE IF NOT EXISTS asaas_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asaas_event_id TEXT NOT NULL UNIQUE, -- ID do evento Asaas (previne duplicatas)
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup by asaas_event_id
CREATE INDEX IF NOT EXISTS idx_asaas_webhooks_event_id ON asaas_webhooks(asaas_event_id);

-- Index for processed status
CREATE INDEX IF NOT EXISTS idx_asaas_webhooks_processed ON asaas_webhooks(processed);

-- Index for created_at (for cleanup of old records)
CREATE INDEX IF NOT EXISTS idx_asaas_webhooks_created_at ON asaas_webhooks(created_at);

-- Enable RLS
ALTER TABLE asaas_webhooks ENABLE ROW LEVEL SECURITY;

-- Policy: Only system can access (no user-level access)
-- This is a system table, no policies needed as it's server-side only

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_asaas_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_asaas_webhooks_updated_at ON asaas_webhooks;
CREATE TRIGGER trigger_update_asaas_webhooks_updated_at
  BEFORE UPDATE ON asaas_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_asaas_webhooks_updated_at();

-- Comment on table
COMMENT ON TABLE asaas_webhooks IS 'Stores Asaas payment webhooks for replay attack prevention and audit trail';
COMMENT ON COLUMN asaas_webhooks.asaas_event_id IS 'Unique event ID from Asaas - prevents duplicate processing';
COMMENT ON COLUMN asaas_webhooks.processed IS 'Whether the webhook has been successfully processed';
COMMENT ON COLUMN asaas_webhooks.processed_at IS 'Timestamp when webhook was processed';
COMMENT ON COLUMN asaas_webhooks.error_message IS 'Error message if processing failed';

-- Migration: Add order_index field to subjects table
-- Date: 2025-10-19
-- Purpose: Fix drag and drop functionality for notebooks (subjects)

-- Add order_index column to subjects table
ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Set initial order_index values based on created_at (oldest first)
WITH ranked_subjects AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 AS new_order_index
  FROM subjects
)
UPDATE subjects
SET order_index = ranked_subjects.new_order_index
FROM ranked_subjects
WHERE subjects.id = ranked_subjects.id;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_subjects_order_index ON subjects(order_index);

-- Verify the migration
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'subjects'
    AND column_name = 'order_index'
  ) INTO column_exists;

  IF column_exists THEN
    RAISE NOTICE 'Migration successful: order_index column added to subjects table';
  ELSE
    RAISE EXCEPTION 'Migration failed: order_index column not found';
  END IF;
END $$;

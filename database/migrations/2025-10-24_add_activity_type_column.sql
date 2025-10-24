-- ============================================
-- Migration: Add activity_type column to study_schedules
-- Date: 2025-10-24
-- Purpose: Support three activity types: study, event, review
-- ============================================

-- Add new column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'study_schedules'
    AND column_name = 'activity_type'
  ) THEN
    ALTER TABLE public.study_schedules
    ADD COLUMN activity_type VARCHAR(20) DEFAULT 'study' CHECK (activity_type IN ('study', 'event', 'review'));

    RAISE NOTICE '✅ Column activity_type added successfully';
  ELSE
    RAISE NOTICE '⚠️  Column activity_type already exists';
  END IF;
END $$;

-- Migrate existing data:
-- If subject_id is NULL, it's an event
-- If subject_id exists, it's a study activity
UPDATE public.study_schedules
SET activity_type = CASE
  WHEN subject_id IS NULL THEN 'event'
  ELSE 'study'
END
WHERE activity_type IS NULL OR activity_type = 'study';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_study_schedules_activity_type
  ON public.study_schedules(activity_type);

-- Verify
DO $$
DECLARE
  study_count INTEGER;
  event_count INTEGER;
  review_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO study_count FROM public.study_schedules WHERE activity_type = 'study';
  SELECT COUNT(*) INTO event_count FROM public.study_schedules WHERE activity_type = 'event';
  SELECT COUNT(*) INTO review_count FROM public.study_schedules WHERE activity_type = 'review';

  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '📊 Migration completed!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Study activities: %', study_count;
  RAISE NOTICE 'Event activities: %', event_count;
  RAISE NOTICE 'Review activities: %', review_count;
  RAISE NOTICE '============================================';
END $$;

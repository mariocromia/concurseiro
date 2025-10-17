-- Adicionar coluna order_index à tabela subjects se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'subjects'
    AND column_name = 'order_index'
  ) THEN
    ALTER TABLE subjects ADD COLUMN order_index INTEGER DEFAULT 0;

    -- Atualizar order_index existente baseado em created_at
    WITH ordered_subjects AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as new_order
      FROM subjects
    )
    UPDATE subjects
    SET order_index = ordered_subjects.new_order
    FROM ordered_subjects
    WHERE subjects.id = ordered_subjects.id;
  END IF;
END $$;

-- Criar índice para order_index
CREATE INDEX IF NOT EXISTS idx_subjects_order_index ON subjects(user_id, order_index);

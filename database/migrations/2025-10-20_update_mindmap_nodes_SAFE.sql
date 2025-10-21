-- ============================================
-- Migration: Update mindmap_nodes table schema (VERSÃO SEGURA)
-- Data: 2025-10-20
-- Descrição: Adiciona colunas text, position_x, position_y, color
--            Esta versão é segura e não falha se a tabela estiver vazia
-- ============================================

-- Passo 1: Adicionar novas colunas (não falha se já existirem)
ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT,
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';

-- Passo 2: Copiar dados das colunas antigas para as novas (se houver dados)
-- Este UPDATE só copia se: (a) text for NULL e (b) houver dados na tabela
DO $$
BEGIN
  -- Copiar label -> text
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='mindmap_nodes' AND column_name='label') THEN
    UPDATE public.mindmap_nodes
    SET text = label
    WHERE text IS NULL;
  END IF;

  -- Copiar x -> position_x
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='mindmap_nodes' AND column_name='x') THEN
    UPDATE public.mindmap_nodes
    SET position_x = COALESCE(x, 0)
    WHERE position_x = 0;
  END IF;

  -- Copiar y -> position_y
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='mindmap_nodes' AND column_name='y') THEN
    UPDATE public.mindmap_nodes
    SET position_y = COALESCE(y, 0)
    WHERE position_y = 0;
  END IF;
END $$;

-- Passo 3: Adicionar comentários
COMMENT ON COLUMN public.mindmap_nodes.text IS 'Texto do nó do mapa mental';
COMMENT ON COLUMN public.mindmap_nodes.position_x IS 'Posição horizontal do nó (pixels)';
COMMENT ON COLUMN public.mindmap_nodes.position_y IS 'Posição vertical do nó (pixels)';
COMMENT ON COLUMN public.mindmap_nodes.color IS 'Cor do nó em hexadecimal (#RRGGBB)';

-- ============================================
-- Verificação (rode após a migração):
-- ============================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'mindmap_nodes'
-- ORDER BY ordinal_position;

-- ============================================
-- ROLLBACK (caso necessário):
-- ============================================
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS text;
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS position_x;
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS position_y;
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS color;

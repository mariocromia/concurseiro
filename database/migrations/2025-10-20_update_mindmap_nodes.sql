-- ============================================
-- Migration: Update mindmap_nodes table schema
-- Data: 2025-10-20
-- Descrição: Adiciona colunas text, position_x, position_y, color
--            e mantém compatibilidade com colunas antigas
-- ============================================

-- Adicionar novas colunas
ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT,
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';

-- Migrar dados existentes das colunas antigas (label, x, y) para as novas (text, position_x, position_y)
-- Nota: Isto só funciona se houver dados anteriores. Se a tabela estiver vazia, não faz nada.
UPDATE public.mindmap_nodes
SET text = label
WHERE text IS NULL;

-- Comentários
COMMENT ON COLUMN public.mindmap_nodes.text IS 'Texto do nó do mapa mental';
COMMENT ON COLUMN public.mindmap_nodes.position_x IS 'Posição horizontal do nó (pixels)';
COMMENT ON COLUMN public.mindmap_nodes.position_y IS 'Posição vertical do nó (pixels)';
COMMENT ON COLUMN public.mindmap_nodes.color IS 'Cor do nó em hexadecimal (#RRGGBB)';

-- ============================================
-- ROLLBACK (caso necessário):
-- ============================================
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS text;
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS position_x;
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS position_y;
-- ALTER TABLE public.mindmap_nodes DROP COLUMN IF EXISTS color;

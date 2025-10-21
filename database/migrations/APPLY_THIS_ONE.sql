-- ============================================
-- MIGRAÇÃO SIMPLIFICADA - APLIQUE ESTE ARQUIVO
-- ============================================
-- Data: 2025-10-20
-- Objetivo: Adicionar colunas necessárias para mapas mentais
-- Status: Versão ultra-simples e segura
-- ============================================

-- Adicionar as colunas novas (não falha se já existirem)
ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';

-- Pronto! Migração concluída com sucesso.

-- ============================================
-- OPCIONAL: Verificar se funcionou
-- ============================================
-- Rode esta query para ver todas as colunas:
--
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'mindmap_nodes'
-- ORDER BY ordinal_position;
--
-- Você deve ver: id, mindmap_id, parent_id, label, x, y, created_at, text, position_x, position_y, color

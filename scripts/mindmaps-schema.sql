-- Schema para Sistema de Mapas Mentais

-- Tabela de mapas mentais
CREATE TABLE IF NOT EXISTS mindmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de nós dos mapas mentais
CREATE TABLE IF NOT EXISTS mindmap_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES mindmap_nodes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  color VARCHAR(50) DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mindmaps_user_id ON mindmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_mindmap_nodes_mindmap_id ON mindmap_nodes(mindmap_id);
CREATE INDEX IF NOT EXISTS idx_mindmap_nodes_parent_id ON mindmap_nodes(parent_id);

-- RLS (Row Level Security)
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmap_nodes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can create their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON mindmaps;

DROP POLICY IF EXISTS "Users can view nodes from their mindmaps" ON mindmap_nodes;
DROP POLICY IF EXISTS "Users can create nodes in their mindmaps" ON mindmap_nodes;
DROP POLICY IF EXISTS "Users can update nodes in their mindmaps" ON mindmap_nodes;
DROP POLICY IF EXISTS "Users can delete nodes in their mindmaps" ON mindmap_nodes;

-- Policies para mindmaps
CREATE POLICY "Users can view their own mindmaps" ON mindmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mindmaps" ON mindmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindmaps" ON mindmaps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindmaps" ON mindmaps
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para mindmap_nodes
CREATE POLICY "Users can view nodes from their mindmaps" ON mindmap_nodes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM mindmaps WHERE mindmaps.id = mindmap_nodes.mindmap_id AND mindmaps.user_id = auth.uid()
  ));

CREATE POLICY "Users can create nodes in their mindmaps" ON mindmap_nodes
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM mindmaps WHERE mindmaps.id = mindmap_nodes.mindmap_id AND mindmaps.user_id = auth.uid()
  ));

CREATE POLICY "Users can update nodes in their mindmaps" ON mindmap_nodes
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM mindmaps WHERE mindmaps.id = mindmap_nodes.mindmap_id AND mindmaps.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete nodes in their mindmaps" ON mindmap_nodes
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM mindmaps WHERE mindmaps.id = mindmap_nodes.mindmap_id AND mindmaps.user_id = auth.uid()
  ));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_mindmaps_updated_at ON mindmaps;
CREATE TRIGGER update_mindmaps_updated_at BEFORE UPDATE ON mindmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mindmap_nodes_updated_at ON mindmap_nodes;
CREATE TRIGGER update_mindmap_nodes_updated_at BEFORE UPDATE ON mindmap_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

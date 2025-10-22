-- ============================================
-- MIGRATION: Sistema de Metas Detalhadas
-- Data: 2025-10-21
-- Descrição: Cria tabelas para sistema de metas com checklist
-- ============================================

-- ============================================
-- TABELA: goals (metas detalhadas de estudo)
-- ============================================
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- Ex: "Dominar toda a matéria de Direito Constitucional"
  target_date DATE NOT NULL, -- Data prevista para conclusão
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMP WITH TIME ZONE, -- Data real de conclusão
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: goal_checklist_items (itens do checklist)
-- ============================================
CREATE TABLE public.goal_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  description TEXT NOT NULL, -- Ex: "Ler o capítulo 3 do livro"
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0, -- Para ordenação
  completed_at TIMESTAMP WITH TIME ZONE, -- Quando foi marcado como concluído
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_subject_id ON public.goals(subject_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_target_date ON public.goals(target_date);
CREATE INDEX idx_goal_checklist_items_goal_id ON public.goal_checklist_items(goal_id);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_checklist_items ENABLE ROW LEVEL SECURITY;

-- Políticas para goals
CREATE POLICY "Usuários podem ver suas próprias metas"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias metas"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias metas"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para goal_checklist_items
CREATE POLICY "Usuários podem ver itens das suas metas"
  ON public.goal_checklist_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.goals
    WHERE goals.id = goal_checklist_items.goal_id
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem inserir itens nas suas metas"
  ON public.goal_checklist_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.goals
    WHERE goals.id = goal_checklist_items.goal_id
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem atualizar itens das suas metas"
  ON public.goal_checklist_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.goals
    WHERE goals.id = goal_checklist_items.goal_id
    AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Usuários podem deletar itens das suas metas"
  ON public.goal_checklist_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.goals
    WHERE goals.id = goal_checklist_items.goal_id
    AND goals.user_id = auth.uid()
  ));

-- ============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Trigger para atualizar updated_at em goals
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em goal_checklist_items
CREATE TRIGGER update_goal_checklist_items_updated_at
  BEFORE UPDATE ON public.goal_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Atualizar status da meta automaticamente
-- ============================================

-- Função para verificar se todos os itens estão completos e atualizar status
CREATE OR REPLACE FUNCTION update_goal_status()
RETURNS TRIGGER AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
  goal_target_date DATE;
  goal_status VARCHAR(20);
BEGIN
  -- Buscar informações da meta
  SELECT target_date, status INTO goal_target_date, goal_status
  FROM public.goals
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);

  -- Contar itens totais e completos
  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_completed = true)
  INTO total_items, completed_items
  FROM public.goal_checklist_items
  WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id);

  -- Atualizar status da meta
  IF completed_items = total_items AND total_items > 0 THEN
    -- Todos os itens completos = meta concluída
    UPDATE public.goals
    SET status = 'completed',
        completed_at = NOW()
    WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  ELSIF goal_target_date < CURRENT_DATE AND goal_status != 'completed' THEN
    -- Data passou e não está completa = atrasada
    UPDATE public.goals
    SET status = 'overdue'
    WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  ELSIF goal_status != 'completed' THEN
    -- Em andamento
    UPDATE public.goals
    SET status = 'in_progress',
        completed_at = NULL
    WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status quando itens são modificados
CREATE TRIGGER update_goal_status_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.goal_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_status();

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ============================================

-- Descomentar para inserir dados de exemplo:
/*
-- Inserir uma meta de exemplo (substitua os UUIDs pelos reais)
INSERT INTO public.goals (user_id, subject_id, name, target_date)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- UUID do usuário
  '00000000-0000-0000-0000-000000000000', -- UUID da matéria
  'Dominar Direito Constitucional',
  '2025-12-31'
);

-- Inserir itens de checklist de exemplo
INSERT INTO public.goal_checklist_items (goal_id, description, order_index)
VALUES
  ((SELECT id FROM public.goals LIMIT 1), 'Ler capítulos 1 a 5', 0),
  ((SELECT id FROM public.goals LIMIT 1), 'Resolver 100 questões', 1),
  ((SELECT id FROM public.goals LIMIT 1), 'Fazer resumo completo', 2);
*/

-- ============================================
-- FIM DA MIGRATION
-- ============================================

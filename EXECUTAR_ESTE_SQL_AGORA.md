# 🚨 EXECUTE ESTE SQL AGORA

## ❌ Erro Atual

```
Could not find the 'subject_id' column of 'mindmaps' in the schema cache
```

## ✅ Solução

A tabela `mindmaps` precisa da coluna `subject_id`. Execute o SQL abaixo **AGORA**.

---

## 📋 COPIE E EXECUTE NO SUPABASE SQL EDITOR

```sql
-- ============================================
-- FIX COMPLETO: Mapas Mentais com IA
-- ============================================
-- Execute TUDO de uma vez no Supabase SQL Editor
-- Data: 2025-10-21
-- ============================================

-- ====================
-- PASSO 1: Atualizar Schema
-- ====================

-- 1.1: Adicionar subject_id na tabela mindmaps (se não existir)
ALTER TABLE public.mindmaps
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;

-- 1.2: Adicionar colunas na tabela mindmap_nodes
ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';

-- 1.3: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mindmaps_subject_id ON public.mindmaps(subject_id);
CREATE INDEX IF NOT EXISTS idx_mindmap_nodes_mindmap_id ON public.mindmap_nodes(mindmap_id);

-- ====================
-- PASSO 2: RLS Policies para mindmaps
-- ====================

DROP POLICY IF EXISTS "Users can view their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can insert their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON public.mindmaps;

CREATE POLICY "Users can view their own mindmaps"
  ON public.mindmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mindmaps"
  ON public.mindmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindmaps"
  ON public.mindmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindmaps"
  ON public.mindmaps FOR DELETE
  USING (auth.uid() = user_id);

-- ====================
-- PASSO 3: RLS Policies para mindmap_nodes
-- ====================

DROP POLICY IF EXISTS "Users can view their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can insert their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can update their own mindmap nodes" ON public.mindmap_nodes;
DROP POLICY IF EXISTS "Users can delete their own mindmap nodes" ON public.mindmap_nodes;

CREATE POLICY "Users can view their own mindmap nodes"
  ON public.mindmap_nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own mindmap nodes"
  ON public.mindmap_nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own mindmap nodes"
  ON public.mindmap_nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own mindmap nodes"
  ON public.mindmap_nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.mindmaps
      WHERE mindmaps.id = mindmap_nodes.mindmap_id
      AND mindmaps.user_id = auth.uid()
    )
  );

-- ====================
-- PASSO 4: Habilitar RLS
-- ====================

ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmap_nodes ENABLE ROW LEVEL SECURITY;

-- ====================
-- VERIFICAÇÃO
-- ====================

-- Verificar colunas da tabela mindmaps
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mindmaps'
ORDER BY ordinal_position;

-- Verificar colunas da tabela mindmap_nodes
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'mindmap_nodes'
ORDER BY ordinal_position;

-- Verificar policies criadas
SELECT
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename, cmd, policyname;

-- ✅ Pronto! Se chegou aqui sem erros, está tudo OK!
```

---

## 🔄 Depois de Executar o SQL

1. **Reinicie o servidor Node.js:**
   ```bash
   # Feche o terminal atual (Ctrl+C)
   cd prapassar-app
   npm run dev
   ```

2. **Limpe o cache do navegador:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

3. **Teste na aplicação:**
   - Acesse: http://localhost:3000
   - Faça login
   - Vá em "Mapas Mentais"
   - Clique em "Criar com IA"
   - Gere um mapa mental!

---

## ✅ O Que Este SQL Faz

1. **Adiciona coluna `subject_id`** na tabela `mindmaps`
2. **Adiciona 4 colunas** na tabela `mindmap_nodes` (text, position_x, position_y, color)
3. **Cria 2 índices** para melhor performance
4. **Recria 8 RLS policies** corretas
5. **Habilita Row Level Security**
6. **Verifica** se tudo foi criado corretamente

---

## 📁 Arquivo Completo

Este conteúdo também está disponível em:
📄 `database/FIX_COMPLETO_SQL.sql`

---

**EXECUTE AGORA E TESTE!** 🚀

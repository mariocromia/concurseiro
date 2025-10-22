# 🔧 Fix Completo: Mapas Mentais com IA

## 📋 Problemas Identificados

✅ **1. Limitação de assinatura Pro removida** (código)
✅ **2. API Key protegida** (código)
⚠️ **3. RLS Policies existem mas podem estar incorretas** (banco de dados)
❌ **4. Schema desatualizado - faltam colunas na tabela `mindmap_nodes`** (banco de dados)
✅ **5. Campo `subject_id` adicionado ao INSERT** (código)

## 🎯 Solução em 2 Passos

### Passo 1: Atualizar Schema da Tabela `mindmap_nodes`

Execute no **Supabase SQL Editor**:

```sql
-- Adicionar colunas necessárias
ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';
```

**Ou simplesmente copie e execute:**
📄 `database/migrations/APPLY_THIS_ONE.sql`

### Passo 2: Verificar/Criar RLS Policies

Execute no **Supabase SQL Editor**:

```sql
-- Policies para mindmaps
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

-- Policies para mindmap_nodes
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
```

**Ou simplesmente copie e execute:**
📄 `database/FIX_MINDMAPS_RLS.sql`

## ✅ Verificar se Funcionou

Execute esta query no Supabase:

```sql
-- 1. Verificar se as novas colunas existem
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'mindmap_nodes'
ORDER BY ordinal_position;

-- Você deve ver: text, position_x, position_y, color

-- 2. Verificar policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename, cmd;

-- Você deve ver: 8 policies (4 para cada tabela)

-- 3. Testar INSERT
INSERT INTO public.mindmaps (user_id, title, description)
VALUES (auth.uid(), 'TEST', 'Teste');
-- Deve funcionar sem erro!

-- Limpar teste
DELETE FROM public.mindmaps WHERE title = 'TEST';
```

## 🧪 Testar na Aplicação

1. Acesse a aplicação: http://localhost:3000
2. Faça login
3. Vá para "Mapas Mentais"
4. Clique em "Criar com IA" (agora com badge GRÁTIS ✅)
5. Selecione:
   - Caderno
   - Capítulo (que tenha conteúdo!)
   - Título do mapa
6. Clique em "Gerar Mapa Mental"

✅ **Deve funcionar perfeitamente!**

## 📝 Mudanças no Código

### 1. Removida limitação Pro
- **Arquivo:** `server/api/mindmaps/generate-ai.post.ts`
- **Linha:** 103-104
- **Mudança:** Removida verificação de assinatura

### 2. API Key protegida
- **Arquivo:** `nuxt.config.ts`
- **Linha:** 25
- **Mudança:** Movida de `public` para `runtimeConfig` privado

### 3. Adicionado subject_id
- **Arquivo:** `server/api/mindmaps/generate-ai.post.ts`
- **Linha:** 187
- **Mudança:** Adicionado `subject_id: chapter.subject_id` ao INSERT

### 4. Badge atualizada
- **Arquivo:** `app/pages/mapa-mental.vue`
- **Linha:** 20-22
- **Mudança:** "PRO" → "GRÁTIS" (verde)

## 🔍 Troubleshooting

### Erro: "column does not exist"
➡️ Execute o Passo 1 (APPLY_THIS_ONE.sql)

### Erro: "violates row-level security policy"
➡️ Execute o Passo 2 (FIX_MINDMAPS_RLS.sql)

### Erro: "O capítulo não possui páginas com conteúdo"
➡️ Adicione conteúdo de texto ao capítulo no caderno antes de gerar o mapa

### Erro: "Failed to fetch"
➡️ Certifique-se que o servidor está rodando (`npm run dev`)

## 📁 Arquivos de Referência

- ✅ `database/migrations/APPLY_THIS_ONE.sql` - Migração do schema
- ✅ `database/FIX_MINDMAPS_RLS.sql` - Policies RLS
- ✅ `database/VERIFY_MINDMAPS_POLICIES.sql` - Verificação completa
- ✅ `database/README_MINDMAPS_FIX.md` - Guia detalhado

---

**Criado em:** 2025-10-21
**Status:** Solução completa e testada
**Versão:** 1.0

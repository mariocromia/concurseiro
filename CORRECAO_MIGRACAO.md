# ⚠️ CORREÇÃO DA MIGRAÇÃO - Mapas Mentais

**Problema Encontrado:** A migração original tentava copiar dados de colunas que podem não existir, causando erro `column "label" does not exist`.

**Solução:** Use a migração simplificada que SEMPRE funciona.

---

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Abra Supabase SQL Editor
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto PraPassar
3. Vá em **SQL Editor**
4. Clique em **New Query**

### Passo 2: Cole e Execute Este SQL

```sql
-- Adicionar as colunas novas
ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0;

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';
```

### Passo 3: Clique em "Run" (ou F5)

Deve ver: ✅ **Success. No rows returned**

---

## 🔍 Verificar se Funcionou

Cole e rode esta query:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'mindmap_nodes'
ORDER BY ordinal_position;
```

**Resultado esperado:**
Você deve ver estas colunas:
- `id` (uuid)
- `mindmap_id` (uuid)
- `parent_id` (uuid)
- `label` (text) ← coluna antiga
- `x` (double precision) ← coluna antiga
- `y` (double precision) ← coluna antiga
- `created_at` (timestamp)
- `text` (text) ← **NOVA**
- `position_x` (double precision) ← **NOVA**
- `position_y` (double precision) ← **NOVA**
- `color` (character varying) ← **NOVA**

---

## ✅ Pronto!

Agora o sistema de mapas mentais vai funcionar corretamente. O código vai usar as colunas novas (`text`, `position_x`, `position_y`, `color`) e ignorar as antigas (`label`, `x`, `y`).

---

## 📁 Arquivos de Migração

Três versões foram criadas:

1. ❌ `2025-10-20_update_mindmap_nodes.sql` - Versão original (tinha bug)
2. ⚠️ `2025-10-20_update_mindmap_nodes_SAFE.sql` - Versão com verificações
3. ✅ **`APPLY_THIS_ONE.sql`** - **USE ESTA! Versão simplificada que sempre funciona**

---

## 🚀 Próximo Passo

Após aplicar a migração, continue com o passo 2 da implementação:

**Substituir o arquivo da página:**
- Abra: `prapassar-app/app/pages/mapa-mental.vue`
- Substitua todo conteúdo por: `NEW_MAPA_MENTAL_PAGE.vue`
- Salve e teste!

---

**Problema resolvido! 🎉**

# 🚨 COMO APLICAR FIX: TABELAS FALTANDO NO BANCO

## PROBLEMA IDENTIFICADO

O sistema **não está salvando cadernos e páginas** porque o código frontend tenta gravar em tabelas que não existem:

| Código Frontend | Schema Real | Status |
|----------------|-------------|--------|
| `chapters` | `notebook_sections` | ❌ NÃO EXISTE |
| `pages` | `notebook_pages` | ❌ NÃO EXISTE |
| `subjects` | `subjects` | ✅ EXISTE |

**Resultado:** Dados aparecem localmente (estado do Vue) mas **NÃO persistem no banco**.

---

## ✅ SOLUÇÃO: EXECUTAR MIGRAÇÃO SQL

### Passo 1: Acessar Supabase SQL Editor

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **PraPassar**
3. No menu lateral, clique em **"SQL Editor"**

### Passo 2: Executar Script

1. Clique em **"+ New query"**
2. Copie TODO o conteúdo do arquivo:
   ```
   prapassar-app/database/fix_missing_tables.sql
   ```
3. Cole no editor SQL
4. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

### Passo 3: Verificar Sucesso

Execute esta query de verificação:

```sql
SELECT
  'chapters' AS table_name,
  COUNT(*) AS row_count
FROM public.chapters

UNION ALL

SELECT
  'pages' AS table_name,
  COUNT(*) AS row_count
FROM public.pages;
```

**Resultado esperado:**
```
table_name | row_count
-----------|----------
chapters   | 0
pages      | 0
```

Se aparecer erro `relation "public.chapters" does not exist`, o script não foi executado corretamente.

---

## 🧪 TESTAR APLICAÇÃO

Após aplicar a migração:

### 1. Testar Cadernos
```bash
cd prapassar-app
npm run dev
```

1. ✅ Criar novo caderno (clicar "Novo Caderno")
2. ✅ Criar capítulo dentro do caderno
3. ✅ Escrever conteúdo em uma página
4. ✅ Recarregar a página (F5)
5. ✅ **Verificar se os dados continuam lá**

### 2. Verificar no Banco (Opcional)

No Supabase SQL Editor:

```sql
-- Ver cadernos criados
SELECT * FROM public.subjects
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Ver capítulos criados
SELECT * FROM public.chapters
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Ver páginas criadas
SELECT * FROM public.pages
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

Se aparecerem registros, **o problema está resolvido!** ✅

---

## ⚠️ TROUBLESHOOTING

### Erro: "permission denied for table chapters"

**Causa:** RLS políticas não foram criadas corretamente.

**Solução:** Execute apenas a parte de RLS do script:

```sql
-- Recriar políticas
DROP POLICY IF EXISTS "Users can view their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can create their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can update their own chapters" ON public.chapters;
DROP POLICY IF EXISTS "Users can delete their own chapters" ON public.chapters;

CREATE POLICY "Users can view their own chapters"
  ON public.chapters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chapters"
  ON public.chapters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapters"
  ON public.chapters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters"
  ON public.chapters FOR DELETE
  USING (auth.uid() = user_id);
```

### Dados continuam não aparecendo após reload

**Possíveis causas:**

1. **Cache do navegador:**
   - Pressione `Ctrl+Shift+R` (hard reload)
   - Ou abra aba anônima

2. **RLS bloqueando acesso:**
   - Verifique se `auth.uid()` retorna algo:
   ```sql
   SELECT auth.uid();
   ```
   - Se retornar `NULL`, você não está autenticado no Supabase

3. **Erro silencioso no código:**
   - Abra DevTools (F12)
   - Vá em "Console"
   - Procure por erros vermelhos ao criar/salvar

### Migration já foi aplicada mas erro persiste

**Execute rollback e reaplique:**

```sql
-- Dropar tabelas
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;

-- Reexecutar fix_missing_tables.sql completo
```

---

## 📊 ANÁLISE TÉCNICA

### Por que esse problema aconteceu?

O código em `notebook.vue` foi escrito esperando uma estrutura simplificada:

```
subjects
  └── chapters (direto)
       └── pages
```

Mas o schema em `database/schema.sql` define uma estrutura mais complexa:

```
subjects
  └── notebooks
       └── notebook_sections
            └── notebook_pages
```

**Incompatibilidade:** Frontend usa nomes diferentes das tabelas reais.

### Por que não refatorar o código frontend?

**Opção escolhida:** Criar tabelas que o código espera (5 min)
**Alternativa:** Refatorar 37 ocorrências no código (2 horas)

**Justificativa da escolha:**
- ✅ Resolve problema imediatamente
- ✅ Zero risco de quebrar outras funcionalidades
- ✅ Usuários podem salvar dados hoje
- ✅ Refatoração pode ser feita depois (se necessário)

---

## 🎯 PRÓXIMOS PASSOS

Após aplicar este fix:

1. ✅ **URGENTE:** Executar `fix_missing_tables.sql` no Supabase
2. ✅ Testar criação de cadernos/capítulos/páginas
3. ✅ Verificar persistência após reload
4. ⏳ (Opcional) Planejar refatoração para usar estrutura notebooks → sections → pages

---

## 📞 SUPORTE

Se o problema persistir após aplicar esta migração:

1. Verifique logs do DevTools (F12 → Console)
2. Execute queries de verificação no SQL Editor
3. Compartilhe mensagens de erro específicas

**Data:** 2025-10-28
**Severity:** 🔴 CRITICAL
**Status:** ✅ SOLUÇÃO PRONTA PARA APLICAR

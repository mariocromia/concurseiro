# 🔧 Fix: RLS Policies para Mapas Mentais

## ❌ Problema

Erro ao tentar gerar mapas mentais com IA:
```
❌ Erro: new row violates row-level security policy for table "mindmaps"
```

## 🎯 Causa

A tabela `mindmaps` tem Row Level Security (RLS) habilitado mas **não possui policies configuradas**, bloqueando todas as operações de INSERT.

## ✅ Solução

### ⚠️ IMPORTANTE: Se você recebeu erro "policy already exists"

**Boas notícias!** Isso significa que as policies já existem. Agora precisamos apenas **verificar** se estão corretas.

### 🔍 Passo 1: Verificar Policies Existentes

Execute o script `VERIFY_MINDMAPS_POLICIES.sql` no Supabase SQL Editor:

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Copie e execute o conteúdo de `VERIFY_MINDMAPS_POLICIES.sql`

**O que verificar nos resultados:**
- ✅ RLS está habilitado (`rowsecurity = true`) para ambas as tabelas
- ✅ Existem 8 policies (4 para `mindmaps` + 4 para `mindmap_nodes`)
- ✅ O teste de INSERT deve mostrar "✅ INSERT bem-sucedido!"
- ✅ `auth.uid()` retorna um UUID (usuário autenticado)

### 🔧 Passo 2: Se as Policies Existem mas Estão Incorretas

Se você vê as policies mas o INSERT de teste falha, as policies podem estar com expressões erradas. Neste caso:

1. Execute `FIX_MINDMAPS_RLS.sql` que **remove e recria** as policies corretas
2. O script usa `DROP POLICY IF EXISTS` antes de criar, então não dará erro

**Resultado esperado:**
- ✅ 8 policies recriadas
- ✅ 4 policies para `mindmaps` (SELECT, INSERT, UPDATE, DELETE)
- ✅ 4 policies para `mindmap_nodes` (SELECT, INSERT, UPDATE, DELETE)

## 📋 O que o script faz?

### Para a tabela `mindmaps`:
- **SELECT**: Usuários podem ver seus próprios mapas mentais
- **INSERT**: Usuários podem criar mapas mentais para si mesmos
- **UPDATE**: Usuários podem atualizar seus próprios mapas mentais
- **DELETE**: Usuários podem deletar seus próprios mapas mentais

### Para a tabela `mindmap_nodes`:
- **SELECT**: Usuários podem ver nós de mapas que pertencem a eles
- **INSERT**: Usuários podem criar nós em mapas que pertencem a eles
- **UPDATE**: Usuários podem atualizar nós de mapas que pertencem a eles
- **DELETE**: Usuários podem deletar nós de mapas que pertencem a eles

## 🧪 Testar

Após executar o script:
1. Acesse a aplicação
2. Vá para "Mapas Mentais"
3. Clique em "Criar com IA"
4. Selecione um caderno e capítulo
5. Clique em "Gerar Mapa Mental"

✅ **Deve funcionar sem erros!**

## 📝 Queries Úteis

### Verificar policies ativas:
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes')
ORDER BY tablename, policyname;
```

### Verificar RLS habilitado:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('mindmaps', 'mindmap_nodes');
```

### Desabilitar RLS temporariamente (NÃO RECOMENDADO):
```sql
-- APENAS PARA DEBUG - NÃO USE EM PRODUÇÃO
ALTER TABLE public.mindmaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindmap_nodes DISABLE ROW LEVEL SECURITY;
```

## 🔍 Troubleshooting

### Erro persiste após executar o script?

1. **Verifique se o usuário está autenticado:**
   ```sql
   SELECT auth.uid(); -- Deve retornar um UUID válido
   ```

2. **Verifique se o user_id está correto:**
   - O `user_id` na tabela `mindmaps` deve ser igual ao `auth.uid()`
   - Verifique no código do servidor se está usando `event.context.user.id`

3. **Limpe o cache do navegador:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

4. **Reinicie o servidor dev:**
   ```bash
   cd prapassar-app
   npm run dev
   ```

## 📚 Referências

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)

---

**Criado em:** 2025-10-21
**Versão:** 1.0

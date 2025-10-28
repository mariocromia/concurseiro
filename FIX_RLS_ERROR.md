# 🚨 FIX: "violates row-level security policy"

## PROBLEMA
Erro ao criar capítulo: `new row violates row-level security policy for table "chapters"`

## CAUSA MAIS COMUM
O `user_id` que está sendo enviado do frontend **NÃO CORRESPONDE** ao `auth.uid()` do banco.

---

## ✅ SOLUÇÃO RÁPIDA (3 passos)

### Passo 1: Verificar DEBUG no Supabase

Execute o script `DEBUG_RLS.sql` no Supabase SQL Editor:

```bash
# Arquivo: database/DEBUG_RLS.sql
```

**O que verificar:**
1. Query 1: `auth.uid()` retorna UUID? ✅ SIM / ❌ NÃO (NULL)
2. Query 3: Existe política "Usuários podem inserir seus capítulos"? ✅ SIM / ❌ NÃO
3. Query 8: Diagnóstico final - qual mensagem aparece?

### Passo 2: Reiniciar servidor dev

```bash
cd prapassar-app

# Windows
taskkill /F /IM node.exe
npm run dev

# Linux/Mac
pkill node
npm run dev
```

**Por quê?** Mudanças no código só são aplicadas após reiniciar.

### Passo 3: Testar criação de capítulo

1. Abra http://localhost:3000/notebook
2. Abra DevTools (F12) → Aba **Console**
3. Clique em **"+"** ao lado de um caderno
4. Veja no console:

**✅ Se aparecer:**
```
✅ User ID encontrado: [UUID]
✅ Capítulo criado: {...}
```
→ **FUNCIONOU!**

**❌ Se aparecer:**
```
❌ Usuário não autenticado
```
→ **Problema de autenticação** (veja seção TROUBLESHOOTING abaixo)

**❌ Se aparecer:**
```
violates row-level security policy
```
→ **Problema de RLS** (veja seção RLS POLICY FIX abaixo)

---

## 🔧 TROUBLESHOOTING

### Problema 1: auth.uid() retorna NULL

**Causa:** Você não está autenticado no Supabase.

**Solução:**
1. Faça logout da aplicação
2. Faça login novamente
3. Recarregue a página
4. Tente criar capítulo

### Problema 2: user.value?.id é undefined no frontend

**Causa:** `useSupabaseUser()` não está carregado.

**Solução no código (JÁ APLICADA):**
```typescript
// Fallback robusto (linhas 1171-1172, 1235-1236)
const { data: currentUser } = await supabase.auth.getUser()
const userId = user.value?.id || currentUser?.user?.id
```

**Verificar manualmente:**
```javascript
// No console do navegador (F12)
const supabase = useSupabaseClient()
const { data } = await supabase.auth.getUser()
console.log('User ID:', data?.user?.id)
```

### Problema 3: Políticas RLS não existem

**Causa:** Script `FIX_FINAL_CHAPTERS_PAGES.sql` não foi executado corretamente.

**Solução:** Reexecutar com DROP antes:

```sql
-- 1. DROPAR políticas antigas
DROP POLICY IF EXISTS "Usuários podem inserir seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem ver seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem atualizar seus capítulos" ON public.chapters;
DROP POLICY IF EXISTS "Usuários podem deletar seus capítulos" ON public.chapters;

-- 2. RECRIAR políticas
CREATE POLICY "Usuários podem inserir seus capítulos"
  ON public.chapters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus capítulos"
  ON public.chapters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus capítulos"
  ON public.chapters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus capítulos"
  ON public.chapters FOR DELETE
  USING (auth.uid() = user_id);
```

### Problema 4: user_id tem tipo errado

**Causa:** `user_id` está sendo enviado como string ao invés de UUID.

**Verificar:**
```sql
-- Ver tipo da coluna user_id
SELECT
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'chapters'
AND column_name = 'user_id';
```

**Resultado esperado:**
```
column_name | data_type | udt_name
------------|-----------|----------
user_id     | uuid      | uuid
```

**Se estiver errado:** Dropar e recriar tabela.

---

## 🔬 RLS POLICY FIX

Se o problema persistir após todos os passos acima, tente criar uma política **PERMISSIVA TOTAL** (temporária para debug):

```sql
-- ATENÇÃO: Esta política é INSEGURA e só deve ser usada para DEBUG!
DROP POLICY IF EXISTS "chapters_debug_permissive" ON public.chapters;

CREATE POLICY "chapters_debug_permissive"
  ON public.chapters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

**Teste criar capítulo:**
- ✅ **Funcionou?** O problema é com a política original. Use a política correta:
  ```sql
  DROP POLICY "chapters_debug_permissive" ON public.chapters;

  CREATE POLICY "Usuários podem inserir seus capítulos"
    ON public.chapters FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  ```

- ❌ **Ainda falhou?** O problema NÃO é RLS. Verifique:
  1. Constraint de foreign key (subject_id existe?)
  2. Tipo de dado (user_id é UUID válido?)
  3. NOT NULL constraint (todos campos obrigatórios preenchidos?)

---

## 📊 VERIFICAÇÃO FINAL

Execute esta query para ver exatamente o que está sendo comparado:

```sql
SELECT
  auth.uid() AS meu_user_id,
  c.user_id AS user_id_tabela,
  auth.uid() = c.user_id AS match,
  CASE
    WHEN auth.uid() = c.user_id THEN '✅ User IDs correspondem'
    ELSE '❌ User IDs NÃO correspondem - RLS vai bloquear'
  END AS diagnostico
FROM public.chapters c
LIMIT 1;
```

**Se não houver registros:** Execute INSERT de teste manualmente:

```sql
-- Verificar seu user_id
SELECT auth.uid();

-- Criar um subject de teste (se não tiver)
INSERT INTO public.subjects (user_id, name)
VALUES (auth.uid(), 'Teste RLS')
RETURNING id;

-- Criar chapter de teste (substitua o UUID do subject)
INSERT INTO public.chapters (user_id, subject_id, title, order_index)
VALUES (
  auth.uid(),
  'COLE_UUID_DO_SUBJECT_AQUI',
  'Capítulo Teste',
  0
)
RETURNING *;
```

---

## 🎯 CHECKLIST DE CORREÇÃO

Execute na ordem:

- [ ] 1. Executar `DEBUG_RLS.sql` no Supabase SQL Editor
- [ ] 2. Verificar que `auth.uid()` retorna UUID (não NULL)
- [ ] 3. Verificar que políticas RLS existem para INSERT
- [ ] 4. Reiniciar servidor dev (`npm run dev`)
- [ ] 5. Limpar cache do navegador (Ctrl+Shift+R)
- [ ] 6. Fazer logout + login na aplicação
- [ ] 7. Abrir DevTools (F12) → Console
- [ ] 8. Tentar criar capítulo
- [ ] 9. Ver no console se "✅ User ID encontrado" aparece
- [ ] 10. Se ainda falhar, executar política permissiva de debug

**Se TODOS os passos falharem:**
- Compartilhe a saída completa de `DEBUG_RLS.sql`
- Compartilhe mensagens do console do navegador (F12)
- Compartilhe erro exato do Supabase

---

## 📝 ARQUIVOS MODIFICADOS NESTA SESSÃO

### Frontend
- `app/pages/notebook.vue`
  - Linhas 1171-1180: `openChapterForm()` - fallback robusto para user_id
  - Linhas 1235-1244: `createChapter()` - fallback robusto para user_id
  - Linhas 1314-1320: Criar primeira página - fallback para user_id
  - Linhas 1378-1384: Criar página no save - fallback para user_id

### SQL
- `database/DEBUG_RLS.sql` (NOVO) - Script de diagnóstico
- `database/FIX_FINAL_CHAPTERS_PAGES.sql` (executado anteriormente)

---

**Data:** 2025-10-28
**Status:** Aguardando teste após correções aplicadas

# 🐛 Debug: Erro 500 ao Salvar Exercícios

**Data:** 2025-10-20
**Erro:** `FetchError: [POST] "/api/exercises/save": 500 Server Error`

---

## 📋 Problema

Ao clicar em "Salvar nos Relatórios" após responder exercícios IA, retorna erro 500.

---

## 🔍 Causas Possíveis

### 1. Problemas de Autenticação (Mais Provável)
- `serverSupabaseClient` pode não estar pegando a sessão corretamente
- Cookies não sendo enviados no POST
- CORS/credentials issue

### 2. Problemas de RLS (Row Level Security)
- Política RLS muito restritiva
- `auth.uid()` retornando null no contexto server-side

### 3. Problemas no Banco
- Tabela `saved_exercise_results` não existe
- Colunas com nomes diferentes
- Constraints violadas

### 4. Erro no Código
- Tipo de dado incorreto
- JSON inválido
- Validação falhando

---

## 🧪 Testes para Identificar a Causa

### Teste 1: Verificar Logs do Servidor

**Ação:** Após clicar em "Salvar nos Relatórios", verificar terminal com `npm run dev`

**Logs esperados:**
```
[API exercises/save] ===== INÍCIO =====
[API exercises/save] User ID: [uuid]
[API exercises/save] Body recebido: { ... }
[API exercises/save] Dados a inserir: { ... }
```

**Se não aparecer nada:**
- Endpoint não está sendo chamado
- Problema de rota/build

**Se aparecer "❌ Usuário não autenticado":**
- Problema de autenticação server-side

**Se aparecer "❌ Erro Supabase":**
- Problema no banco (RLS, schema, etc)

---

### Teste 2: Desabilitar RLS Temporariamente

**SQL no Supabase:**
```sql
-- TEMPORÁRIO - APENAS PARA TESTE
ALTER TABLE saved_exercise_results DISABLE ROW LEVEL SECURITY;
```

**Ação:** Tentar salvar novamente

**Se funcionar:**
- Problema é RLS
- Políticas muito restritivas

**Depois do teste:**
```sql
-- REABILITAR
ALTER TABLE saved_exercise_results ENABLE ROW LEVEL SECURITY;
```

---

### Teste 3: Verificar Políticas RLS

**SQL:**
```sql
-- Ver políticas existentes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'saved_exercise_results';
```

**Política correta deve ter:**
- `INSERT` permission
- `USING (auth.uid() = user_id)` ou similar
- Função `auth.uid()` funcionando

---

### Teste 4: Inserção Manual no SQL

**SQL no Supabase:**
```sql
-- Inserir manualmente (SUBSTITUA o user_id)
INSERT INTO public.saved_exercise_results (
  user_id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  questions_data
)
VALUES (
  '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid,
  'Teste Manual',
  5,
  3,
  60.00,
  '{}'::jsonb
)
RETURNING *;
```

**Se funcionar:**
- Tabela OK
- Problema é autenticação no endpoint

**Se falhar:**
- Ver erro retornado
- Pode ser schema ou RLS

---

## 🔧 Soluções por Tipo de Erro

### Solução 1: Autenticação Server-Side

**Problema:** `serverSupabaseClient` não pega a sessão

**Correção no endpoint:**
```typescript
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)

  // Tentar método alternativo
  const user = event.context.user

  if (!user || !user.id) {
    // Método de backup
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    if (!userId) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }
  }

  const userId = user.id
  // ... resto do código
})
```

---

### Solução 2: RLS Muito Restritivo

**Problema:** Políticas RLS impedindo insert

**Corrigir política:**
```sql
-- Deletar política antiga (se existir)
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios exercícios"
  ON public.saved_exercise_results;

-- Criar política correta
CREATE POLICY "Usuários podem inserir seus próprios exercícios"
  ON public.saved_exercise_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Também permitir SELECT
CREATE POLICY "Usuários podem ver seus próprios exercícios"
  ON public.saved_exercise_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

---

### Solução 3: Schema Incorreto

**Problema:** Colunas não batem

**Verificar schema:**
```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'saved_exercise_results'
ORDER BY ordinal_position;
```

**Schema esperado:**
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL
- `subject_id` UUID (nullable)
- `title` VARCHAR(255) NOT NULL
- `total_questions` INTEGER NOT NULL
- `correct_answers` INTEGER NOT NULL
- `score_percentage` DECIMAL(5,2) NOT NULL
- `questions_data` JSONB NOT NULL
- `created_at` TIMESTAMP

---

## 📝 Checklist de Debug

- [ ] Verificar logs do servidor ao clicar em "Salvar"
- [ ] Confirmar que endpoint `/api/exercises/save.post.ts` existe
- [ ] Verificar se `user_id` está sendo obtido
- [ ] Verificar se body está sendo enviado corretamente
- [ ] Testar desabilitar RLS temporariamente
- [ ] Verificar políticas RLS existentes
- [ ] Testar inserção manual via SQL
- [ ] Verificar schema da tabela
- [ ] Verificar se tabela existe
- [ ] Verificar console do navegador para erros adicionais

---

## 🎯 Próximos Passos Imediatos

1. **Clique novamente em "Salvar nos Relatórios"**
2. **Verifique o terminal** onde `npm run dev` roda
3. **Copie todos os logs** que aparecerem com `[API exercises/save]`
4. **Execute um dos testes** acima baseado no resultado

---

## 📊 Informações do Sistema

- **User ID:** `0b17dba0-7c78-4c43-a2cf-f6d890f8d329`
- **Email:** `netsacolas@gmail.com`
- **Servidor:** http://localhost:3000
- **Endpoint:** `POST /api/exercises/save`
- **Arquivo:** `server/api/exercises/save.post.ts`

---

**Logs melhorados adicionados em:** 2025-10-20
**Status:** Aguardando teste para ver logs completos

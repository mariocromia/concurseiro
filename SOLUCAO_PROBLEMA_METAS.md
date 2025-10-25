# 🔧 Solução do Problema - Cadastro de Metas

## ❌ Problema
**Sintoma:** Ao cadastrar uma meta na página `/metas`, os dados não estão sendo salvos nas tabelas `goals` e `goal_checklist_items`.

## 🔍 Diagnóstico Realizado

Adicionei **logs detalhados** no endpoint `server/api/goals/index.post.ts` para identificar onde está o problema.

### Logs Adicionados:
- ✅ Autenticação do usuário
- ✅ Dados recebidos no request body
- ✅ Inserção na tabela `goals`
- ✅ Inserção na tabela `goal_checklist_items`
- ✅ Busca da meta completa
- ✅ Erros em cada etapa

## 📋 Como Testar e Debugar

### Passo 1: Verifique se as Tabelas Existem

Execute no **SQL Editor do Supabase**:

\`\`\`sql
-- Verificar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('goals', 'goal_checklist_items')
ORDER BY table_name;
\`\`\`

**Resultado Esperado:** Deve retornar 2 linhas:
- `goal_checklist_items`
- `goals`

**Se NÃO retornar nada:**
👉 Execute o arquivo `database/2025-10-21_create_goals_system.sql` no SQL Editor

### Passo 2: Teste o Cadastro de Meta

1. **Abra o navegador e acesse:** http://localhost:3001/metas
2. **Abra o DevTools:** Pressione F12
3. **Vá para a aba Console** e **Network**
4. **Clique em "Nova Meta"**
5. **Preencha os campos:**
   - Nome da Meta
   - Matéria
   - Data de Conclusão
   - Checklist Items (pelo menos 1)
6. **Clique em "Salvar Meta"**

### Passo 3: Observe os Logs

**No Terminal (onde está rodando `npm run dev`):**

Você verá logs como:

\`\`\`
🔷 [POST /api/goals] Iniciando criação de meta...
🔷 [POST /api/goals] User ID: abc123-def456-...
🔷 [POST /api/goals] Auth Error: null
🔷 [POST /api/goals] Request Body: {
  "name": "Minha Meta",
  "subject_id": "xyz789-...",
  "target_date": "2025-12-31",
  "checklist_items": [
    { "description": "Item 1" }
  ]
}
🔷 [POST /api/goals] Inserindo meta na tabela goals...
🔷 [POST /api/goals] Goal Data: { ... }
🔷 [POST /api/goals] Goal criada: { id: "...", ... }
🔷 [POST /api/goals] Goal Error: null
🔷 [POST /api/goals] Inserindo itens do checklist...
🔷 [POST /api/goals] Checklist Items: [ ... ]
🔷 [POST /api/goals] Items inseridos: [ ... ]
🔷 [POST /api/goals] Items Error: null
✅ [POST /api/goals] Meta criada com sucesso!
\`\`\`

**No DevTools (aba Network):**

- Procure pela requisição `POST /api/goals`
- **Status Code:** Deve ser **200** (sucesso)
- **Response:**
  \`\`\`json
  {
    "success": true,
    "message": "Meta criada com sucesso!",
    "data": { ... }
  }
  \`\`\`

### Passo 4: Verifique se Salvou no Banco

Execute no **SQL Editor**:

\`\`\`sql
-- Ver todas as metas
SELECT * FROM public.goals ORDER BY created_at DESC;

-- Ver todos os itens de checklist
SELECT * FROM public.goal_checklist_items ORDER BY created_at DESC;
\`\`\`

## 🐛 Possíveis Erros e Soluções

### Erro 1: 401 Unauthorized
**Causa:** Usuário não está autenticado
**Solução:**
1. Verifique se está logado
2. Tente fazer logout e login novamente
3. Limpe os cookies do navegador

### Erro 2: 400 Bad Request
**Causa:** Dados inválidos ou faltando
**Logs a observar:**
- `❌ [POST /api/goals] Nome da meta não fornecido`
- `Matéria é obrigatória`
- `Data de conclusão é obrigatória`

**Solução:**
- Preencha TODOS os campos obrigatórios
- Verifique se a data não é no passado
- Adicione pelo menos 1 item ao checklist

### Erro 3: 500 Internal Server Error

#### 3.1: Tabelas não existem
**Log:**
\`\`\`
❌ [POST /api/goals] Erro ao criar meta: relation "public.goals" does not exist
\`\`\`

**Solução:**
1. Vá para o Supabase SQL Editor
2. Execute o arquivo `database/2025-10-21_create_goals_system.sql`

#### 3.2: Erro de RLS (Row Level Security)
**Log:**
\`\`\`
❌ [POST /api/goals] Erro ao criar meta: new row violates row-level security policy
\`\`\`

**Solução:**

Execute no SQL Editor:

\`\`\`sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'goal_checklist_items');

-- Verificar políticas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('goals', 'goal_checklist_items');

-- Se as políticas não existirem, execute novamente:
-- database/2025-10-21_create_goals_system.sql
\`\`\`

#### 3.3: Erro de Foreign Key
**Log:**
\`\`\`
❌ [POST /api/goals] Erro ao criar meta: insert or update on table "goals" violates foreign key constraint
\`\`\`

**Causa:** O `subject_id` fornecido não existe na tabela `subjects`

**Solução:**

Execute no SQL Editor:

\`\`\`sql
-- Verificar se a matéria existe
SELECT id, name FROM public.subjects WHERE id = 'SEU_SUBJECT_ID';

-- Se não existir, crie uma matéria primeiro
INSERT INTO public.subjects (user_id, name, color, icon)
VALUES (
  auth.uid(),
  'Matemática',
  '#3B82F6',
  'calculator'
)
RETURNING id, name;
\`\`\`

## ✅ Checklist de Verificação

Antes de criar uma meta, certifique-se:

- [ ] As tabelas `goals` e `goal_checklist_items` existem no banco
- [ ] Você está logado na aplicação
- [ ] Você tem pelo menos 1 matéria cadastrada
- [ ] O servidor `npm run dev` está rodando
- [ ] O DevTools está aberto para ver erros

## 📊 Informações Necessárias

Se o problema persistir, me envie:

1. **Logs do terminal** (copie TODOS os logs que começam com 🔷 ou ❌)
2. **Status Code** da requisição (da aba Network)
3. **Response Body** (da aba Network)
4. **Mensagens de erro** do console do navegador
5. **Resultado da query:**
   \`\`\`sql
   SELECT COUNT(*) as total_goals FROM public.goals;
   SELECT COUNT(*) as total_items FROM public.goal_checklist_items;
   \`\`\`

## 🎯 Solução Rápida

Se as tabelas não existem:

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Crie uma **New Query**
4. Cole TODO o conteúdo de: `database/2025-10-21_create_goals_system.sql`
5. Clique em **Run** (ou F5)
6. Aguarde a confirmação: "Success. No rows returned"
7. Tente criar a meta novamente

## 📝 Exemplo de Teste Manual

Execute no SQL Editor para testar inserção manual:

\`\`\`sql
-- 1. Pegar seu user_id
SELECT auth.uid() as my_user_id;

-- 2. Pegar um subject_id
SELECT id, name FROM public.subjects LIMIT 1;

-- 3. Inserir meta de teste (substitua os IDs)
INSERT INTO public.goals (user_id, subject_id, name, target_date)
VALUES (
  'SEU_USER_ID',
  'SEU_SUBJECT_ID',
  'Meta de Teste Manual',
  '2025-12-31'
)
RETURNING *;

-- 4. Pegar o ID da meta criada
SELECT id FROM public.goals ORDER BY created_at DESC LIMIT 1;

-- 5. Inserir item de checklist (substitua o GOAL_ID)
INSERT INTO public.goal_checklist_items (goal_id, description, order_index)
VALUES (
  'SEU_GOAL_ID',
  'Item de teste',
  0
)
RETURNING *;

-- 6. Verificar se salvou
SELECT * FROM public.goals ORDER BY created_at DESC LIMIT 1;
SELECT * FROM public.goal_checklist_items ORDER BY created_at DESC LIMIT 1;
\`\`\`

## 🔄 Próximos Passos

1. Execute os passos de diagnóstico acima
2. Capture os logs do terminal e do DevTools
3. Me envie as informações solicitadas
4. Analisaremos juntos onde está o problema específico

---

**Arquivo atualizado:** `server/api/goals/index.post.ts`
**Logs adicionados:** ✅ Sim
**Pronto para debug:** ✅ Sim

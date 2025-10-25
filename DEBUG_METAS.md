# 🔍 DEBUG - Problema no Cadastro de Metas

## ❌ Problema Relatado
- **Sintoma:** Ao realizar o cadastro de meta, ela não está sendo gravada nas tabelas `goals` e `goal_checklist_items`
- **Página:** `/metas`
- **Operação:** Criar nova meta com checklist

## 🔎 Checklist de Diagnóstico

### 1. ✅ Verificar se as tabelas existem no banco de dados

Execute no SQL Editor do Supabase:

```sql
-- Verificar se a tabela goals existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'goals'
);

-- Verificar se a tabela goal_checklist_items existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'goal_checklist_items'
);

-- Listar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2. ✅ Verificar estrutura das tabelas

```sql
-- Estrutura da tabela goals
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'goals'
ORDER BY ordinal_position;

-- Estrutura da tabela goal_checklist_items
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'goal_checklist_items'
ORDER BY ordinal_position;
```

### 3. ✅ Verificar RLS (Row Level Security)

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('goals', 'goal_checklist_items');

-- Listar políticas de RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('goals', 'goal_checklist_items');
```

### 4. ✅ Testar inserção manual

```sql
-- Testar inserção direta (substitua os UUIDs)
-- Primeiro, pegue seu user_id
SELECT id, email FROM auth.users LIMIT 1;

-- Pegue um subject_id
SELECT id, name FROM public.subjects LIMIT 1;

-- Agora tente inserir uma meta de teste
INSERT INTO public.goals (user_id, subject_id, name, target_date)
VALUES (
  'SEU_USER_ID_AQUI',
  'SEU_SUBJECT_ID_AQUI',
  'Meta de Teste Manual',
  '2025-12-31'
)
RETURNING *;

-- Verificar se foi inserida
SELECT * FROM public.goals ORDER BY created_at DESC LIMIT 1;
```

### 5. ✅ Verificar logs do servidor

Quando você tenta criar uma meta pelo frontend:

1. Abra as **DevTools** do navegador (F12)
2. Vá na aba **Network**
3. Tente criar uma meta
4. Procure pela requisição `POST /api/goals`
5. Verifique:
   - **Status Code** (200, 400, 401, 500?)
   - **Request Payload** (dados enviados)
   - **Response** (resposta do servidor)

### 6. ✅ Verificar console do navegador

No console do navegador (F12 → Console), procure por:
- Mensagens de erro em vermelho
- Warnings em amarelo
- Logs de sucesso/erro

### 7. ✅ Verificar autenticação

```sql
-- Verificar se o usuário está autenticado
SELECT auth.uid();

-- Se retornar NULL, o usuário não está autenticado
-- Se retornar um UUID, está autenticado
```

## 🐛 Possíveis Causas

### Causa 1: Tabelas não foram criadas
**Solução:** Execute o arquivo de migração `database/2025-10-21_create_goals_system.sql` no SQL Editor do Supabase

### Causa 2: RLS bloqueando inserção
**Sintoma:** Status 500 ou erro de permissão
**Solução:** Verificar se as políticas RLS estão corretas e se `auth.uid()` retorna o ID correto

### Causa 3: Erro de validação
**Sintoma:** Status 400
**Solução:** Verificar se todos os campos obrigatórios estão sendo enviados:
- `name` (string, não vazio)
- `subject_id` (UUID válido)
- `target_date` (data no formato YYYY-MM-DD, não passado)
- `checklist_items` (array com pelo menos 1 item, cada um com `description`)

### Causa 4: Erro de autenticação
**Sintoma:** Status 401
**Solução:** Verificar se o token de autenticação está sendo enviado corretamente

### Causa 5: Erro no servidor
**Sintoma:** Status 500
**Solução:** Verificar logs do servidor no terminal onde rodou `npm run dev`

## 🔧 Como Debugar Passo a Passo

### Passo 1: Abra o DevTools
- Aperte **F12** no navegador
- Vá na aba **Console**
- Vá na aba **Network**

### Passo 2: Ative "Preserve Log"
- Na aba Network, marque a opção "Preserve log"
- Isso mantém os logs mesmo quando a página recarregar

### Passo 3: Tente criar uma meta
- Preencha todos os campos
- Clique em "Salvar Meta"
- Observe o que acontece

### Passo 4: Analise a requisição
- Na aba Network, procure por `goals` ou `POST`
- Clique na requisição
- Veja:
  - **Headers** (cabeçalhos enviados)
  - **Payload** (dados enviados)
  - **Response** (resposta do servidor)
  - **Preview** (preview da resposta)

### Passo 5: Verifique erros no console
- Volte para a aba **Console**
- Veja se há erros em vermelho
- Copie a mensagem de erro completa

## 📋 Informações Necessárias para Debug

Por favor, me envie:

1. **Status Code da requisição** (200, 400, 401, 500?)
2. **Mensagem de erro** (se houver)
3. **Request Payload** (dados enviados)
4. **Response** (resposta do servidor)
5. **Resultado da query**: `SELECT * FROM public.goals;`
6. **Resultado da query**: `SELECT auth.uid();` (executado enquanto logado)
7. **Logs do terminal** onde está rodando `npm run dev`

## 🎯 Solução Rápida

Se as tabelas não existem, execute isso no Supabase SQL Editor:

```sql
-- Copie TODO o conteúdo do arquivo:
-- database/2025-10-21_create_goals_system.sql
-- E execute no SQL Editor do Supabase
```

## 📞 Próximos Passos

1. Execute as queries de verificação acima
2. Tente criar uma meta e capture as informações solicitadas
3. Me envie os resultados para análise

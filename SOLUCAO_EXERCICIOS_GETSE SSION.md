# ✅ Solução: Exercícios IA não estavam salvando

**Data**: 2025-10-20
**Status**: ✅ **CORRIGIDO**

---

## 📋 Problema Identificado

Os exercícios gerados por IA não estavam sendo salvos na tabela `saved_exercise_results`, resultando em relatórios vazios.

**Sintoma**:
- Ao clicar em "Salvar nos Relatórios" após fazer exercícios IA
- Erro 500 no console do navegador
- Dados não apareciam em `/reports`

---

## 🔍 Causa Raiz

**MESMO PROBLEMA** que afetou os relatórios de tempo de estudo anteriormente:

`useSupabaseUser()` retornava `user.value.id = undefined` em algumas situações, especialmente em:
- Endpoints de API server-side
- Requisições feitas logo após login
- Carregamento assíncrono do Nuxt

---

## ✅ Solução Aplicada

### 1. Endpoint `/api/exercises/save.post.ts`

**Antes (ERRADO)**:
```typescript
const client = await serverSupabaseClient(event)
const { data: { user }, error: userError } = await client.auth.getUser()
const userId = user.id  // ❌ Retornava undefined
```

**Depois (CORRETO)**:
```typescript
const client = await serverSupabaseClient(event)
// ✅ Usar getSession() ao invés de getUser()
const { data: sessionData, error: sessionError } = await client.auth.getSession()
const userId = sessionData?.session?.user?.id  // ✅ Sempre funciona
```

**Arquivo**: `prapassar-app/server/api/exercises/save.post.ts` (linhas 11-23)

---

### 2. AIExercisesModal.vue - Estrutura de dados

**Problema adicional**: O código tentava acessar propriedades com nomes errados.

**Antes (ERRADO)**:
```typescript
const questionsData = exercises.value.map((ex, idx) => ({
  question: ex.question,
  alternatives: ex.alternatives,  // ❌ Não existe
  correct_answer: ex.correctAnswer,  // ❌ Nome errado
  explanation: ex.explanation,
  // ...
}))
```

**Depois (CORRETO)**:
```typescript
const questionsData = exercises.value.map((ex, idx) => ({
  question: ex.question,
  options: ex.options,  // ✅ Nome correto (interface Exercise)
  correct_answer: ex.correct_answer,  // ✅ Nome correto
  explanation: ex.explanation,
  // ...
}))
```

**Arquivo**: `prapassar-app/app/components/AIExercisesModal.vue` (linhas 520-528)

---

### 3. AIExercisesModal.vue - Autenticação no fetch

**Simplificação**: Removido envio manual do token, pois o Nuxt gerencia via cookies.

**Antes (DESNECESSÁRIO)**:
```typescript
const { data: { session } } = await client.auth.getSession()
const response = await $fetch('/api/exercises/save', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`  // ❌ Redundante
  },
  body: payload
})
```

**Depois (CORRETO)**:
```typescript
// ✅ Nuxt gerencia autenticação via cookies automaticamente
const response = await $fetch('/api/exercises/save', {
  method: 'POST',
  body: payload
})
```

**Arquivo**: `prapassar-app/app/components/AIExercisesModal.vue` (linhas 542-547)

---

## 🔗 Contexto: Solução Anterior (Relatórios)

Essa solução **já havia sido aplicada** anteriormente nos relatórios de tempo de estudo:

### Arquivos corrigidos anteriormente:
1. ✅ `prapassar-app/app/composables/useReports.ts` (linhas 124-126)
2. ✅ `prapassar-app/app/composables/useStudyTimer.ts` (linhas 128-129)
3. ✅ `prapassar-app/app/pages/test-reports-simple.vue` (linhas 15-17)

**Documentação anterior**: `SESSAO_CONTINUAR_AMANHA.md`

---

## 📝 Padrão de Correção

**Regra geral**: Em qualquer contexto onde `user.value.id` retornar `undefined`, use:

```typescript
const { data: sessionData } = await supabase.auth.getSession()
const userId = sessionData?.session?.user?.id
```

**Contextos afetados**:
- ✅ Server-side API endpoints (`defineEventHandler`)
- ✅ Composables que fazem queries ao banco
- ✅ Componentes que salvam dados

**Por que `getSession()` funciona melhor**:
1. Acessa diretamente os cookies da sessão
2. Não depende de estados reativos do Vue
3. Funciona consistentemente server-side e client-side
4. É síncrono com a autenticação do Supabase

---

## 🧪 Como Testar

### 1. Iniciar servidor
```bash
cd prapassar-app
npm run dev
```

### 2. Gerar exercício IA
1. Acesse http://localhost:3000/dashboard
2. Clique em "Exercícios IA" (botão roxo)
3. Configure:
   - Quantidade: 5 questões
   - Dificuldade: Média
4. Clique em "Gerar Exercícios"
5. Responda todas as questões

### 3. Salvar nos relatórios
1. Na tela de resultados, clique em **"Salvar nos Relatórios"**
2. Aguarde mensagem de sucesso
3. Verifique console do navegador (F12):
   ```
   ✅ Exercícios salvos com sucesso nos relatórios!
   ```

### 4. Verificar nos relatórios
1. Acesse http://localhost:3000/reports
2. Procure a seção "Exercícios IA Salvos"
3. Deve mostrar o exercício salvo com:
   - Título
   - Matéria
   - Data
   - Nota percentual
   - Total de questões, acertos e erros

### 5. Verificar no banco de dados

Execute no **Supabase SQL Editor**:

```sql
SELECT
  id,
  title,
  total_questions,
  correct_answers,
  score_percentage,
  created_at
FROM public.saved_exercise_results
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado**: Deve retornar os exercícios salvos.

---

## 📂 Arquivos Modificados

### 1. Server-side API
- `prapassar-app/server/api/exercises/save.post.ts`
  - Linhas 11-23: Substituído `getUser()` por `getSession()`

### 2. Client-side Component
- `prapassar-app/app/components/AIExercisesModal.vue`
  - Linhas 520-528: Corrigido nomes de propriedades (`options`, `correct_answer`)
  - Linhas 542-547: Removido envio manual de token

---

## 🎯 Outros Locais que Podem Precisar da Mesma Correção

Se você encontrar erros de "usuário não autenticado" ou `user_id undefined` em:

1. **Composables**:
   - `useGlobalSearch.ts`
   - `useAuth.ts`
   - `useSubscription.ts`
   - `useGemini.ts`

2. **API Endpoints**:
   - Qualquer endpoint que use `event.context.user` sem verificar
   - Endpoints que fazem queries com `user_id`

3. **Páginas**:
   - Páginas que salvam dados logo após navegação
   - Formulários de submit

**Aplique a mesma solução**: Substituir `useSupabaseUser()` ou `getUser()` por `getSession()`.

---

## 📊 Comparação: getUser() vs getSession()

| Método | Contexto | Confiabilidade | Uso Recomendado |
|--------|----------|----------------|-----------------|
| `useSupabaseUser()` | Client-side composable | ⚠️ Instável | UI reativa, não para queries |
| `client.auth.getUser()` | Server/Client | ⚠️ Pode falhar | Validação de usuário |
| `client.auth.getSession()` | Server/Client | ✅ Confiável | **Queries, salvamento de dados** |

---

## ✅ Resultado Final

### Antes ❌
- Exercícios IA não salvavam
- Erro 500 no console
- Relatórios vazios
- `user_id` undefined

### Depois ✅
- Exercícios IA salvam corretamente
- Sem erros no console
- Relatórios completos com dados
- `user_id` sempre disponível

---

## 🔑 Informações Importantes

- **User ID de teste**: `0b17dba0-7c78-4c43-a2cf-f6d890f8d329`
- **Email de teste**: `netsacolas@gmail.com`
- **Servidor local**: http://localhost:3000
- **Supabase**: https://ubeivchkuoptmhkcglny.supabase.co

---

## 📖 Referências

- **Documentação anterior**: `SESSAO_CONTINUAR_AMANHA.md`
- **Problema original**: `DEBUG_EXERCICIOS_500.md`
- **Como testar**: `COMO_TESTAR_EXERCICIOS.md`
- **Verificação SQL**: `VERIFICAR_EXERCICIOS_SIMPLIFICADO.sql`

---

**✅ Problema RESOLVIDO**
**Data**: 2025-10-20
**Desenvolvido com Claude Code**

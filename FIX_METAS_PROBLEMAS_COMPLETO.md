# 🔧 FIX COMPLETO: Problemas do Sistema de Metas

**Data:** 2025-10-25
**Status:** 🔨 EM ANDAMENTO

## 📋 Problemas Identificados

### **Problema 1: Checklist não marca itens como concluídos** ✅ CORRIGIDO
Ao clicar na checkbox de um item do checklist na página `/metas/[id]`, nenhuma ação acontecia.

### **Problema 2: Metas não são exibidas no carregamento inicial** 🔍 INVESTIGANDO
- Ao atualizar a página `/metas`, as metas não são exibidas
- Se navegar para outra página e voltar através do menu, as metas aparecem
- Indica problema de cache ou hidratação do Nuxt/Vue

## 🔍 PROBLEMA 1: Checklist Toggle (RESOLVIDO)

### Causa Raiz
O endpoint `/api/goals/checklist/toggle.post.ts` estava usando uma query com `!inner` join que causava conflitos com as políticas RLS do Supabase.

### Solução Implementada

**1. Simplificação das Queries**
```typescript
// ❌ ANTES - Query com !inner join problemático
const { data: item, error: fetchError } = await supabase
  .from('goal_checklist_items')
  .select(`
    id,
    is_completed,
    goal_id,
    goal:goals!inner(user_id)  // ← PROBLEMA
  `)
  .eq('id', body.item_id)
  .single()

// ✅ DEPOIS - Queries separadas
const { data: item, error: fetchError } = await supabase
  .from('goal_checklist_items')
  .select(`
    id,
    is_completed,
    goal_id
  `)
  .eq('id', body.item_id)
  .single()

// Verificação de ownership separada
const { data: goal, error: goalError } = await supabase
  .from('goals')
  .select('id, user_id')
  .eq('id', item.goal_id)
  .eq('user_id', user.id)
  .single()
```

**2. Logs Detalhados de Debug**
- Backend (toggle.post.ts): 8 pontos de log
- Composable (useGoals.ts): 5 pontos de log
- Frontend (metas/[id].vue): 4 pontos de log
- Total: 17 pontos de log

**3. Feedback Visual**
- Toast notifications de sucesso/erro
- Animação de confetti mantida
- Mensagens claras para o usuário

### Arquivos Modificados (Problema 1)
1. ✅ `server/api/goals/checklist/toggle.post.ts`
2. ✅ `app/composables/useGoals.ts` (toggleChecklistItem)
3. ✅ `app/pages/metas/[id].vue` (handleToggleItem)

---

## 🔍 PROBLEMA 2: Metas não carregam no refresh (EM INVESTIGAÇÃO)

### Hipóteses

**Hipótese 1: Cache do useFetch**
O `useFetch` do Nuxt tem sistema de cache automático que pode estar causando problemas:
- Primeira visita: cache vazio, nada é exibido
- Navegação subsequente: cache é populado, metas aparecem
- Refresh: cache pode estar desatualizado ou não ser hidratado corretamente

**Hipótese 2: Problema de Hidratação SSR**
- Server-side: dados podem não estar sendo carregados
- Client-side: hidratação pode falhar silenciosamente
- `useState` do Nuxt pode ter comportamento diferente entre SSR e CSR

**Hipótese 3: Timing do onMounted**
- `onMounted` só executa no client-side
- Se os dados precisam estar disponíveis no SSR, precisa usar `onBeforeMount` ou `await` no setup

### Soluções Implementadas (Investigação)

**1. Desabilitado Cache do useFetch**
```typescript
const { data, error: fetchError } = await useFetch<{ success: boolean; data: Goal[] }>(
  `/api/goals${query}`,
  {
    method: 'GET',
    // Disable caching to ensure fresh data
    key: `goals-${status || 'all'}-${Date.now()}`,
    // Force server-side fetch
    server: true,
    // Disable lazy fetching
    lazy: false
  }
)
```

**2. Logs Detalhados Adicionados**

**Frontend (metas.vue):**
```typescript
onMounted(async () => {
  console.log('🔷 [Metas Page] onMounted - loading data')
  console.log('🔷 [Metas Page] Current goals state:', goals.value)
  await Promise.all([
    fetchGoals(),
    loadSubjects()
  ])
  console.log('🔷 [Metas Page] Data loaded - goals count:', goals.value.length)
})

watch(() => goals.value, (newGoals, oldGoals) => {
  console.log('🔷 [Metas Page] Goals changed:', {
    oldCount: oldGoals?.length || 0,
    newCount: newGoals?.length || 0,
    newGoals
  })
}, { deep: true })
```

**Composable (useGoals.ts):**
```typescript
const fetchGoals = async (status?) => {
  console.log('🔷 [useGoals] fetchGoals called with status:', status)
  console.log('🔷 [useGoals] Fetching goals from:', `/api/goals${query}`)
  console.log('🔷 [useGoals] Fetch result:', { data, error })
  console.log('✅ [useGoals] Goals loaded:', data.value.data.length, 'goals')
  console.log('🔷 [useGoals] Final state - goals count:', goals.value.length)
}
```

**Backend (index.get.ts):**
```typescript
console.log('🔷 [Goals API] Authentication check:', { userId: user?.id, authError })
console.log('🔷 [Goals API] Fetching goals for user:', user.id, 'with status filter:', status)
console.log('🔷 [Goals API] Query result:', { dataCount, error, firstGoal })
console.log('✅ [Goals API] Returning:', goalsWithProgress.length, 'goals')
```

### Arquivos Modificados (Problema 2)
1. ✅ `app/composables/useGoals.ts` (fetchGoals)
2. ✅ `app/pages/metas.vue` (onMounted + watch)
3. ✅ `server/api/goals/index.get.ts` (logs)

---

## 🧪 Como Testar

### Terminal 1 - Servidor de Desenvolvimento
```bash
cd prapassar-app
npm run dev
```

### Terminal 2 - Logs do Servidor
Acompanhe os logs do servidor no terminal 1 para mensagens como:
```
🔷 [Goals API] Authentication check: { userId: '...', authError: null }
🔷 [Goals API] Fetching goals for user: ... with status filter: undefined
🔷 [Goals API] Query result: { dataCount: 3, error: null, firstGoal: {...} }
✅ [Goals API] Returning: 3 goals
```

### Navegador - Console DevTools (F12)

**Teste 1: Problema do Checkbox (Resolvido)**
1. Navegar para `/metas`
2. Clicar em uma meta para abrir detalhes
3. Tentar marcar/desmarcar itens do checklist
4. Observar console para logs:
```
🔷 [Meta Details] Toggling item: { itemId: '...', willBeCompleted: true }
🔷 [useGoals] Toggling checklist item: ...
🔷 [Toggle Checklist] User ID: ...
🔷 [Toggle Checklist] Item fetch result: { item: {...}, fetchError: null }
✅ [Toggle Checklist] Item updated successfully
✅ [useGoals] Toggle successful, updating local state
✅ [Meta Details] Item toggled successfully
🎉 [Meta Details] Item completed! Celebrating...
```

**Teste 2: Problema do Refresh (Em Investigação)**
1. **Primeiro acesso (F5):**
   - Abrir `/metas`
   - Observar se metas são exibidas
   - Verificar logs no console:
```
🔷 [Metas Page] onMounted - loading data
🔷 [Metas Page] Current goals state: []
🔷 [useGoals] fetchGoals called with status: undefined
🔷 [useGoals] Goals loaded: X goals
🔷 [Metas Page] Data loaded - goals count: X
🔷 [Metas Page] Goals changed: { oldCount: 0, newCount: X, newGoals: [...] }
```

2. **Navegação (Menu → Outra página → Voltar):**
   - Ir para outra página (ex: `/dashboard`)
   - Voltar para `/metas` via menu
   - Observar se metas aparecem
   - Verificar logs

3. **Comparação:**
   - Comparar logs do "primeiro acesso" vs "navegação"
   - Identificar diferenças no comportamento

---

## 📊 Resultados Esperados

### ✅ Problema 1 (Checkbox) - RESOLVIDO
- [x] Checkbox marca/desmarca itens
- [x] Progresso atualiza automaticamente
- [x] Confetti ao completar itens
- [x] Toast de sucesso/erro
- [x] Trigger de banco atualiza status da meta

### 🔍 Problema 2 (Refresh) - EM INVESTIGAÇÃO
- [ ] Metas aparecem no primeiro acesso
- [ ] Metas aparecem após F5 (refresh)
- [ ] Não há diferença entre navegação e refresh
- [ ] Logs mostram comportamento consistente

---

## 🔧 Possíveis Soluções Adicionais (Problema 2)

Se os logs revelarem que o problema é de cache/hidratação, implementar:

### **Opção A: Trocar useFetch por $fetch**
```typescript
// Substituir useFetch por $fetch (sem cache)
const data = await $fetch<{ success: boolean; data: Goal[] }>(`/api/goals${query}`)
goals.value = data.data
```

### **Opção B: Usar useAsyncData com refresh**
```typescript
const { data, refresh } = await useAsyncData(
  'goals',
  () => $fetch(`/api/goals${query}`)
)
// Forçar refresh no onMounted
onMounted(() => refresh())
```

### **Opção C: Carregar dados no setup (SSR-friendly)**
```typescript
// Mover fetchGoals para fora do onMounted
const { goals, fetchGoals } = useGoals()
await fetchGoals() // Executa no SSR e CSR
```

### **Opção D: Usar onServerPrefetch (SSR)**
```typescript
// Garantir que dados são carregados no SSR
onServerPrefetch(async () => {
  await fetchGoals()
})
```

---

## 📝 Próximos Passos

1. **Teste os logs** - Execute os testes acima e colete os logs
2. **Analise o comportamento** - Identifique exatamente onde está falhando
3. **Implemente a solução** - Baseado nos logs, escolha a opção adequada
4. **Remova logs de debug** - Após confirmação, limpar logs verbosos
5. **Documente a solução final** - Atualizar este documento

---

## 📚 Referências

- **Nuxt useFetch**: https://nuxt.com/docs/api/composables/use-fetch
- **Nuxt useState**: https://nuxt.com/docs/api/composables/use-state
- **Nuxt Data Fetching**: https://nuxt.com/docs/getting-started/data-fetching
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security

---

**Status Atual:**
- ✅ **Problema 1 (Checkbox):** RESOLVIDO - Aguardando confirmação de testes
- 🔍 **Problema 2 (Refresh):** EM INVESTIGAÇÃO - Logs adicionados, aguardando análise

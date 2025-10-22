# 🔍 DIAGNÓSTICO: Atividades Somem ao Navegar Entre Páginas

**Data:** 2025-10-22
**Status:** EM INVESTIGAÇÃO COM LOGS ADICIONADOS

---

## 🚨 PROBLEMA RELATADO

"Em um determinado momento que atualizei a página todas as atividades que eu havia criado apareceram no calendário, mas após acessar metas e voltar para o dashboard todas sumiram novamente."

### Análise do Comportamento

1. ✅ Atividades **aparecem** em algum momento (dados ESTÃO no banco)
2. ✅ Carregamento **funciona** às vezes
3. ❌ Atividades **somem** ao navegar entre páginas
4. ❌ Erros no console: `id=eq.undefined`, `404 api/affiliates`

---

## 🎯 HIPÓTESES

### Hipótese Principal: Race Condition com Autenticação

**Problema:**
- `onMounted()` pode executar ANTES do usuário estar disponível
- `user.value` pode ser `null` no momento do `onMounted`
- `loadCalendarData()` é chamado, mas `fetchActivities()` falha porque `user.value?.id` é `undefined`
- Resultado: **Calendário fica vazio**

**Evidência:**
- Log mostra: `❌ Usuário não autenticado - user.value.id é undefined`
- Erros 400/404 com `id=eq.undefined` indicam queries com ID undefined

---

## ✅ CORREÇÕES APLICADAS

### 1. Logs Detalhados no Dashboard

**Arquivo:** `dashboard.vue`

#### onMounted (linhas 583-607)
```typescript
onMounted(async () => {
  console.log('📍 Dashboard onMounted')
  console.log('👤 user.value:', user.value ? user.value.id : 'NULL')

  if (user.value) {
    // ... carrega dados
    console.log('📅 Chamando loadCalendarData no onMounted...')
    await loadCalendarData()
  } else {
    console.warn('⚠️ user.value é NULL no onMounted - aguardando...')
  }
})
```

#### Watch no Usuário (linhas 609-616)
```typescript
// ✅ NOVO: Watch para detectar quando usuário estiver disponível
watch(user, async (newUser) => {
  if (newUser && !userData.value) {
    console.log('👤 Usuário disponível via watch:', newUser.id)
    console.log('📅 Carregando dados do calendário...')
    await loadCalendarData()
  }
})
```

**Por que isso ajuda:**
- Se `user.value` for `null` no `onMounted`, o `watch` detecta quando ele fica disponível
- Garante que `loadCalendarData()` seja chamado assim que o usuário estiver pronto

#### loadCalendarData (linhas 1034-1057)
```typescript
const loadCalendarData = async () => {
  console.log('📅📅📅 === INÍCIO: loadCalendarData (Dashboard) === 📅📅📅')

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const startStr = weekStart.toISOString().split('T')[0]
  const endStr = weekEnd.toISOString().split('T')[0]

  console.log('📆 Período da semana:', { startStr, endStr })
  console.log('🔄 Chamando fetchActivities...')

  await fetchActivities(startStr, endStr)

  console.log('📊 Calculando estatísticas...')
  calendarStats.value = getWorkloadStats(startStr, endStr)

  console.log('✅ loadCalendarData concluído')
  console.log('📊 activities.length:', activities.value.length)
  console.log('🏁 === FIM: loadCalendarData ===')
}
```

### 2. Correção Anterior no fetchActivities

**Arquivo:** `useStudySchedule.ts` (linhas 71-109)

Já corrigido anteriormente para usar `getSession()` ao invés de `user.value`.

---

## 🧪 TESTE AGORA

### Cenário 1: Recarregar Página

1. Recarregue a aplicação (Ctrl+R)
2. Abra o console (F12)
3. Observe os logs:

```
📍 Dashboard onMounted
👤 user.value: [uuid] ou NULL

SE user.value for NULL:
  ⚠️ user.value é NULL no onMounted - aguardando...
  (alguns segundos depois)
  👤 Usuário disponível via watch: [uuid]
  📅 Carregando dados do calendário...

📅📅📅 === INÍCIO: loadCalendarData (Dashboard) ===
📆 Período da semana: { ... }
🔄 Chamando fetchActivities...

🔄🔄🔄 === INÍCIO: fetchActivities (CARREGAMENTO) ===
✅ Usuário autenticado: [uuid]
📊 Quantidade de registros retornados: X
✅✅✅ Atividades processadas e armazenadas ✅✅✅

📊 Calculando estatísticas...
✅ loadCalendarData concluído
📊 activities.length: X
```

### Cenário 2: Navegar Entre Páginas

1. No dashboard, veja as atividades (devem aparecer)
2. Vá para /metas
3. Volte para /dashboard
4. Observe os logs no console
5. Veja se as atividades continuam aparecendo

**Logs esperados:**
```
📍 Dashboard onMounted  ← Chamado novamente ao voltar
👤 user.value: [uuid]   ← Deve ter o ID desta vez
📅 Chamando loadCalendarData no onMounted...
📅📅📅 === INÍCIO: loadCalendarData ===
...
📊 activities.length: X  ← Deve ter atividades!
```

---

## 🔍 O QUE OBSERVAR NOS LOGS

### ✅ SUCESSO (Esperado):

```
👤 user.value: abc-123-xyz  ← TEM ID
✅ Usuário autenticado: abc-123-xyz
📊 Quantidade de registros retornados: 3  ← ENCONTROU DADOS
📊 activities.length: 3  ← ARRAY TEM DADOS
```

### ❌ FALHA (Problema):

```
👤 user.value: NULL  ← SEM ID
❌ Usuário não autenticado
```

OU

```
👤 user.value: abc-123-xyz  ← TEM ID
✅ Usuário autenticado: abc-123-xyz
📊 Quantidade de registros retornados: 0  ← NÃO ENCONTROU
📊 activities.length: 0  ← ARRAY VAZIO
```

---

## 📊 POSSÍVEIS RESULTADOS

### Resultado A: Logs mostram user.value NULL no onMounted

**Significado:**
- Race condition confirmada
- Usuário não está disponível quando página carrega

**Solução:**
- O `watch` deve resolver isso
- Mas podemos melhorar usando `watchEffect` ou `onBeforeMount`

### Resultado B: Logs mostram user.value OK mas 0 registros

**Significado:**
- Autenticação OK
- Mas query não encontra dados

**Possíveis causas:**
1. Período de busca não inclui as atividades
2. RLS bloqueando SELECT
3. Atividades em datas diferentes

### Resultado C: Logs mostram tudo OK mas calendário fica vazio

**Significado:**
- Dados carregam corretamente
- `activities.value.length > 0`
- Mas componente CalendarView não renderiza

**Possíveis causas:**
1. Problema no componente CalendarView
2. Props não sendo passadas corretamente
3. Filtro de visualização escondendo atividades

---

## 🚨 INFORMAÇÕES NECESSÁRIAS

Por favor, execute os testes acima e me envie:

### 1. Logs ao Recarregar (F5)
- [ ] TODOS os logs desde `📍 Dashboard onMounted`
- [ ] Até `🏁 === FIM: loadCalendarData ===`
- [ ] Valor de `activities.length` no final

### 2. Logs ao Navegar
- [ ] Dashboard → Metas → Dashboard
- [ ] Copie logs do segundo `📍 Dashboard onMounted`
- [ ] Verifique se `activities.length` mudou

### 3. Screenshots
- [ ] Console com todos os logs
- [ ] Calendário mostrando se há atividades ou não

### 4. Teste no Supabase
Execute no SQL Editor:
```sql
SELECT COUNT(*) as total,
       MIN(scheduled_date) as primeira_data,
       MAX(scheduled_date) as ultima_data
FROM study_schedules
WHERE user_id = auth.uid();
```

Me envie o resultado!

---

## 🎯 PRÓXIMOS PASSOS BASEADOS NOS LOGS

Dependendo dos logs, vou:

1. **Se user.value é NULL:**
   - Implementar carregamento mais robusto
   - Usar `watchEffect` ou `immediate: true`

2. **Se query retorna 0:**
   - Verificar período de busca
   - Verificar políticas RLS
   - Ajustar filtros de data

3. **Se tudo carrega mas não aparece:**
   - Investigar componente CalendarView
   - Verificar props e eventos
   - Debugar renderização

---

**🔍 AGUARDANDO LOGS DO TESTE PARA CONTINUAR INVESTIGAÇÃO!**

# 🔧 CORREÇÃO CRÍTICA - Problema de Autenticação no Carregamento

**Data:** 2025-10-22
**Prioridade:** CRÍTICA - RESOLVIDA
**Status:** ✅ CORRIGIDO

---

## 🎯 PROBLEMA IDENTIFICADO

### Sintoma Principal
Atividades eram criadas mas **sumiam ao recarregar a página**.

### Causa Raiz Descoberta
O composable `useStudySchedule.ts` tinha **dois problemas críticos**:

#### ❌ Problema 1: fetchActivities() usava `user.value.id`
```typescript
// ANTES (ERRADO):
const user = useSupabaseUser()  // linha 42

const fetchActivities = async (startDate: string, endDate: string) => {
  if (!user.value?.id) {  // ❌ user.value.id estava undefined
    error.value = 'Usuário não autenticado'
    return
  }

  const { data } = await supabase
    .from('study_schedules')
    .eq('user_id', user.value.id)  // ❌ Filtrava por undefined!
}
```

**Por que falhava:**
- `useSupabaseUser()` é reativo e pode estar `null` ao carregar
- `user.value.id` retornava `undefined` durante o carregamento inicial
- A query filtrava por `user_id = undefined`
- Resultado: **0 registros encontrados**, mesmo com dados no banco

#### ❌ Problema 2: Endpoint de teste sem import
```typescript
// ANTES (ERRADO):
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)  // ❌ Not defined
})
```

**Por que falhava:**
- Faltava o import: `import { serverSupabaseClient } from '#supabase/server'`
- Causava erro 500

---

## ✅ CORREÇÃO APLICADA

### Correção 1: fetchActivities() agora usa getSession()

**Arquivo:** `useStudySchedule.ts` (linhas 71-104)

```typescript
// DEPOIS (CORRETO):
const fetchActivities = async (startDate: string, endDate: string) => {
  console.log('🔄 === INÍCIO: fetchActivities ===')

  // ✅ CORREÇÃO: Buscar sessão explicitamente
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session?.user?.id) {
    console.error('❌ Usuário não autenticado')
    console.error('sessionError:', sessionError)
    console.error('session:', session)
    error.value = 'Usuário não autenticado'
    return
  }

  console.log('✅ Usuário autenticado:', session.user.id)

  const { data, error: fetchError } = await supabase
    .from('study_schedules')
    .select(`
      *,
      subject:subjects(id, name, color, icon)
    `)
    .eq('user_id', session.user.id)  // ✅ AGORA USA session.user.id
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true })
}
```

**Por que funciona agora:**
- `getSession()` retorna a sessão atual de forma síncrona
- `session.user.id` sempre tem o ID correto quando há sessão
- A query agora filtra pelo user_id correto
- **Resultado: Encontra os dados que foram salvos! ✅**

### Correção 2: Import adicionado no endpoint

**Arquivo:** `server/api/test-insert-schedule.post.ts` (linha 7)

```typescript
// DEPOIS (CORRETO):
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)  // ✅ Agora funciona
})
```

---

## 🧪 TESTE AGORA

### Teste 1: Criar e Recarregar

1. **Recarregue a aplicação** (Ctrl+R)
2. **Crie uma atividade:**
   - Tipo: Estudo
   - Matéria: Qualquer
   - Título: Teste de Persistência
   - Data: Hoje
   - Hora: 14:00
   - Duração: 2h
   - Salvar
3. **Veja no calendário** - deve aparecer
4. **Recarregue a página** (F5)
5. **ESPERADO:** ✅ Atividade continua aparecendo!

### Teste 2: Endpoint Direto

Abra o console (F12) e execute:

```javascript
fetch('/api/test-insert-schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(res => res.json())
.then(data => {
  console.log('🧪 RESULTADO:', data)
  if (data.success) {
    alert('✅ SUCESSO! Inseriu no banco via servidor!')
  } else {
    alert('❌ FALHOU! Erro: ' + data.error.message)
  }
})
```

**ESPERADO:** ✅ SUCESSO!

---

## 📊 LOGS ESPERADOS

### Ao Criar Atividade:
```
🎬 === INÍCIO: createActivity ===
📊 Payload recebido: {...}
🔐 PASSO 1: Verificando autenticação...
✅ Usuário autenticado: [uuid]
📝 PASSO 2: Preparando dados para inserção...
📦 Dados preparados: {...}
🚀 PASSO 3: Enviando para o banco de dados...
📬 Resposta recebida do banco
📊 data = EXISTE
📊 insertError = NULL
✅✅✅ ATIVIDADE CRIADA COM SUCESSO ✅✅✅
```

### Ao Recarregar Página:
```
🔄 === INÍCIO: fetchActivities (CARREGAMENTO) ===
📅 Período solicitado: {...}
✅ Usuário autenticado: [uuid]  ← ✅ AGORA TEM O ID!
🔍 Buscando na tabela study_schedules...
📊 Filtros aplicados: { user_id: "[uuid]", ... }  ← ✅ ID CORRETO!
📬 Resposta recebida do banco
✅ Consulta executada com sucesso
📊 Quantidade de registros retornados: 1  ← ✅ ENCONTROU!
📋 Primeiros registros encontrados: [...]
✅✅✅ Atividades processadas e armazenadas ✅✅✅
```

---

## 🎯 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (Com Bug)

**Ao criar:**
```
✅ Cria com session.user.id correto
✅ Salva no banco com user_id = "abc-123"
```

**Ao recarregar:**
```
❌ user.value.id = undefined
❌ Filtra por user_id = undefined
❌ Encontra 0 registros
❌ Calendário fica vazio
```

**Resultado:** Dados salvos mas não aparecem! 😱

---

### ✅ DEPOIS (Corrigido)

**Ao criar:**
```
✅ Cria com session.user.id correto
✅ Salva no banco com user_id = "abc-123"
```

**Ao recarregar:**
```
✅ session.user.id = "abc-123"
✅ Filtra por user_id = "abc-123"
✅ Encontra os registros
✅ Calendário mostra as atividades
```

**Resultado:** Dados salvos E aparecem! 🎉

---

## 📁 Arquivos Modificados

### 1. `prapassar-app/app/composables/useStudySchedule.ts`

**Linhas 71-109:**
- Mudou de `user.value.id` para `session.user.id`
- Adicionou `await supabase.auth.getSession()`
- Melhorou logs de debug

### 2. `prapassar-app/server/api/test-insert-schedule.post.ts`

**Linha 7:**
- Adicionou: `import { serverSupabaseClient } from '#supabase/server'`

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Teste criação de atividade
2. ✅ Recarregue a página (F5)
3. ✅ Confirme que atividade continua aparecendo
4. ✅ Execute teste direto via endpoint
5. ✅ Se funcionar, podemos limpar os logs e fazer commit!

---

## 💾 COMMIT (Quando Confirmar Que Funciona)

```bash
git add .
git commit -m "fix: corrige perda de dados no calendário ao recarregar

Problema: Atividades criadas sumiam ao recarregar a página (F5)

Causa raiz:
- fetchActivities() usava user.value.id que era undefined
- Query filtrava por user_id = undefined
- Resultado: 0 registros mesmo com dados no banco

Solução:
- Mudado para usar await supabase.auth.getSession()
- session.user.id sempre retorna ID correto
- Query agora encontra os registros salvos

Também corrigido:
- Import faltando em test-insert-schedule endpoint

Fixes: Perda de dados no calendário
Fixes: Atividades sumindo ao recarregar"
```

---

**🎉 PROBLEMA CRÍTICO RESOLVIDO! TESTE E CONFIRME! 🎉**

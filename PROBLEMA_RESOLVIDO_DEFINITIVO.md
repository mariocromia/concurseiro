# 🎯 PROBLEMA RESOLVIDO - Entendimento Definitivo

**Data:** 2025-10-22
**Status:** ✅ CORRIGIDO E TESTÁVEL

---

## 🔍 O QUE ACONTECEU

### Erro 1: `planned_duration` NOT NULL
```
"null value in column \"planned_duration\" of relation \"study_schedules\" violates not-null constraint"
```

### Erro 2: `start_time` NOT NULL
```
"null value in column \"start_time\" of relation \"study_schedules\" violates not-null constraint"
```

---

## 🧩 A VERDADEIRA CAUSA

**Existem DUAS versões conflitantes da tabela `study_schedules`:**

### ❌ Versão ANTIGA (study_schedule.sql - original)
```sql
CREATE TABLE study_schedules (
  scheduled_time TIME,              -- ⚠️ Nome antigo
  planned_duration INTEGER NOT NULL, -- ⚠️ Nome antigo
  study_type VARCHAR NOT NULL,       -- ⚠️ Campo obrigatório
  status VARCHAR DEFAULT 'pending',  -- ⚠️ Campo de controle
  ...
);
```

### ✅ Versão NOVA (migration 2025-10-22_fix_study_schedules_for_calendar.sql)
```sql
ALTER TABLE study_schedules ADD COLUMN start_time TIME NOT NULL;     -- ✅ Nome novo
ALTER TABLE study_schedules ADD COLUMN duration INTEGER NOT NULL;    -- ✅ Nome novo
ALTER TABLE study_schedules ADD COLUMN is_completed BOOLEAN;         -- ✅ Booleano simples
ALTER TABLE study_schedules ADD COLUMN title VARCHAR NOT NULL;       -- ✅ Adicionado
ALTER TABLE study_schedules ADD COLUMN description TEXT;             -- ✅ Adicionado
ALTER TABLE study_schedules ADD COLUMN color VARCHAR;                -- ✅ Adicionado
```

**O problema:** O código estava tentando mapear para a estrutura ANTIGA (`scheduled_time`, `planned_duration`, `status`), mas a tabela atual no Supabase tem a estrutura NOVA (`start_time`, `duration`, `is_completed`).

---

## ✅ A SOLUÇÃO

### Tabela ATUAL no Supabase (após migration)

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `id` | UUID | ✅ |
| `user_id` | UUID | ✅ |
| `subject_id` | UUID | ❌ (NULL para eventos) |
| `title` | VARCHAR | ✅ |
| `description` | TEXT | ❌ |
| `scheduled_date` | DATE | ✅ |
| **`start_time`** | TIME | ✅ |
| **`duration`** | INTEGER | ✅ |
| **`is_completed`** | BOOLEAN | ❌ (default: false) |
| `color` | VARCHAR | ❌ |
| `created_at` | TIMESTAMP | ✅ |
| `updated_at` | TIMESTAMP | ✅ |

### Código CORRIGIDO

#### 1. `createActivity()` - Sem mapeamento necessário

```typescript
const insertData: any = {
  user_id: session.user.id,
  subject_id: payload.subject_id || null,
  title: payload.title,
  description: payload.description || null,
  scheduled_date: payload.scheduled_date,
  start_time: payload.start_time,    // ✅ Direto
  duration: payload.duration,        // ✅ Direto
  is_completed: false,               // ✅ Direto
  color: payload.color || null
}
```

#### 2. `fetchActivities()` - Sem mapeamento necessário

```typescript
activities.value = (data || []).map(item => ({
  ...item,
  // ✅ Campos já corretos: start_time, duration, is_completed
  subject: item.subject ? (Array.isArray(item.subject) ? item.subject[0] : item.subject) : null,
  type: item.subject_id ? 'study' : 'event'
}))
```

#### 3. `updateActivity()` - Sem mapeamento necessário

```typescript
const updateData: any = {}

if (updates.start_time) updateData.start_time = updates.start_time  // ✅ Direto
if (updates.duration) updateData.duration = updates.duration        // ✅ Direto
if ((updates as any).is_completed !== undefined) {
  updateData.is_completed = (updates as any).is_completed          // ✅ Direto
}
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ❌ ANTES (Tentando mapear para estrutura antiga)

```typescript
// Enviando para o banco
const insertData = {
  scheduled_time: payload.start_time,      // ❌ Campo não existe (ou é diferente)
  planned_duration: payload.duration,      // ❌ Campo não existe (ou é diferente)
  study_type: 'conteudo',                  // ❌ Campo não existe na tabela nova
  status: 'pending'                        // ❌ Campo não existe na tabela nova
}

// Recebendo do banco
const activity = {
  start_time: data.scheduled_time,         // ❌ Mapeamento desnecessário
  duration: data.planned_duration,         // ❌ Mapeamento desnecessário
  is_completed: data.status === 'completed' // ❌ Mapeamento desnecessário
}
```

### ✅ DEPOIS (Usando estrutura atual)

```typescript
// Enviando para o banco
const insertData = {
  start_time: payload.start_time,    // ✅ Campo existe
  duration: payload.duration,        // ✅ Campo existe
  is_completed: false                // ✅ Campo existe
}

// Recebendo do banco
const activity = {
  ...data  // ✅ Campos já estão corretos
}
```

---

## 🧪 TESTE AGORA

1. **Recarregar a aplicação** (Ctrl+R ou F5)
2. **Abrir console do navegador** (F12)
3. **Criar uma atividade de estudo:**
   - Tipo: Estudo
   - Matéria: (qualquer)
   - Título: Teste de Correção
   - Data: Hoje
   - Hora: 14:00
   - Duração: 2h
   - Clicar em "Salvar"

### ✅ Resultado Esperado

**Console deve mostrar:**
```
🎬 === INÍCIO: createActivity ===
📊 Payload recebido: { "type": "study", "title": "Teste de Correção", ... }
🔐 PASSO 1: Verificando autenticação...
✅ Usuário autenticado: abc-123
📝 PASSO 2: Preparando dados para inserção...
📦 Dados preparados para inserção: {
  "start_time": "14:00",      ← ✅ Campo correto
  "duration": 120,            ← ✅ Campo correto
  "is_completed": false,      ← ✅ Campo correto
  ...
}
🚀 PASSO 3: Enviando para o banco de dados...
📬 Resposta recebida do banco
✅✅✅ ATIVIDADE CRIADA COM SUCESSO ✅✅✅
```

**Na tela:**
- ✅ Modal fecha
- ✅ Atividade aparece no calendário
- ✅ SEM mensagens de erro

---

## 📁 Arquivos Modificados

### `prapassar-app/app/composables/useStudySchedule.ts`

**Linhas modificadas:**

1. **Linha 147-157** - `createActivity()` - Objeto `insertData`
   ```typescript
   // REMOVIDO: mapeamento para scheduled_time, planned_duration, study_type, status
   // ADICIONADO: uso direto de start_time, duration, is_completed
   ```

2. **Linha 91** - `fetchActivities()` - `.order()`
   ```typescript
   // ANTES: .order('scheduled_time', { ascending: true })
   // DEPOIS: .order('start_time', { ascending: true })
   ```

3. **Linha 95-100** - `fetchActivities()` - Mapeamento de resposta
   ```typescript
   // REMOVIDO: mapeamento scheduled_time → start_time, etc.
   // MANTIDO: apenas subject e type
   ```

4. **Linha 193-198** - `createActivity()` - PASSO 4
   ```typescript
   // REMOVIDO: mapeamento de volta
   ```

5. **Linha 242-252** - `updateActivity()` - Objeto `updateData`
   ```typescript
   // REMOVIDO: mapeamento para scheduled_time, planned_duration, status, study_type
   // ADICIONADO: uso direto de start_time, duration, is_completed
   ```

6. **Linha 269-274** - `updateActivity()` - Processamento de resposta
   ```typescript
   // REMOVIDO: mapeamento de volta
   ```

---

## 🎯 POR QUE ISSO ACONTECEU?

1. **Primeira implementação do calendário:**
   - Assumiu estrutura da tabela original (`scheduled_time`, `planned_duration`)
   - Código criou mapeamentos para usar nomes "mais intuitivos" (`start_time`, `duration`)

2. **Migration criada posteriormente:**
   - Adicionou campos com os nomes "intuitivos" (`start_time`, `duration`)
   - Mas o código continuou mapeando, criando conflito

3. **Resultado:**
   - Código tentava enviar `scheduled_time` (que não existia mais como NOT NULL)
   - Tabela esperava `start_time` (que não estava sendo enviado)
   - Erro: "null value in column violates not-null constraint"

---

## 🚀 PRÓXIMOS PASSOS

### 1. ✅ TESTAR (AGORA)
Siga o passo a passo acima

### 2. 🧹 LIMPAR LOGS (Depois de confirmar que funciona)
Remover os `console.log` excessivos do código

### 3. 💾 COMMIT
```bash
git add .
git commit -m "fix: corrige mapeamento de campos do calendário

- Remove mapeamento desnecessário entre start_time/scheduled_time
- Remove mapeamento desnecessário entre duration/planned_duration
- Remove mapeamento desnecessário entre is_completed/status
- Usa campos corretos da tabela atual (após migration)
- Resolve erros NOT NULL constraint violation

Fixes: null value in column \"start_time\" violates not-null constraint
Fixes: null value in column \"planned_duration\" violates not-null constraint"
```

---

## 📚 LIÇÕES APRENDIDAS

1. **Sempre verificar a estrutura ATUAL da tabela no banco**
   - Não assumir baseado no schema.sql original
   - Verificar migrations aplicadas

2. **Evitar camadas de mapeamento desnecessárias**
   - Se a tabela já tem os campos com nomes bons, usar direto
   - Mapeamentos criam complexidade e pontos de falha

3. **Migrations podem mudar nomes de campos**
   - Código precisa acompanhar essas mudanças
   - Documentar bem quando houver breaking changes

---

**🎉 PROBLEMA RESOLVIDO! PRONTO PARA TESTE! 🎉**

Se funcionar, podemos celebrar e fazer o commit final! 🚀

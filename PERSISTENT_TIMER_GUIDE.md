# Sistema de Cronômetro Persistente - Guia Completo

## Visão Geral

O sistema de cronômetro persistente permite que os estudantes iniciem uma sessão de estudo e o tempo continue contando mesmo com:
- **Navegador fechado**
- **Computador desligado**
- **Dias ou semanas sem acessar o sistema**

## Arquitetura

### Princípio Fundamental
**O servidor controla o tempo, o cliente apenas exibe.**

- ✅ Tempo calculado pelo servidor via timestamps UTC
- ✅ Cliente sincroniza periodicamente (60 segundos)
- ✅ Cálculo: `elapsed = (timestamp_atual - timestamp_inicio) + tempo_pausado`
- ❌ Cliente NÃO controla nem armazena tempo localmente

## Estrutura do Banco de Dados

### Tabela: `study_timers`

```sql
CREATE TABLE public.study_timers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID,
  study_type VARCHAR(20) CHECK (study_type IN ('conteudo', 'questoes', 'revisao')),
  planned_questions INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,  -- Timestamp de início
  end_time TIMESTAMP WITH TIME ZONE,
  is_running BOOLEAN DEFAULT true,
  elapsed_seconds INTEGER DEFAULT 0,  -- Tempo acumulado em pausas
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Constraint Importante:**
```sql
-- Apenas 1 timer ativo por usuário
CREATE UNIQUE INDEX idx_one_active_timer_per_user
  ON public.study_timers(user_id)
  WHERE is_running = true;
```

**Migração:**
- Arquivo: `/database/migrations/002_add_study_timers.sql`
- Executar no Supabase SQL Editor

## API Endpoints

### 1. POST /api/study-timer/start

**Inicia um novo timer**

**Request:**
```typescript
{
  subject_id: string    // UUID da matéria
  study_type: 'conteudo' | 'questoes' | 'revisao'
  planned_questions?: number  // Opcional, para tipo 'questoes'
  activity_name?: string
}
```

**Response (Novo Timer):**
```typescript
{
  success: true,
  alreadyExists: false,
  timer: {
    id: string
    startTime: string      // ISO 8601
    elapsedSeconds: 0
    isRunning: true
    subjectId: string
    studyType: string
  }
}
```

**Response (Timer Existente):**
```typescript
{
  success: true,
  alreadyExists: true,   // ⚠️ Já existe um timer ativo
  timer: {
    id: string
    startTime: string
    elapsedSeconds: number  // Tempo já acumulado
    isRunning: true
    subjectId: string
    studyType: string
  }
}
```

**Lógica:**
1. Verifica se já existe timer ativo (`is_running = true`)
2. Se existe, retorna dados do timer existente
3. Se não existe, cria novo timer com `start_time = NOW()`
4. Previne duplicação com constraint UNIQUE

---

### 2. GET /api/study-timer/active

**Busca timer ativo e calcula tempo decorrido**

**Request:** Nenhum body (autenticado via sessão)

**Response (Com Timer Ativo):**
```typescript
{
  hasActiveTimer: true,
  timer: {
    id: string
    startTime: string
    elapsedSeconds: number       // ⭐ Calculado no servidor
    formattedTime: string        // "HH:MM:SS"
    isRunning: true
    subjectId: string
    studyType: string
    plannedQuestions: number | null
    activityName: string | null
    subject: {
      name: string
      color: string
      icon: string
    } | null
  }
}
```

**Response (Sem Timer Ativo):**
```typescript
{
  hasActiveTimer: false,
  timer: null
}
```

**Cálculo Servidor (Código):**
```typescript
const now = new Date()
const startTime = new Date(timer.start_time)
const currentElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
const totalElapsedSeconds = (timer.elapsed_seconds || 0) + currentElapsed
```

---

### 3. POST /api/study-timer/stop

**Encerra timer, salva sessão e agenda revisões**

**Request:**
```typescript
{
  timer_id: string
  notes?: string
  completed_questions?: number
  correct_questions?: number
}
```

**Response:**
```typescript
{
  success: true,
  timer: {
    id: string
    totalSeconds: number         // Duração total
    totalFormatted: string       // "HH:MM:SS"
    startedAt: string
    endedAt: string
  }
}
```

**Ações Executadas:**
1. **Calcula tempo total:**
   ```typescript
   const totalSeconds = (timer.elapsed_seconds || 0) + currentElapsed
   ```

2. **Salva em `study_sessions`:**
   - Registra sessão completa com duração

3. **Salva em `study_schedules`:**
   - Adiciona no calendário com status 'completed'

4. **Agenda revisões R1-R7:**
   ```typescript
   const dayOffsets = [1, 7, 14, 30, 60, 120, 240]  // dias após estudo
   ```

5. **Atualiza `subjects.total_study_time`:**
   - Soma tempo estudado ao total da matéria

6. **Deleta registro do timer:**
   - Remove de `study_timers` (cleanup)

---

## Frontend - Composable `useStudyTimer.ts`

### Estrutura do Estado

```typescript
interface TimerState {
  id: string | null
  isRunning: boolean
  displaySeconds: number  // ⚠️ Apenas para exibição, não é fonte de verdade
  subjectId: string | null
  subjectName: string | null
  subjectColor: string | null
  subjectIcon: string | null
  studyType: 'conteudo' | 'questoes' | 'revisao'
  plannedQuestions: number | null
  startedAt: Date | null
}
```

### Intervalos

**1. Display Interval (1 segundo):**
```typescript
// Incrementa contador visual a cada segundo
setInterval(() => {
  timer.value.displaySeconds++
}, 1000)
```

**2. Sync Interval (60 segundos):**
```typescript
// Sincroniza com servidor a cada 1 minuto
setInterval(async () => {
  await fetchCurrentTimer()  // GET /api/study-timer/active
}, 60000)
```

**Por que 2 intervalos?**
- **Display (1s):** UX responsiva, timer fluido na UI
- **Sync (60s):** Reduz carga no servidor, previne drift

### Funções Principais

#### `startTimer(subjectId, studyType, plannedQuestions)`
```typescript
const startTimer = async (subjectId, studyType, plannedQuestions) => {
  // 1. Chama API POST /api/study-timer/start
  const response = await $fetch('/api/study-timer/start', {
    method: 'POST',
    body: { subject_id, study_type, planned_questions }
  })

  // 2. Atualiza estado local
  timer.value.id = response.timer.id
  timer.value.isRunning = true
  timer.value.displaySeconds = response.timer.elapsedSeconds

  // 3. Inicia intervalos
  startDisplayInterval()  // Incremento visual 1s
  startSyncInterval()     // Sync servidor 60s
}
```

#### `restoreTimer()`
```typescript
const restoreTimer = async () => {
  // 1. Busca timer ativo do servidor
  const hasTimer = await fetchCurrentTimer()

  // 2. Se existe, inicia sincronização
  if (hasTimer) {
    startSyncInterval()
  }
}
```

#### `stopTimer(completionData)`
```typescript
const stopTimer = async (completionData) => {
  // 1. Para intervalos imediatamente
  stopDisplayInterval()
  stopSyncInterval()

  // 2. Chama API POST /api/study-timer/stop
  const response = await $fetch('/api/study-timer/stop', {
    method: 'POST',
    body: {
      timer_id: timer.value.id,
      notes: completionData?.notes,
      completed_questions: completionData?.completedQuestions,
      correct_questions: completionData?.correctQuestions
    }
  })

  // 3. Reseta estado local
  timer.value = {  /* estado vazio */ }

  return {
    duration: response.timer.totalSeconds,
    formatted: response.timer.totalFormatted
  }
}
```

---

## Integração na Página `/estudo`

### No `onMounted`:

```vue
<script setup lang="ts">
const { timer, formattedTime, startTimer, stopTimer, restoreTimer } = useStudyTimer()

onMounted(async () => {
  // ⭐ Restaura timer se existir
  await restoreTimer()

  // Carregar matérias...
})
</script>
```

### No Template:

```vue
<template>
  <!-- Display do Tempo -->
  <div class="text-8xl font-mono">
    {{ formattedTime }}  <!-- Computed: HH:MM:SS -->
  </div>

  <!-- Botão Iniciar -->
  <button v-if="!timer.isRunning" @click="start()">
    Iniciar Sessão
  </button>

  <!-- Botão Encerrar -->
  <button v-if="timer.isRunning" @click="stop()">
    Encerrar
  </button>
</template>
```

---

## Fluxo Completo de Uso

### Cenário 1: Início Normal

1. **Usuário** clica "Iniciar Sessão"
2. **Cliente** chama `startTimer(subjectId, 'conteudo')`
3. **API** POST `/api/study-timer/start`:
   - Cria registro em `study_timers`
   - `start_time = 2025-10-18T10:30:00Z`
   - `is_running = true`
4. **Cliente**:
   - Inicia display interval (1s)
   - Inicia sync interval (60s)
   - Timer começa a contar visualmente

### Cenário 2: Fechamento do Navegador

1. **Usuário** fecha navegador (timer rodando)
2. **Servidor** mantém registro em `study_timers`
3. **Nada muda no banco** - `start_time` permanece
4. **Horas/dias depois** usuário reabre aplicação
5. **`onMounted`** chama `restoreTimer()`
6. **API** GET `/api/study-timer/active`:
   - Calcula: `now (2025-10-18T14:45:00Z) - start_time (10:30:00Z) = 15,300 segundos`
   - Retorna `elapsedSeconds: 15300` (4h 15min)
7. **Cliente** exibe tempo correto acumulado

### Cenário 3: PC Desligado

1. **Usuário** inicia timer às 10:30
2. **PC desliga** (sem encerrar timer)
3. **Servidor** continua com registro:
   ```sql
   {
     id: '123',
     start_time: '2025-10-18T10:30:00Z',
     is_running: true
   }
   ```
4. **3 dias depois (21/10)** usuário liga PC
5. **Abre aplicação** → `restoreTimer()` é chamado
6. **Servidor calcula**:
   ```
   now = 2025-10-21T08:15:00Z
   start = 2025-10-18T10:30:00Z
   elapsed = 253,500 segundos (70h 25min)
   ```
7. **Timer mostra** 70:25:00 corretamente

### Cenário 4: Múltiplos Dispositivos

1. **Dispositivo A** inicia timer
2. **Dispositivo B** abre aplicação
3. **GET /active** retorna timer ativo
4. **Ambos sincronizam** a cada 60s
5. **Encerrar em qualquer dispositivo** para timer em todos

---

## Segurança

### RLS (Row Level Security)

```sql
-- Usuários só veem seus próprios timers
CREATE POLICY "Usuários podem ver seus próprios timers"
  ON public.study_timers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios timers"
  ON public.study_timers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios timers"
  ON public.study_timers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios timers"
  ON public.study_timers FOR DELETE
  USING (auth.uid() = user_id);
```

### Validações API

```typescript
// 1. Autenticação obrigatória
const user = await serverSupabaseUser(event)
if (!user) {
  throw createError({ statusCode: 401 })
}

// 2. Validar timer pertence ao usuário
const { data: timer } = await supabase
  .from('study_timers')
  .select('*')
  .eq('id', timer_id)
  .eq('user_id', user.id)  // ⭐ Importante!
  .single()

// 3. Validar inputs
if (!['conteudo', 'questoes', 'revisao'].includes(study_type)) {
  throw createError({ statusCode: 400 })
}
```

---

## Testes Obrigatórios

### ✅ Teste 1: Refresh do Navegador
1. Iniciar timer
2. Aguardar 1 minuto
3. Pressionar F5 (refresh)
4. **Esperado:** Timer continua do tempo correto

### ✅ Teste 2: Fechar/Reabrir Navegador
1. Iniciar timer
2. Fechar navegador completamente
3. Aguardar 5 minutos
4. Reabrir navegador e acessar /estudo
5. **Esperado:** Timer mostra 5+ minutos

### ✅ Teste 3: Desligar PC
1. Iniciar timer
2. Desligar computador
3. Aguardar horas/dia
4. Ligar PC e acessar aplicação
5. **Esperado:** Timer mostra tempo total acumulado

### ✅ Teste 4: Múltiplos Dispositivos
1. Iniciar timer no PC
2. Abrir aplicação no celular
3. **Esperado:** Timer sincronizado em ambos

### ✅ Teste 5: Encerrar Timer
1. Timer rodando por 30 minutos
2. Clicar "Encerrar"
3. **Esperado:**
   - Salvo em `study_sessions`
   - Salvo em `study_schedules`
   - R1-R7 agendadas em `revisions`
   - `subjects.total_study_time` atualizado
   - Timer deletado de `study_timers`

### ✅ Teste 6: Timer Órfão (Edge Case)
1. Criar timer manualmente no banco há 1 semana
2. Acessar aplicação
3. **Esperado:** Timer mostra tempo correto (7 dias)

### ✅ Teste 7: Prevenir Duplicação
1. Tentar iniciar novo timer
2. **Esperado:** API retorna timer existente com `alreadyExists: true`

---

## Performance

### Otimizações Implementadas

**1. Índices de Banco:**
```sql
CREATE INDEX idx_study_timers_user_running
  ON study_timers(user_id, is_running)
  WHERE is_running = true;
```

**2. Sincronização Inteligente:**
- Display: 1s (local, leve)
- Sync: 60s (servidor, otimizado)
- Reduz requisições em 98.3%

**3. Cálculo Servidor:**
- Tempo calculado apenas quando requisitado
- Sem overhead de armazenamento contínuo

**4. Cleanup Automático:**
- Timer deletado ao encerrar
- Não acumula registros inativos

---

## Troubleshooting

### Problema: Timer não restaura após refresh

**Diagnóstico:**
```typescript
// Verificar se restoreTimer() está sendo chamado
onMounted(async () => {
  console.log('Chamando restoreTimer...')
  await restoreTimer()
})
```

**Verificar no banco:**
```sql
SELECT * FROM study_timers
WHERE user_id = 'xxx'
  AND is_running = true;
```

---

### Problema: Tempo dessincronizado entre cliente e servidor

**Causa:** Clock drift do cliente

**Solução:** Sistema já usa sync interval de 60s

**Forçar sync manual:**
```typescript
await fetchCurrentTimer()  // Atualiza do servidor
```

---

### Problema: Múltiplos timers ativos

**Diagnóstico:**
```sql
SELECT COUNT(*) FROM study_timers
WHERE user_id = 'xxx'
  AND is_running = true;
-- Deve retornar 0 ou 1
```

**Fix:**
```sql
-- Deletar duplicatas (manter mais recente)
DELETE FROM study_timers
WHERE id NOT IN (
  SELECT id FROM study_timers
  WHERE user_id = 'xxx'
    AND is_running = true
  ORDER BY created_at DESC
  LIMIT 1
);
```

---

##Checklist de Implementação

- [x] Tabela `study_timers` criada
- [x] Índices e constraints configurados
- [x] RLS policies habilitadas
- [x] POST /api/study-timer/start implementado
- [x] GET /api/study-timer/active implementado
- [x] POST /api/study-timer/stop implementado
- [x] Composable `useStudyTimer.ts` reescrito
- [x] Página `/estudo` integrada com `restoreTimer()`
- [ ] Migration executada no Supabase
- [ ] Testes de persistência executados
- [ ] Testes de múltiplos dispositivos
- [ ] Monitoramento de performance configurado

---

**Criado em:** 2025-10-18
**Versão:** 1.0
**Stack:** Nuxt 4 + Supabase + PostgreSQL

# ✅ INSTRUÇÕES: Armazenar Tempo de Questões e Revisões nos Relatórios

## Problema Identificado

Os relatórios não estavam armazenando/exibindo tempo de questões e revisões porque:

1. ❌ A tabela `study_sessions` **não tinha** a coluna `study_type`
2. ❌ O endpoint `/api/study-timer/stop` **não salvava** `study_type` em `study_sessions`
3. ❌ O composable `useReports.ts` **não processava** os tipos de estudo

## Solução Implementada

### 1️⃣ Adicionar Coluna `study_type` no Banco de Dados

**Execute este SQL no Supabase SQL Editor:**

```bash
# Abra o arquivo no Supabase SQL Editor:
c:\prapassar\ADD_STUDY_TYPE_COLUMN.sql
```

Este script adiciona 3 colunas na tabela `study_sessions`:
- ✅ `study_type` (VARCHAR: 'conteudo' | 'questoes' | 'revisao')
- ✅ `completed_questions` (INTEGER)
- ✅ `correct_questions` (INTEGER)

**Verificação:**
```sql
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'study_sessions'
AND column_name IN ('study_type', 'completed_questions', 'correct_questions')
ORDER BY column_name;
```

### 2️⃣ Atualizar Endpoint de Parar Timer

**Arquivo modificado:**
- [server/api/study-timer/stop.post.ts](prapassar-app/server/api/study-timer/stop.post.ts)

**Mudanças:**
```diff
  // Save to study_sessions
  const { error: sessionError } = await supabase
    .from('study_sessions')
    .insert({
      user_id: user.id,
      subject_id: timer.subject_id,
      started_at: timer.start_time,
      ended_at: now.toISOString(),
      duration: totalSeconds,
      notes: notes || null,
+     study_type: timer.study_type || 'conteudo',
+     completed_questions: completed_questions || 0,
+     correct_questions: correct_questions || 0,
    })
```

### 3️⃣ Atualizar Composable de Relatórios

**Arquivo modificado:**
- [app/composables/useReports.ts](prapassar-app/app/composables/useReports.ts)

**Mudanças:**

1. **Processar tipos de estudo nas sessões:**
```typescript
// ✅ NOVO: Processar tipos de estudo e questões
const studyType = session.study_type || 'conteudo'
if (studyType === 'conteudo') {
  typeMinutes.conteudo += minutes
  typeSessions.conteudo++
} else if (studyType === 'questoes') {
  typeMinutes.questoes += minutes
  typeSessions.questoes++
  // Contar questões da sessão
  if (session.completed_questions) {
    totalQuestions += session.completed_questions
    totalCorrect += session.correct_questions || 0
  }
} else if (studyType === 'revisao') {
  typeMinutes.revisao += minutes
  typeSessions.revisao++
}
```

2. **Retornar dados reais ao invés de zeros:**
```diff
  studyTypes: {
-   conteudo: totalMinutes,
-   conteudoSessions: sessions?.length || 0,
-   questoes: 0,
-   questoesSessions: 0,
-   revisao: 0,
-   revisaoSessions: 0
+   conteudo: typeMinutes.conteudo,
+   conteudoSessions: typeSessions.conteudo,
+   questoes: typeMinutes.questoes,
+   questoesSessions: typeSessions.questoes,
+   revisao: typeMinutes.revisao,
+   revisaoSessions: typeSessions.revisao
  }
```

## Como Testar

### 1️⃣ Executar SQL no Supabase

```bash
# Abra o Supabase SQL Editor
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

# Cole e execute o conteúdo de:
c:\prapassar\ADD_STUDY_TYPE_COLUMN.sql
```

### 2️⃣ Reiniciar Servidor de Desenvolvimento

```bash
cd prapassar-app
pkill -f "npm run dev"
npm run dev
```

### 3️⃣ Testar Timer com Questões

1. Acesse http://localhost:3000/study
2. Selecione uma matéria
3. **IMPORTANTE:** Selecione "Questões" no tipo de estudo
4. Digite quantas questões você planeja resolver (ex: 10)
5. Inicie o timer
6. Após alguns segundos, pare o timer
7. No modal de parar timer:
   - Digite quantas questões você fez (ex: 8)
   - Digite quantas acertou (ex: 6)
   - Clique em "Salvar e Parar"

### 4️⃣ Verificar nos Relatórios

1. Acesse http://localhost:3000/reports
2. Verifique a seção **"Tipos de Estudo"** na parte inferior:
   - ✅ **Questões** deve mostrar tempo > 0
   - ✅ **Questões** deve mostrar sessões > 0
3. Verifique **"Total de Questões"** no card superior:
   - ✅ Deve mostrar o total de questões feitas (8 no exemplo)
4. Verifique **"Taxa de Acerto"**:
   - ✅ Deve calcular a porcentagem (75% no exemplo: 6/8)

### 5️⃣ Verificar no Banco de Dados

```sql
-- Ver sessão mais recente
SELECT
  id,
  subject_id,
  study_type,
  duration,
  completed_questions,
  correct_questions,
  started_at,
  ended_at
FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 5;

-- Ver estatísticas por tipo de estudo
SELECT
  study_type,
  COUNT(*) as total_sessions,
  SUM(duration) as total_seconds,
  ROUND(SUM(duration)::numeric / 60, 2) as total_minutes,
  SUM(completed_questions) as total_questions,
  SUM(correct_questions) as total_correct
FROM public.study_sessions
WHERE user_id = auth.uid()
GROUP BY study_type
ORDER BY study_type;
```

## Compatibilidade com Dados Antigos

- ✅ **Sessões antigas**: Receberão `study_type = 'conteudo'` por padrão (via DEFAULT no SQL)
- ✅ **Questões antigas**: Terão `completed_questions = 0` e `correct_questions = 0`
- ✅ **Relatórios**: Continuarão funcionando normalmente

## Arquivos Modificados

1. ✅ [server/api/study-timer/stop.post.ts](prapassar-app/server/api/study-timer/stop.post.ts) - Salvar study_type
2. ✅ [app/composables/useReports.ts](prapassar-app/app/composables/useReports.ts) - Processar tipos de estudo
3. ✅ [ADD_STUDY_TYPE_COLUMN.sql](../ADD_STUDY_TYPE_COLUMN.sql) - Script SQL para adicionar colunas

## Próximos Passos (Opcional)

### Melhorias Futuras

1. **Filtrar relatórios por tipo de estudo:**
   - Adicionar dropdown "Conteúdo | Questões | Revisão" ao lado do filtro de matéria
   - Mostrar estatísticas específicas por tipo

2. **Gráficos separados:**
   - Gráfico de evolução de questões ao longo do tempo
   - Gráfico de taxa de acerto por matéria

3. **Exportar CSV detalhado:**
   - Incluir tipos de estudo no CSV
   - Separar tempo de questões/revisões

## Troubleshooting

### "Erro ao salvar sessão"
- ✅ Verifique se executou o SQL no Supabase
- ✅ Verifique se reiniciou o servidor (`npm run dev`)

### "Tipos de estudo sempre 0"
- ✅ Certifique-se de selecionar o tipo ao iniciar o timer
- ✅ Verifique se `study_type` está sendo salvo no banco
- ✅ Confirme que o composable está processando corretamente

### "Total de questões não aumenta"
- ✅ Verifique se preencheu os campos ao parar o timer:
  - Quantas questões você fez?
  - Quantas acertou?
- ✅ Confirme que `study_type = 'questoes'` na sessão

---

**Data:** 2025-10-20
**Implementação:** Claude Code
**Status:** ✅ Pronto para Teste

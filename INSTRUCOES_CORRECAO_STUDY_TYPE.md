# 🔧 Instruções: Correção do Study Type

**Data:** 2025-10-20
**Problema:** Relatórios não exibem tempo de questões e revisão separadamente
**Causa Raiz:** Coluna `study_type` inexistente na tabela `study_sessions`
**Status:** ✅ Código corrigido | ⏳ Aguardando migration no banco

---

## 📋 Resumo Executivo

### Problema Identificado
- ❌ Todos os tempos de estudo sendo registrados como "conteúdo"
- ❌ Não há diferenciação entre tempo de conteúdo, questões e revisão
- ❌ Relatórios não exibem tempo de questões e revisão

### Solução Implementada
1. ✅ Migration SQL criada: `2025-10-20_add_study_type_column.sql`
2. ✅ Composable `useStudyTimer.ts` atualizado para salvar `study_type`
3. ✅ Página `study.vue` atualizada para capturar tipo de estudo
4. ✅ Composable `useReports.ts` atualizado para separar tempo por tipo
5. ✅ Exportação CSV atualizada para incluir tipos de estudo

---

## 🚀 Passo a Passo para Aplicar a Correção

### 1️⃣ Executar Migration no Supabase (OBRIGATÓRIO)

**Acesse:** [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)

**Execute o seguinte SQL:**

```sql
-- ============================================
-- Migration: Adicionar colunas study_type e planned_questions
-- Data: 2025-10-20
-- ============================================

-- Adicionar coluna study_type
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS study_type TEXT DEFAULT 'conteudo' CHECK (study_type IN ('conteudo', 'questoes', 'revisao'));

-- Adicionar coluna planned_questions
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS planned_questions INTEGER;

-- Adicionar comentários
COMMENT ON COLUMN public.study_sessions.study_type IS 'Tipo de estudo: conteudo (padrão), questoes ou revisao';
COMMENT ON COLUMN public.study_sessions.planned_questions IS 'Quantidade planejada de questões quando study_type = questoes';

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_study_type ON public.study_sessions(study_type);
```

**Resultado esperado:**
```
✅ ALTER TABLE
✅ ALTER TABLE
✅ COMMENT
✅ COMMENT
✅ CREATE INDEX
```

---

### 2️⃣ Verificar Estrutura da Tabela

**Execute para confirmar:**

```sql
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'study_sessions'
ORDER BY ordinal_position;
```

**Você deve ver:**
- ✅ `study_type` | `text` | `'conteudo'::text` | `YES`
- ✅ `planned_questions` | `integer` | `NULL` | `YES`

---

### 3️⃣ Testar o Fluxo Completo

#### A. Iniciar uma Sessão de Estudo

1. Acesse `/study` no navegador
2. Selecione uma matéria
3. Clique em "Iniciar Sessão"
4. **IMPORTANTE:** Escolha um tipo de estudo:
   - 📖 **Conteúdo** - Estudar material teórico
   - 📝 **Questões** - Resolver questões (pode informar quantidade)
   - 🔄 **Revisão** - Revisar conteúdo já estudado
5. Clique em "Iniciar"

#### B. Encerrar a Sessão

1. Deixe o timer rodar por alguns minutos
2. Clique em "Encerrar"
3. Confirme e salve a sessão

#### C. Verificar no Banco de Dados

```sql
SELECT
  id,
  subject_id,
  study_type,
  planned_questions,
  duration,
  started_at,
  ended_at
FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 5;
```

**Resultado esperado:**
```
study_type: "questoes" (ou "conteudo", "revisao")
planned_questions: 50 (se for questões)
duration: 300 (em segundos)
```

#### D. Verificar nos Relatórios

1. Acesse `/reports` no navegador
2. Verifique a seção **"Tempo por Tipo de Estudo"** (se existir)
3. Exporte para CSV e confirme que há a seção:
   ```
   Tempo por Tipo de Estudo
   Tipo,Tempo (minutos),Sessões
   Conteúdo,45,3
   Questões,30,2
   Revisão,15,1
   ```

---

## 📊 Estrutura de Dados

### Tabela `study_sessions` (Atualizada)

```typescript
interface StudySession {
  id: string                    // UUID
  user_id: string               // UUID (FK → users)
  subject_id: string | null     // UUID (FK → subjects)
  started_at: string            // ISO timestamp
  ended_at: string | null       // ISO timestamp
  duration: number | null       // Segundos
  notes: string | null          // Text
  study_type: 'conteudo' | 'questoes' | 'revisao'  // ⭐ NOVO
  planned_questions: number | null                  // ⭐ NOVO
  created_at: string            // ISO timestamp
}
```

### Fluxo de Dados

```
study.vue (escolhe tipo)
  ↓
startTimer(subjectId, studyType, plannedQuestions)
  ↓
useStudyTimer.ts (armazena no estado global)
  ↓
stopTimer() → INSERT INTO study_sessions
  ↓
{
  study_type: 'questoes',
  planned_questions: 50,
  duration: 1800
}
  ↓
useReports.ts (agrupa por tipo)
  ↓
{
  studyTypes: {
    conteudo: 120,        // minutos
    conteudoSessions: 5,  // sessões
    questoes: 90,
    questoesSessions: 3,
    revisao: 30,
    revisaoSessions: 1
  }
}
```

---

## 🧪 Scripts de Teste

### Teste 1: Inserir Sessão Manualmente

```sql
-- Obter seu user_id
SELECT id, email FROM auth.users LIMIT 1;

-- Obter um subject_id
SELECT id, name FROM public.subjects LIMIT 1;

-- Inserir sessão de teste (QUESTÕES)
INSERT INTO public.study_sessions (
  user_id,
  subject_id,
  started_at,
  ended_at,
  duration,
  study_type,
  planned_questions,
  notes
) VALUES (
  'SEU_USER_ID_AQUI',  -- Substituir
  'SEU_SUBJECT_ID_AQUI',  -- Substituir
  NOW() - INTERVAL '30 minutes',
  NOW(),
  1800,  -- 30 minutos em segundos
  'questoes',
  50,
  'Teste de questões'
);

-- Verificar
SELECT * FROM public.study_sessions ORDER BY created_at DESC LIMIT 1;
```

### Teste 2: Consultar por Tipo

```sql
-- Contar sessões por tipo
SELECT
  study_type,
  COUNT(*) as total_sessions,
  SUM(duration) / 60 as total_minutes
FROM public.study_sessions
WHERE user_id = 'SEU_USER_ID_AQUI'
GROUP BY study_type;
```

**Resultado esperado:**
```
study_type  | total_sessions | total_minutes
------------|----------------|---------------
conteudo    | 5              | 150
questoes    | 3              | 90
revisao     | 1              | 30
```

---

## 🐛 Troubleshooting

### Erro: "column study_type does not exist"

**Causa:** Migration não foi executada no banco.

**Solução:**
1. Execute a migration SQL no Supabase (Passo 1️⃣)
2. Verifique se a coluna existe (Passo 2️⃣)

---

### Erro: "new row violates check constraint"

**Causa:** Tentou inserir um `study_type` inválido.

**Valores permitidos:**
- ✅ `'conteudo'`
- ✅ `'questoes'`
- ✅ `'revisao'`
- ❌ `'outros'` (inválido)

**Solução:**
```sql
-- Ver constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%study_type%';
```

---

### Todos os tipos aparecem como "conteudo"

**Causa:** Sessões antigas não tinham `study_type`.

**Solução:** Isso é esperado. O valor padrão é `'conteudo'`.

Para atualizar manualmente sessões antigas (OPCIONAL):
```sql
-- Atualizar sessões sem tipo definido
UPDATE public.study_sessions
SET study_type = 'conteudo'
WHERE study_type IS NULL;
```

---

### Relatórios não exibem os tipos

**Causas possíveis:**

1. **Cache do navegador:**
   - Limpe cache (Ctrl+Shift+R)
   - Feche e abra o navegador

2. **Código não deployado:**
   ```bash
   cd prapassar-app
   npm run dev
   ```

3. **Verificar console do navegador:**
   - Abra DevTools (F12)
   - Procure por erros na aba Console

4. **Verificar query:**
   ```sql
   SELECT study_type, COUNT(*)
   FROM public.study_sessions
   WHERE user_id = 'SEU_USER_ID'
   GROUP BY study_type;
   ```

---

## 📝 Logs de Desenvolvimento

### Arquivos Modificados

```
✅ database/migrations/2025-10-20_add_study_type_column.sql (NOVO)
✅ prapassar-app/app/composables/useStudyTimer.ts (MODIFICADO)
✅ prapassar-app/app/pages/study.vue (MODIFICADO)
✅ prapassar-app/app/composables/useReports.ts (MODIFICADO)
✅ INSTRUCOES_CORRECAO_STUDY_TYPE.md (NOVO - este arquivo)
```

### Commits Planejados

```bash
git add database/migrations/2025-10-20_add_study_type_column.sql
git add prapassar-app/app/composables/useStudyTimer.ts
git add prapassar-app/app/pages/study.vue
git add prapassar-app/app/composables/useReports.ts
git add INSTRUCOES_CORRECAO_STUDY_TYPE.md

git commit -m "feat: adiciona diferenciação de tipos de estudo (conteúdo/questões/revisão)

- Adiciona coluna study_type e planned_questions em study_sessions
- Atualiza useStudyTimer.ts para salvar tipo de estudo
- Atualiza study.vue para capturar tipo ao iniciar sessão
- Atualiza useReports.ts para separar tempo por tipo
- Adiciona seção 'Tempo por Tipo de Estudo' no CSV de exportação

Fixes: Relatórios não exibindo tempo de questões e revisão separadamente

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## ✅ Checklist Final

Antes de considerar a correção completa:

- [ ] Migration SQL executada no Supabase
- [ ] Coluna `study_type` existe na tabela `study_sessions`
- [ ] Coluna `planned_questions` existe na tabela `study_sessions`
- [ ] Código atualizado localmente (`npm run dev`)
- [ ] Teste: Iniciar sessão de CONTEÚDO
- [ ] Teste: Iniciar sessão de QUESTÕES (com quantidade)
- [ ] Teste: Iniciar sessão de REVISÃO
- [ ] Verificar no banco: 3 registros com `study_type` diferentes
- [ ] Acessar `/reports` e verificar dados
- [ ] Exportar CSV e verificar seção "Tempo por Tipo de Estudo"
- [ ] Commit e push das alterações

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs do navegador:** Console do DevTools (F12)
2. **Verificar logs do servidor:** Terminal onde roda `npm run dev`
3. **Verificar dados no banco:** Executar queries SQL de teste acima
4. **Verificar arquivos:** Conferir se todas as edições foram salvas

---

**Status:** 🟢 Pronto para aplicação
**Próximo Passo:** Executar migration no Supabase (Passo 1️⃣)
**Documentação Atualizada:** 2025-10-20T16:30:00-0300

🤖 Generated with [Claude Code](https://claude.com/claude-code)

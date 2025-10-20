# 📌 Sessão de Continuação - Relatórios PraPassar

**Data da sessão anterior**: 2025-10-19
**Status**: ✅ Problema principal RESOLVIDO (parcialmente)

---

## ✅ O Que Foi Resolvido

### Problema Principal: Relatórios não exibindo dados

**Causa raiz identificada**: `useSupabaseUser()` retornava `user.value.id = undefined` em algumas situações de carregamento do Nuxt.

**Solução aplicada**: Substituído `useSupabaseUser()` por `supabase.auth.getSession()` para obter o `user_id` de forma confiável.

**Arquivos modificados**:
1. ✅ `prapassar-app/app/composables/useReports.ts` (linhas 107-109)
2. ✅ `prapassar-app/app/pages/test-reports-simple.vue` (linhas 15-17)

**Resultado**:
- ✅ Sessões de estudo agora aparecem nos relatórios
- ✅ Tempo total sendo contabilizado corretamente
- ✅ Gráficos de evolução diária funcionando

---

## ⚠️ Problema Pendente

### Questões respondidas não estão sendo contabilizadas

**Sintoma**: A seção "Desempenho em Questões" não mostra dados, mesmo que o usuário tenha respondido questões.

**Possíveis causas**:
1. Não há tentativas de questões no banco (`question_attempts` vazio)
2. A query está buscando na tabela/estrutura errada
3. RLS bloqueando acesso às tentativas de questões

**Status**: Aguardando verificação no banco de dados

---

## 🎯 Próximos Passos (Para Amanhã)

### 1. Verificar se há questões no banco

Execute no **Supabase SQL Editor**:

```sql
-- Verificar tentativas de questões do usuário
SELECT
  'questions' as tabela,
  COUNT(*) as total
FROM public.questions
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid

UNION ALL

SELECT
  'question_attempts' as tabela,
  COUNT(*) as total
FROM public.question_attempts
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid;
```

**Ação baseada no resultado**:

- **Se ambos retornarem 0**: Não há questões. Precisa criar questões de teste ou usar a funcionalidade do app para responder questões.

- **Se `questions > 0` mas `question_attempts = 0`**: Usuário tem questões mas nunca respondeu. Use a funcionalidade do app para responder algumas.

- **Se `question_attempts > 0`**: Há tentativas no banco, mas a query do relatório não está pegando. Investigar a query em `useReports.ts`.

---

### 2. Criar dados de teste (se necessário)

Se não houver questões, execute:

```sql
-- Primeiro, pegar IDs das matérias
SELECT id, name FROM public.subjects
WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
LIMIT 3;
```

**Anote os IDs das matérias**, depois:

```sql
-- Criar questões de teste (SUBSTITUA 'ID_MATERIA' pelos IDs reais)
INSERT INTO public.questions (user_id, subject_id, question_text, answer_text, difficulty)
VALUES
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_MATERIA_1'::uuid, 'Qual é a capital do Brasil?', 'Brasília', 'easy'),
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_MATERIA_2'::uuid, 'Quanto é 2 + 2?', '4', 'easy'),
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_MATERIA_1'::uuid, 'Quem descobriu o Brasil?', 'Pedro Álvares Cabral', 'medium')
RETURNING id, question_text;
```

**Anote os IDs das questões retornadas**, depois:

```sql
-- Criar tentativas de resposta (SUBSTITUA os IDs)
INSERT INTO public.question_attempts (user_id, question_id, is_correct, created_at)
VALUES
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_QUESTAO_1'::uuid, true, NOW() - INTERVAL '3 days'),
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_QUESTAO_2'::uuid, true, NOW() - INTERVAL '2 days'),
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_QUESTAO_3'::uuid, false, NOW() - INTERVAL '2 days'),
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_QUESTAO_1'::uuid, true, NOW() - INTERVAL '1 day'),
  ('0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid, 'ID_QUESTAO_2'::uuid, false, NOW());
```

Depois acesse `/reports` e veja se as questões aparecem.

---

### 3. Investigar query do relatório (se dados existirem)

Se houver tentativas no banco mas não aparecerem no relatório, verificar:

**Arquivo**: `prapassar-app/app/composables/useReports.ts` (linhas 142-157)

**Query atual**:
```typescript
const { data: questionAttempts, error: questionsError } = await supabase
  .from('question_attempts')
  .select(`
    *,
    questions(subject_id, subjects(name, color))
  `)
  .eq('user_id', userId)
  .gte('created_at', startDate)
  .lte('created_at', endDate)
```

**Verificar**:
1. Se a tabela `question_attempts` existe
2. Se o relacionamento `questions -> subjects` está correto
3. Se há erro no log (variável `questionsError`)

**Testar query diretamente no Supabase**:
```sql
SELECT qa.*, q.subject_id, s.name, s.color
FROM public.question_attempts qa
LEFT JOIN public.questions q ON qa.question_id = q.id
LEFT JOIN public.subjects s ON q.subject_id = s.id
WHERE qa.user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid
ORDER BY qa.created_at DESC
LIMIT 10;
```

Se retornar dados, mas a query do código falhar, pode ser problema de RLS ou estrutura da query Supabase.

---

## 📂 Arquivos Importantes

### Criados/Modificados Nesta Sessão

1. **`prapassar-app/app/composables/useReports.ts`**
   - Correção: Linha 107-109 (usar `getSession()` ao invés de `user.value.id`)

2. **`prapassar-app/app/pages/test-reports-simple.vue`**
   - Correção: Linha 15-17 (usar `getSession()`)
   - Logs de debug detalhados

3. **`prapassar-app/app/pages/test-user-debug.vue`** (NOVO)
   - Página de debug de autenticação
   - Testa 4 métodos diferentes de obter user_id
   - URL: http://localhost:3001/test-user-debug

### Documentação Criada

1. **`VERIFICAR_DADOS_BANCO.md`** - Guia de queries SQL para debug
2. **`TESTE_TIMER_SALVANDO.md`** - Como testar se timer salva sessões
3. **`DIAGNOSTICO_RELATORIOS_FINAL.md`** - Diagnóstico completo do problema
4. **`TESTE_RAPIDO_RELATORIOS.md`** - Guia rápido de teste

---

## 🔑 Informações Importantes

### Usuário do Sistema
- **Email**: `netsacolas@gmail.com` (UM "s" apenas)
- **User ID**: `0b17dba0-7c78-4c43-a2cf-f6d890f8d329`
- **Criado em**: 2025-10-02

### Banco de Dados
- **Projeto Supabase**: https://ubeivchkuoptmhkcglny.supabase.co
- **Tabelas principais**:
  - `study_sessions` - Sessões de estudo (FUNCIONANDO ✅)
  - `question_attempts` - Tentativas de questões (PENDENTE ⏳)
  - `questions` - Banco de questões
  - `subjects` - Matérias de estudo

### RLS (Row Level Security)
- ✅ `study_sessions`: RLS desabilitado temporariamente (para debug)
- ⚠️ `question_attempts`: Verificar se RLS está bloqueando

---

## 🧪 Como Testar

### 1. Verificar se relatórios de tempo funcionam

```bash
# Acessar no navegador
http://localhost:3001/reports
```

**Esperado**:
- ✅ Cards com "Tempo Total", "Média Diária"
- ✅ Gráfico de evolução diária
- ✅ Lista de matérias com tempo por matéria

### 2. Verificar se questões aparecem

**Na página `/reports`**, procurar pela seção:
- "Desempenho em Questões por Matéria"
- "Total de Questões" (nos cards do topo)
- "Taxa de Acerto"

**Se não aparecer**: Executar as queries do passo 1 acima.

---

## 🐛 Outros Erros Conhecidos (Não Relacionados)

Durante a sessão, foram identificados outros erros no console (NÃO afetam os relatórios):

1. ❌ **404**: `api/affiliates/stats:1` - Endpoint não implementado
2. ⚠️ **Hydration mismatch** - Problema de SSR do Nuxt (não crítico)
3. ❌ **Extension errors** - Erros de extensões do navegador (ignorar)

**Ação**: Podem ser corrigidos depois, não são prioridade.

---

## 📝 Resumo para Retomar

**Contexto**:
Você estava trabalhando para corrigir o problema de relatórios não exibindo dados no PraPassar (aplicação de estudos para concursos). Descobrimos que `useSupabaseUser()` retornava `user_id = undefined` e resolvemos usando `getSession()`. Agora os relatórios de TEMPO funcionam, mas as QUESTÕES ainda não aparecem.

**Próxima tarefa**:
Verificar se há tentativas de questões no banco de dados e, se houver, investigar por que não aparecem no relatório.

**Comando para iniciar amanhã**:

```bash
cd c:/prapassar/prapassar-app
npm run dev
```

Depois abrir:
- http://localhost:3001/reports (ver relatórios)
- https://app.supabase.com (executar queries de verificação)

---

## 🎯 Prompt para Retomar

**Cole isto para o Claude amanhã**:

```
Olá! Ontem estávamos trabalhando no problema de relatórios do PraPassar.

Conseguimos resolver o problema principal: os relatórios de TEMPO agora funcionam!
A solução foi substituir useSupabaseUser() por supabase.auth.getSession()
porque user.value.id estava retornando undefined.

Arquivos corrigidos:
- prapassar-app/app/composables/useReports.ts (linha 107-109)
- prapassar-app/app/pages/test-reports-simple.vue (linha 15-17)

Porém, ainda há um problema pendente: as QUESTÕES respondidas não estão
sendo contabilizadas nos relatórios.

Meu user_id é: 0b17dba0-7c78-4c43-a2cf-f6d890f8d329
Email: netsacolas@gmail.com

Por favor, leia o arquivo SESSAO_CONTINUAR_AMANHA.md e me ajude a:
1. Verificar se tenho tentativas de questões no banco
2. Se sim, investigar por que não aparecem no relatório
3. Se não, criar dados de teste para testar a funcionalidade

O servidor já está rodando em http://localhost:3001
```

---

**Boa sorte amanhã! 🚀**

**Data deste arquivo**: 2025-10-19 23:45
**Desenvolvido com Claude Code**

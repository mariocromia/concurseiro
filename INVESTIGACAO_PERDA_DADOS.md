# 🚨 INVESTIGAÇÃO: Perda de Dados no Calendário

**Data:** 2025-10-22
**Prioridade:** CRÍTICA
**Status:** Em Investigação

---

## 🎯 O QUE FOI FEITO ATÉ AGORA

### ✅ Correções Aplicadas no Código

#### 1. **Logs Detalhados no Carregamento** (useStudySchedule.ts)

Adicionei logs extensivos na função `fetchActivities()`:

```typescript
🔄 INÍCIO: fetchActivities (CARREGAMENTO)
📅 Período solicitado
✅ Usuário autenticado: [user_id]
🔍 Buscando na tabela study_schedules...
📊 Filtros aplicados: {user_id, scheduled_date >=, scheduled_date <=}
📬 Resposta recebida do banco
✅ Consulta executada com sucesso
📊 Quantidade de registros retornados: [X]

Se 0 registros:
  ⚠️ NENHUMA ATIVIDADE ENCONTRADA
  Possíveis causas:
  1. Não há atividades criadas neste período
  2. Atividades foram criadas com user_id diferente
  3. Atividades foram criadas com scheduled_date fora do período
  4. Políticas RLS estão bloqueando a leitura

Se > 0 registros:
  📋 Primeiros registros encontrados: [dados]
  ✅ Atividades processadas e armazenadas
  📊 Total no array local: [X]
```

#### 2. **Mapeamento Robusto de Campos**

Adicionei compatibilidade total no mapeamento dos campos:

```typescript
const mapped = {
  ...item,
  // Aceita AMBOS os nomes de campos
  start_time: item.start_time || item.scheduled_time || '00:00',
  duration: item.duration || item.planned_duration || 60,
  is_completed: item.is_completed !== undefined
    ? item.is_completed
    : (item.status === 'completed'),
  subject: item.subject ? [...] : null,
  type: item.subject_id ? 'study' : 'event'
}
```

**Por que isso é importante:**
- Se a tabela tem `start_time`, usa `start_time`
- Se a tabela tem `scheduled_time`, usa `scheduled_time`
- Se tem ambos, prioriza o primeiro
- Nunca falha por falta de campo

#### 3. **Removido Ordenação Problemática**

Removi a linha que ordenava por `start_time`:

```typescript
// ANTES (causava erro silencioso):
.order('start_time', { ascending: true })

// DEPOIS (sem ordenação por hora):
.order('scheduled_date', { ascending: true })
// NÃO ordenar por start_time/scheduled_time - pode causar erro se coluna não existir
```

**Por que isso é crítico:**
- Se a coluna `start_time` não existe na tabela
- O `.order('start_time')` causa erro silencioso
- A query falha mas não mostra erro
- Resultado: 0 registros retornados, mesmo que existam dados

---

## 🧪 PRÓXIMO PASSO: TESTE COM LOGS

### O Que Você Deve Fazer AGORA:

1. **Recarregar a aplicação:**
   ```
   Ctrl+R ou F5
   ```

2. **Abrir console do navegador:**
   ```
   F12 → Aba "Console"
   ```

3. **Observar os logs detalhados:**
   ```
   Procure por:
   🔄 INÍCIO: fetchActivities
   📊 Quantidade de registros retornados: [número]
   ```

4. **Copiar e me enviar:**
   - TODOS os logs que começam com 🔄
   - Quantidade de registros encontrados
   - Se houver erro, a mensagem completa

### Resultados Possíveis:

#### ✅ CENÁRIO A: Logs mostram "X registros retornados" (X > 0)
**Significado:** Dados estão no banco, carregamento funciona!
**Problema:** Pode ser visualização no calendário
**Próximo passo:** Verificar renderização dos dados

#### ⚠️ CENÁRIO B: Logs mostram "0 registros retornados"
**Significado:** Query não encontra dados
**Problema:** Pode ser filtro, RLS, ou dados não existem
**Próximo passo:** Executar SQL de diagnóstico

#### ❌ CENÁRIO C: Logs mostram erro
**Significado:** Query falha
**Problema:** Erro na consulta (coluna inexistente, RLS, etc)
**Próximo passo:** Corrigir query baseado no erro

---

## 📊 DIAGNÓSTICO SQL (EXECUTAR NO SUPABASE)

### Arquivo Criado: `DIAGNOSTICO_URGENTE_DADOS.sql`

Este arquivo contém **10 queries** para diagnosticar completamente:

1. ✅ Total de registros na tabela
2. ✅ Últimos 20 registros criados
3. ✅ Estrutura completa da tabela
4. ✅ Políticas RLS configuradas
5. ✅ Registros por usuário
6. ✅ Se RLS está ativado
7. ✅ Registros do usuário logado
8. ✅ Campos obrigatórios (NOT NULL)
9. ✅ Registros criados hoje
10. ✅ Problemas de integridade

### Como Executar:

1. Abra o Supabase
2. Vá em "SQL Editor"
3. Cole cada query do arquivo `DIAGNOSTICO_URGENTE_DADOS.sql`
4. Execute uma por uma
5. Copie os resultados de TODAS
6. Me envie os resultados

---

## 🔍 O QUE ESTAMOS INVESTIGANDO

### Hipótese 1: Dados Não Foram Salvos
**Sintomas:**
- Query retorna 0 registros
- Tabela está vazia

**Causa provável:**
- Políticas RLS bloqueando INSERT
- Erro silencioso no salvamento
- Transação não foi commitada

**Como confirmar:**
Execute Query 1 do SQL: `SELECT COUNT(*)`
- Se = 0: Hipótese confirmada
- Se > 0: Hipótese descartada

### Hipótese 2: Dados Salvos com user_id Errado
**Sintomas:**
- Tabela tem registros
- Mas filtro por user_id não encontra

**Causa provável:**
- user_id salvo diferente do user_id da sessão
- Problema de autenticação no momento do save

**Como confirmar:**
Execute Query 5 do SQL: Registros por usuário
- Se user_id dos registros ≠ seu user_id: Hipótese confirmada

### Hipótese 3: RLS Bloqueando SELECT
**Sintomas:**
- Dados existem na tabela
- INSERT funciona, SELECT não

**Causa provável:**
- Política SELECT muito restritiva
- Política SELECT não existe
- auth.uid() retorna null no SELECT

**Como confirmar:**
Execute Query 4 e 7 do SQL
- Se Query 7 retorna vazio mas Query 2 retorna dados: Hipótese confirmada

### Hipótese 4: Filtro de Data Incorreto
**Sintomas:**
- Dados existem
- RLS funciona
- Mas filtro de scheduled_date não pega

**Causa provável:**
- Data salva em formato diferente
- Período de busca não inclui os registros
- Timezone causando diferença de datas

**Como confirmar:**
Execute Query 2 do SQL
- Verifique o valor de `scheduled_date` dos registros
- Compare com período que está sendo buscado nos logs

### Hipótese 5: Query com Erro Silencioso
**Sintomas:**
- Console não mostra erro
- Mas retorna 0 registros
- Dados existem no banco

**Causa provável:**
- `.order()` em coluna inexistente
- `.select()` com campo que não existe
- Join com tabela que não tem dados

**Como confirmar:**
Logs detalhados vão mostrar se há erro
Query 3 do SQL mostra quais colunas existem

---

## 📋 CHECKLIST DE INFORMAÇÕES NECESSÁRIAS

Por favor, me envie:

### Do Console do Navegador (F12):
- [ ] Logs completos do `fetchActivities`
- [ ] Quantidade de registros retornados
- [ ] Mensagens de erro (se houver)
- [ ] Warnings em amarelo (se houver)

### Do Supabase SQL:
- [ ] Resultado da Query 1 (total de registros)
- [ ] Resultado da Query 2 (últimos registros)
- [ ] Resultado da Query 3 (estrutura da tabela)
- [ ] Resultado da Query 4 (políticas RLS)
- [ ] Resultado da Query 7 (registros do usuário)

### Screenshots:
- [ ] Console com logs
- [ ] Supabase com resultados das queries
- [ ] Calendário vazio (mostrando que não aparece)

---

## 🎯 APÓS RECEBER AS INFORMAÇÕES

Com os dados acima, identificarei:

1. ✅ Se os dados foram salvos
2. ✅ Onde estão os dados
3. ✅ Por que não estão carregando
4. ✅ Qual correção específica aplicar

E então criarei a solução definitiva! 🚀

---

## 📝 RESUMO DAS CORREÇÕES JÁ APLICADAS

### Arquivo: `useStudySchedule.ts`

#### `createActivity()` (linhas 144-165)
✅ Envia AMBOS os formatos de campos:
- `start_time` + `scheduled_time`
- `duration` + `planned_duration`
- `is_completed` + `status`
- `study_type`

#### `fetchActivities()` (linhas 71-161)
✅ Logs detalhados completos
✅ Mapeamento robusto de campos
✅ Removida ordenação por `start_time`
✅ Tratamento de erros melhorado

#### `updateActivity()` (linhas 253-284)
✅ Envia ambos os formatos ao atualizar

---

**🚨 AGUARDANDO LOGS DO CONSOLE E RESULTADOS DO SQL PARA CONTINUAR! 🚨**

# 🔧 Instruções para Configurar o Banco de Dados

## Status Atual

✅ **Página de Relatórios**: Completamente reformulada com gráficos interativos
✅ **Script SQL**: Criado com todas as 35+ tabelas necessárias
⚠️ **Banco de Dados**: Precisa executar o script para criar tabelas faltantes

## Problema Identificado

Algumas tabelas críticas estão faltando no seu banco Supabase:
- ❌ `question_attempts` - Para salvar respostas de questões
- ❌ `study_schedules` - Para estudos agendados no calendário
- ❌ `flashcards` - Para sistema de flashcards
- ❌ Outras tabelas auxiliares

**Resultado**: Timer e questões funcionam no app, mas os dados não aparecem nos relatórios porque as tabelas não existem.

## 📋 Solução: Execute os Scripts SQL

### ⚠️ IMPORTANTE: Execute em 2 Etapas

Para evitar erros, execute **dois scripts** nesta ordem:

---

### **ETAPA 1: Script de Correção** (FIX_ALL_TABLES.sql) ⭐

Este script corrige TODAS as incompatibilidades de estrutura nas tabelas existentes:
- ✅ Tabela `revisions` (adiciona colunas due_date e scheduled_date)
- ✅ Tabela `subscription_plans` (renomeia colunas para padrão correto)
- ✅ Tabela `question_attempts` (cria se não existir)
- ✅ Índices necessários

**Como executar:**

1. Abra [https://app.supabase.com](https://app.supabase.com)
2. Faça login e selecione o projeto **PraPassar**
3. Vá para **SQL Editor** → **+ New Query**
4. Abra o arquivo **`database/FIX_ALL_TABLES.sql`**
5. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
6. **Cole** no SQL Editor (Ctrl+V)
7. Clique em **Run** (Ctrl+Enter)

✅ **Resultado esperado:**
```
✅ Coluna revisions.due_date adicionada
✅ Coluna revisions.scheduled_date adicionada
✅ Dados sincronizados entre due_date e scheduled_date
✅ Tabela subscription_plans corrigida
✅ Tabela question_attempts criada com sucesso
✅ TODAS AS CORREÇÕES APLICADAS COM SUCESSO!
```

⏱️ **Tempo estimado**: 3-5 segundos

---

### **ETAPA 2: Script Completo** (SETUP_COMPLETO_SUPABASE.sql)

Agora execute o script principal para criar todas as tabelas.

1. Ainda no **SQL Editor**, clique em **+ New Query** (nova aba)
2. Abra o arquivo `database/SETUP_COMPLETO_SUPABASE.sql`
3. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
4. **Cole** no SQL Editor (Ctrl+V)
5. Clique em **Run** (Ctrl+Enter)

✅ **Resultado esperado:**
```
✅ Setup do banco de dados PraPassar concluído com sucesso!
📊 Total de tabelas criadas: ~35
Success. No rows returned
```

⏱️ **Tempo estimado**: 5-10 segundos

---

### **ETAPA 3: Verifique o Resultado**

Se tudo correu bem, você verá mensagens no console do SQL Editor.

**Isso é normal e correto!** Os scripts criaram/atualizaram as tabelas com sucesso.

## ✅ Verificação

Após executar o script, verifique se as tabelas foram criadas:

1. No Supabase, vá para **Table Editor** (menu lateral)
2. Procure pelas seguintes tabelas:
   - `question_attempts` ✅
   - `study_sessions` ✅
   - `study_schedules` ✅
   - `flashcards` ✅
   - `subjects` ✅
   - `notebooks` ✅
   - `tasks` ✅
   - `subscriptions` ✅

Se você vê essas tabelas na lista, **está tudo pronto**! 🎉

## 🧪 Teste os Relatórios

Agora teste se os dados aparecem nos relatórios:

### 1. Teste o Timer

1. Acesse a página **Estudar** (`/study`)
2. Inicie o cronômetro para alguma matéria
3. Deixe rodar por 1-2 minutos
4. Encerre o cronômetro
5. Vá para **Relatórios** (`/reports`)
6. ✅ O tempo deve aparecer nos gráficos!

### 2. Teste as Questões

1. Acesse **Banco de Questões** (`/questoes`)
2. Responda algumas questões
3. Vá para **Relatórios** (`/reports`)
4. ✅ As questões devem aparecer na seção "Desempenho por Matéria"!

## 📊 O que foi Implementado

### Nova Página de Relatórios

A página `/reports` agora possui:

1. **4 Cards de Métricas Principais**
   - Tempo total de estudo
   - Média diária
   - Questões respondidas
   - Taxa de acerto

2. **Gráfico de Evolução Diária** (Chart.js Line)
   - Mostra seu tempo de estudo por dia
   - Linha suave com preenchimento gradiente
   - Interativo (hover para ver detalhes)

3. **Gráfico de Distribuição por Matéria** (Chart.js Doughnut)
   - Pizza colorida mostrando % de tempo por matéria
   - Cores correspondem às cores das matérias
   - Interativo (clique para filtrar)

4. **Tabela de Matérias**
   - Tempo estudado por matéria
   - Barras de progresso visual
   - Porcentagem do total

5. **Desempenho em Questões**
   - Grid com cards por matéria
   - Total de questões, acertos, erros
   - Taxa de acerto em destaque

6. **Progresso de Metas**
   - Barra de progresso visual
   - Comparação: tempo estudado vs meta
   - Porcentagem de conclusão

7. **Estatísticas de Revisões**
   - Revisões concluídas vs pendentes
   - Sistema R1-R7 de repetição espaçada

8. **Filtros de Período**
   - Últimos 7 dias
   - Últimos 30 dias
   - Últimos 90 dias
   - Todo o período

9. **Exportação**
   - Botão para exportar dados em CSV
   - Útil para análises externas

### Novo Composable

**`app/composables/useReports.ts`** (350+ linhas)
- Centraliza toda lógica de relatórios
- Busca dados de múltiplas tabelas
- Calcula métricas e tendências
- Processa dados para gráficos
- Função de exportação CSV
- Integrado com useLoading e useToast

## 🔍 Arquivos Modificados/Criados

1. ✅ `app/composables/useReports.ts` - CRIADO (350 linhas)
2. ✅ `app/pages/reports.vue` - REESCRITO (620 linhas)
3. ✅ `database/migrations/2025-10-19_add_question_attempts.sql` - CRIADO
4. ✅ `database/SETUP_COMPLETO_SUPABASE.sql` - CRIADO (1000+ linhas)

## 🐛 Problemas Resolvidos

### Problema 1: Timer não aparecia nos relatórios
**Causa**: Código buscava da tabela errada (`study_schedules` em vez de `study_sessions`)
**Solução**: Corrigido para buscar de `study_sessions` e converter segundos para minutos

### Problema 2: Questões não salvavam
**Causa**: Tabela `question_attempts` não existia no banco
**Solução**: Criada migração + incluída no script completo

### Problema 3: Erros 404 no console
**Causa**: Várias tabelas faltando no banco
**Solução**: Script completo com todas as 35+ tabelas necessárias

## ⚠️ Importante

### Se você já tem dados no banco:

O script usa `IF NOT EXISTS` em todas as criações, então é **seguro** executar mesmo que algumas tabelas já existam. Ele **não vai apagar** dados existentes.

### Se der erro ao executar:

1. **Erro de permissão**: Certifique-se de estar logado como owner do projeto
2. **Erro de sintaxe**: Verifique se copiou o script completo (do início ao fim)
3. **Erro de tabela existente**: Ignore, o script pula tabelas que já existem

### Dúvidas?

Se encontrar qualquer problema:
1. Copie a mensagem de erro completa
2. Tire um print do SQL Editor
3. Me mostre para que eu possa ajudar

## 🎯 Próximos Passos

Após configurar o banco:

1. ✅ Teste os relatórios
2. ✅ Use o app normalmente por alguns dias
3. ✅ Acompanhe seus dados crescendo nos gráficos
4. 📊 Analise suas métricas para otimizar seus estudos!

---

**Versão**: 1.0
**Data**: 2025-10-19
**Status**: Pronto para execução ✅

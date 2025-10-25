# 📋 Guia de Teste End-to-End - Sistema de Metas

## 🎯 Objetivo

Este guia fornece instruções passo a passo para testar completamente o sistema de metas do PraPassar, garantindo que todas as funcionalidades estejam operacionais.

---

## ⚙️ Pré-requisitos

Antes de começar os testes, certifique-se de que:

### 1. Banco de Dados Está Configurado

Execute no **SQL Editor do Supabase**:

```bash
# Abra o arquivo e execute TODO o conteúdo:
c:\prapassar\prapassar-app\database\2025-10-21_create_goals_system.sql
```

**Resultado esperado**: Mensagem "Success. No rows returned"

### 2. Verificar Configuração

Execute o script de diagnóstico no **SQL Editor do Supabase**:

```bash
# Copie e execute:
c:\prapassar\VERIFICAR_TABELAS_METAS.sql
```

**Checklist esperado:**
- ✅ 2 tabelas existem (goals, goal_checklist_items)
- ✅ RLS habilitado em ambas
- ✅ 8 políticas RLS configuradas
- ✅ Triggers funcionando
- ✅ Usuário autenticado
- ✅ Pelo menos 1 matéria cadastrada

### 3. Aplicação Rodando

```bash
cd prapassar-app
npm run dev
```

Acesse: http://localhost:3000

---

## 🧪 Plano de Testes

### TESTE 1: Verificar Página de Metas

**Objetivo**: Confirmar que a página /metas carrega corretamente

**Passos**:
1. Faça login na aplicação
2. No menu lateral, clique em "Metas"
3. Ou navegue diretamente para http://localhost:3000/metas

**Resultado esperado**:
- ✅ Página carrega sem erros
- ✅ Exibe 4 cards de estatísticas (Total, Em Progresso, Concluídas, Taxa de Conclusão)
- ✅ Exibe botões de filtro (Todas, Em Progresso, Concluídas, Atrasadas)
- ✅ Exibe botão "Nova Meta" no canto superior direito
- ✅ Se não houver metas, exibe mensagem "Nenhuma meta encontrada"

**Console esperado** (F12):
- Sem erros JavaScript
- Possíveis logs: `[METAS] Carregando metas...`

---

### TESTE 2: Criar Nova Meta (Fluxo Completo)

**Objetivo**: Testar criação de meta do início ao fim

**Passos**:

#### 2.1. Abrir Modal de Criação

1. Na página /metas, clique no botão **"Nova Meta"**

**Resultado esperado**:
- ✅ Modal abre com título "Nova Meta"
- ✅ Formulário exibe 4 campos:
  - Nome da Meta
  - Matéria (dropdown)
  - Data de Conclusão
  - Lista de Checklist
- ✅ Botão "Adicionar Item" presente

**Console esperado**:
```
📝 [METAS] Abrindo modal de criação
```

#### 2.2. Preencher Formulário

1. **Nome da Meta**: Digite "Dominar Direito Constitucional"
2. **Matéria**: Selecione uma matéria do dropdown
   - Se dropdown estiver vazio, vá para /subjects e crie uma matéria primeiro
3. **Data de Conclusão**: Selecione uma data futura (ex: daqui a 30 dias)
4. **Checklist**: Adicione 3 itens:
   - "Ler capítulos 1 a 5"
   - "Resolver 100 questões"
   - "Fazer resumo completo"

**Resultado esperado**:
- ✅ Dropdown de matérias carrega e exibe matérias cadastradas
- ✅ Ao digitar item e clicar "Adicionar Item", o item aparece na lista
- ✅ Cada item tem botão "X" para remover
- ✅ Data não aceita datas passadas

**Console esperado**:
```
🔷 [useGoals] Carregando matérias...
✅ Matérias carregadas: 5
```

#### 2.3. Salvar Meta

1. Clique no botão **"Salvar Meta"**

**Resultado esperado**:
- ✅ Modal fecha automaticamente
- ✅ Toast de sucesso aparece: "Meta criada com sucesso! Você deu o primeiro passo rumo à sua aprovação!"
- ✅ Nova meta aparece na lista de metas
- ✅ Card da meta exibe:
  - Nome da meta
  - Badge da matéria (com cor)
  - Barra de progresso (0%)
  - Primeiros 3 itens do checklist
  - Dias restantes
  - Status: "Em andamento"

**Console esperado**:
```
📝 [METAS] Criando nova meta: {
  name: "Dominar Direito Constitucional",
  subject_id: "uuid-da-materia",
  target_date: "2025-12-01",
  checklist_items_count: 3,
  checklist_items: [...]
}
🔷 [useGoals] Iniciando criação de meta: {...}
🔷 [POST /api/goals] Iniciando criação de meta...
🔷 [POST /api/goals] User ID: uuid-do-usuario
🔷 [POST /api/goals] Validando matéria: uuid-da-materia
🔷 [POST /api/goals] Subject encontrada: { id: "...", name: "..." }
🔷 [POST /api/goals] Inserindo meta na tabela goals...
🔷 [POST /api/goals] Goal criada: {...}
🔷 [POST /api/goals] Inserindo itens do checklist...
🔷 [POST /api/goals] Items inseridos: [...]
✅ [POST /api/goals] Meta criada com sucesso!
🔷 [useGoals] Resposta da API: { data: {...}, error: null }
✅ [useGoals] Meta criada com sucesso: {...}
📝 [METAS] Resultado da criação: { success: true, data: {...} }
✅ [METAS] Meta criada com sucesso! {...}
```

**Se houver erro**:
```
❌ [POST /api/goals] Erro ao criar meta: {...}
❌ [useGoals] Erro da API [500]: {...}
❌ [METAS] Erro ao criar meta: { message: "...", fullResult: {...} }
```

---

### TESTE 3: Visualizar Detalhes da Meta

**Objetivo**: Testar página de detalhes individual

**Passos**:

1. Na lista de metas, clique em **"Ver Detalhes"** na meta criada
2. Ou navegue para /metas/[id-da-meta]

**Resultado esperado**:
- ✅ Página carrega com todos os detalhes:
  - Nome da meta como título
  - Badge da matéria
  - Badge de status ("Em andamento", "Concluída", "Atrasada")
  - Data de conclusão formatada
  - Dias restantes (com cor: verde > 3 dias, laranja ≤ 3 dias, vermelho atrasada)
  - Barra de progresso com porcentagem
  - Texto "Você completou X de Y itens"
  - Mensagem motivacional
  - Lista completa do checklist
  - Botões: Editar, Deletar, Voltar

**Console esperado**:
```
🔷 Carregando meta [id]...
✅ Meta carregada: {...}
```

---

### TESTE 4: Marcar Itens como Completos

**Objetivo**: Testar funcionalidade de checkbox

**Passos**:

1. Na página de detalhes (/metas/[id]), encontre o primeiro item do checklist
2. Clique no **checkbox** ao lado do item

**Resultado esperado**:
- ✅ Checkbox marca como completo
- ✅ Item recebe linha cortada (text-through)
- ✅ Animação de confetti aparece 🎉
- ✅ Barra de progresso atualiza (ex: 0% → 33%)
- ✅ Texto atualiza: "Você completou 1 de 3 itens"
- ✅ Mensagem motivacional muda baseado no progresso

**Console esperado**:
```
🔷 Marcando item como completo...
✅ Item atualizado com sucesso
🎉 Confetti!
```

#### 4.1. Completar Todos os Itens

1. Continue marcando os demais itens até completar todos

**Resultado esperado ao completar TODOS**:
- ✅ Barra de progresso: 100%
- ✅ Status muda para **"Concluída"** (badge verde)
- ✅ Borda do card fica verde
- ✅ Grande confetti de celebração 🎊
- ✅ Mensagem: "Parabéns! Você alcançou sua meta! Sua dedicação vai te levar longe!"

**Console esperado**:
```
✅ Todos os itens completos!
🎊 Meta concluída! Trigger do banco de dados atualizou status
```

#### 4.2. Desmarcar Item

1. Clique novamente no checkbox de um item completo

**Resultado esperado**:
- ✅ Checkbox desmarca
- ✅ Linha cortada removida
- ✅ Progresso diminui (ex: 100% → 67%)
- ✅ Status volta para "Em andamento" (badge azul)
- ✅ Borda volta para azul

---

### TESTE 5: Adicionar Novo Item ao Checklist

**Objetivo**: Testar adição dinâmica de itens

**Passos**:

1. Na página de detalhes, clique no botão **"Adicionar Item"**
2. Aparece campo de input
3. Digite: "Revisar matéria completa"
4. Pressione **Enter** ou clique no botão verde de adicionar

**Resultado esperado**:
- ✅ Novo item aparece na lista
- ✅ Item começa desmarcado
- ✅ Progresso recalcula (ex: 2/3 = 67% → 2/4 = 50%)
- ✅ Campo de input limpa
- ✅ Toast de sucesso (opcional)

**Console esperado**:
```
🔷 Adicionando novo item...
✅ Item adicionado com sucesso
```

---

### TESTE 6: Editar Item do Checklist

**Objetivo**: Testar edição inline de itens

**Passos**:

1. Clique no **ícone de lápis** ao lado de um item
2. Input de edição aparece
3. Altere o texto para: "Ler capítulos 1 a 10"
4. Pressione **Enter** ou clique no botão de salvar

**Resultado esperado**:
- ✅ Texto do item atualiza
- ✅ Modo de edição fecha
- ✅ Toast de sucesso (opcional)

---

### TESTE 7: Deletar Item do Checklist

**Objetivo**: Testar remoção de itens

**Passos**:

1. Clique no **ícone de lixeira** ao lado de um item
2. Confirme a exclusão (se houver confirmação)

**Resultado esperado**:
- ✅ Item desaparece da lista
- ✅ Progresso recalcula (ex: 2/4 = 50% → 2/3 = 67%)
- ✅ Total de itens atualiza

---

### TESTE 8: Editar Meta

**Objetivo**: Testar edição de nome, matéria e data

**Passos**:

1. Na página de detalhes, clique no botão **"Editar"**
2. Modal de edição abre (pré-preenchido com dados atuais)
3. Altere:
   - Nome: "Dominar TODO o Direito Constitucional"
   - Matéria: Selecione outra matéria (se disponível)
   - Data: Altere para outra data futura
4. Clique em **"Salvar Meta"**

**Resultado esperado**:
- ✅ Modal fecha
- ✅ Toast de sucesso: "Meta atualizada com sucesso!"
- ✅ Página atualiza com novos dados
- ✅ Nome, matéria e data refletem as mudanças
- ✅ Checklist permanece intacto

**Console esperado**:
```
📝 [METAS] Atualizando meta: {...}
✅ Meta atualizada com sucesso
```

---

### TESTE 9: Deletar Meta

**Objetivo**: Testar exclusão completa

**Passos**:

1. Na página de detalhes, clique no botão **"Deletar"** (vermelho)
2. Confirme a exclusão no prompt

**Resultado esperado**:
- ✅ Prompt de confirmação aparece: "Tem certeza que deseja deletar a meta '...'?"
- ✅ Ao confirmar, redireciona para /metas
- ✅ Toast de sucesso: "Meta deletada com sucesso"
- ✅ Meta não aparece mais na lista
- ✅ Estatísticas atualizam (total diminui)

**Console esperado**:
```
🗑️  Deletando meta [id]...
✅ Meta deletada com sucesso
```

---

### TESTE 10: Filtros na Lista de Metas

**Objetivo**: Testar filtros de status

**Pré-requisito**: Tenha metas com diferentes status:
- Crie 2 metas "Em andamento"
- Complete 1 meta totalmente (status: "Concluída")
- Crie 1 meta com data passada (status: "Atrasada")

**Passos**:

1. Na página /metas, clique no filtro **"Todas"**
   - **Resultado**: Exibe todas as 4 metas

2. Clique no filtro **"Em Progresso"**
   - **Resultado**: Exibe apenas as 2 metas em andamento

3. Clique no filtro **"Concluídas"**
   - **Resultado**: Exibe apenas a 1 meta completa

4. Clique no filtro **"Atrasadas"**
   - **Resultado**: Exibe apenas a 1 meta atrasada

**Console esperado**:
```
🔷 Filtrando metas: status=in_progress
✅ 2 metas encontradas
```

---

### TESTE 11: Estatísticas no Dashboard

**Objetivo**: Verificar cards de estatísticas

**Passos**:

1. Com metas criadas, observe os 4 cards no topo da página /metas

**Resultado esperado**:
- ✅ **Total de Metas**: Número correto
- ✅ **Em Progresso**: Apenas metas com status in_progress
- ✅ **Concluídas**: Apenas metas com status completed
- ✅ **Taxa de Conclusão**: Porcentagem correta (concluídas / total * 100)

---

### TESTE 12: Validações e Erros

**Objetivo**: Testar comportamento com dados inválidos

#### 12.1. Nome Vazio

1. Abra modal de criação
2. Deixe campo "Nome da Meta" **vazio**
3. Tente salvar

**Resultado esperado**:
- ❌ Erro: "Nome da meta é obrigatório"
- ❌ Modal não fecha

#### 12.2. Matéria Não Selecionada

1. Preencha nome
2. Deixe matéria como "Selecione uma matéria"
3. Tente salvar

**Resultado esperado**:
- ❌ Erro: "Matéria é obrigatória"

#### 12.3. Data Passada

1. Preencha nome e matéria
2. Selecione data **no passado**
3. Tente salvar

**Resultado esperado**:
- ❌ Erro: "A data de conclusão não pode ser anterior a hoje"

#### 12.4. Checklist Vazio

1. Preencha tudo corretamente
2. Não adicione nenhum item ao checklist
3. Tente salvar

**Resultado esperado**:
- ❌ Erro: "Pelo menos um item do checklist é obrigatório"

---

### TESTE 13: Trigger Automático de Status

**Objetivo**: Verificar que o banco de dados atualiza status automaticamente

**Passos**:

1. Crie uma meta com 3 itens
2. Marque 2 itens como completos (não todos)
3. Verifique no **SQL Editor do Supabase**:

```sql
SELECT id, name, status, completed_at
FROM public.goals
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado**:
- ✅ `status = 'in_progress'`
- ✅ `completed_at = NULL`

4. Agora marque o 3º item como completo
5. Execute a mesma query novamente

**Resultado esperado**:
- ✅ `status = 'completed'` (mudou automaticamente!)
- ✅ `completed_at = '2025-...'` (timestamp preenchido)

**Isso comprova que o trigger `update_goal_status_on_item_change` está funcionando!**

---

### TESTE 14: Meta Atrasada (Overdue)

**Objetivo**: Testar status de meta atrasada

**Passos**:

1. Crie uma meta com data de conclusão **HOJE**
2. Não complete todos os itens
3. Aguarde o dia virar (ou ajuste manualmente a data no banco)

```sql
UPDATE public.goals
SET target_date = CURRENT_DATE - 1  -- Ontem
WHERE id = 'uuid-da-meta';
```

4. Recarregue a página /metas

**Resultado esperado**:
- ✅ Badge muda para **"Atrasada"** (vermelho)
- ✅ Borda do card fica vermelha
- ✅ Dias restantes mostra valor negativo (ex: "-2 dias")

---

## 🐛 Troubleshooting (Resolução de Problemas)

### Problema 1: "Erro 401 - Unauthorized"

**Causa**: Usuário não está autenticado ou sessão expirou

**Solução**:
1. Faça logout e login novamente
2. Verifique se o token do Supabase é válido
3. Verifique variáveis de ambiente (.env)

### Problema 2: "Tabelas não encontradas"

**Causa**: Migration não foi executada

**Solução**:
1. Execute o arquivo `database/2025-10-21_create_goals_system.sql` no SQL Editor do Supabase
2. Verifique com `VERIFICAR_TABELAS_METAS.sql`

### Problema 3: "Matéria inválida ou não encontrada"

**Causa**: subject_id fornecido não existe ou não pertence ao usuário

**Solução**:
1. Vá para /subjects e crie pelo menos uma matéria
2. Verifique no banco:

```sql
SELECT id, name FROM public.subjects WHERE user_id = auth.uid();
```

### Problema 4: Modal não fecha após salvar

**Causa**: Erro JavaScript no frontend

**Solução**:
1. Abra o Console (F12)
2. Procure por erros em vermelho
3. Verifique logs detalhados:
   - `❌ [METAS] Erro ao criar meta`
   - `❌ [useGoals] Erro da API`

### Problema 5: Progresso não atualiza

**Causa**: Trigger do banco pode estar desabilitado

**Solução**:
1. Verifique triggers:

```sql
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgrelid IN ('public.goals'::regclass, 'public.goal_checklist_items'::regclass)
  AND tgisinternal = false;
```

2. Se não aparecer `update_goal_status_on_item_change`, execute a migration novamente

---

## ✅ Checklist Final de Sucesso

Após completar todos os testes, você deve ter:

- [x] Criado pelo menos 1 meta com sucesso
- [x] Visualizado detalhes da meta
- [x] Marcado/desmarcado itens do checklist
- [x] Visto animação de confetti ao completar item
- [x] Completado 100% de uma meta e visto status mudar para "Concluída"
- [x] Adicionado novo item ao checklist
- [x] Editado descrição de item
- [x] Deletado item do checklist
- [x] Editado nome/matéria/data da meta
- [x] Deletado uma meta
- [x] Filtrado metas por status
- [x] Verificado que estatísticas estão corretas
- [x] Testado todas as validações de erro
- [x] Confirmado que trigger do banco funciona
- [x] Visto meta ficar "Atrasada" após data passar

**Se todos os itens acima estão funcionando, o sistema de metas está 100% operacional! 🎉**

---

## 📊 Logs Esperados (Resumo)

### Criação de Meta (Sucesso)

```
📝 [METAS] Criando nova meta: { name: "...", subject_id: "...", ... }
🔷 [useGoals] Iniciando criação de meta
🔷 [POST /api/goals] Iniciando criação de meta...
🔷 [POST /api/goals] User ID: abc-123
🔷 [POST /api/goals] Validando matéria: def-456
🔷 [POST /api/goals] Subject encontrada: { id: "...", name: "..." }
🔷 [POST /api/goals] Inserindo meta na tabela goals...
🔷 [POST /api/goals] Goal criada: { id: "...", ... }
🔷 [POST /api/goals] Inserindo itens do checklist...
🔷 [POST /api/goals] Items inseridos: [...]
✅ [POST /api/goals] Meta criada com sucesso!
✅ [useGoals] Meta criada com sucesso: { id: "...", ... }
✅ [METAS] Meta criada com sucesso! { id: "...", ... }
```

### Criação de Meta (Erro)

```
📝 [METAS] Criando nova meta: { ... }
🔷 [useGoals] Iniciando criação de meta
🔷 [POST /api/goals] Iniciando criação de meta...
🔷 [POST /api/goals] Validando matéria: xyz-999
🔷 [POST /api/goals] Subject Error: { code: "PGRST116", ... }
❌ [POST /api/goals] Matéria inválida ou não pertence ao usuário
❌ [useGoals] Erro da API [400]: { message: "Matéria inválida..." }
❌ [METAS] Erro ao criar meta: { message: "Matéria inválida..." }
```

---

## 📝 Notas Finais

- **Todos os logs com 🔷 são informativos** (debug)
- **Logs com ✅ indicam sucesso**
- **Logs com ❌ indicam erro**
- **Em produção, os logs de debug (🔷) devem ser removidos ou desabilitados**

Para desabilitar logs de debug em produção, envolva os `console.log` em:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('🔷 Debug info')
}
```

---

**Última atualização**: 2025-10-24
**Versão do Guia**: 1.0
**Desenvolvido para**: PraPassar v4.1.0

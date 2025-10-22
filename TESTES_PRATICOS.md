# 🧪 TESTES PRÁTICOS - Calendário de Estudos

**Data:** 2025-10-22
**Objetivo:** Verificar se as atividades persistem após recarregar a página

---

## ✅ TESTE 1: Verificar Se Dados Existem no Banco

### Passo 1: Abrir Supabase Dashboard
1. Acesse https://app.supabase.com
2. Selecione seu projeto PraPassar
3. Vá em **Table Editor** → Tabela **study_schedules**

### Passo 2: Executar Query SQL
No **SQL Editor**, execute:

```sql
SELECT
  id,
  user_id,
  title,
  scheduled_date,
  scheduled_time,
  start_time,
  planned_duration,
  duration,
  is_completed,
  status,
  study_type,
  created_at
FROM study_schedules
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY scheduled_date DESC, start_time DESC
LIMIT 20;
```

**Resultado Esperado:**
- Deve retornar **13 registros** (ou quantos você criou)
- Campos `title`, `scheduled_date`, `start_time` (ou `scheduled_time`) devem estar preenchidos
- Campo `user_id` deve ter um UUID válido

**✅ Se retornar registros:** Dados estão salvos no banco
**❌ Se retornar vazio:** Atividades não estão sendo salvas

---

## ✅ TESTE 2: Recarregar Página e Verificar Console

### Passo 1: Abrir Aplicação
```bash
cd prapassar-app
npm run dev
```

Acesse: http://localhost:3000

### Passo 2: Fazer Login
- Faça login com suas credenciais
- Navegue até a página **Dashboard**

### Passo 3: Abrir Console e Recarregar
1. **Abra o console** (F12)
2. **Limpe o console** (botão 🚫 ou Ctrl+L)
3. **Recarregue a página** (F5 ou Ctrl+R)

### Passo 4: Observar Logs

**Procure por:**
```
⚡⚡⚡ === WATCHEFFECT DISPARADO ===
```

**Logs que DEVEM aparecer:**
```
⚡⚡⚡ === WATCHEFFECT DISPARADO ===
👤 user.value?.id: undefined (ou um UUID)
🔍 Buscando user_id da sessão Supabase...
📍 user_id da sessão: 0b17dba0-7c78-4c43-a2cf-f6d89... ← TEM ID!
✅ USER_ID disponível
📅 Chamando loadCalendarData...
📅📅📅 === INÍCIO: loadCalendarData ===
🔄 Chamando fetchActivities...
🔄🔄🔄 === INÍCIO: fetchActivities ===
✅ Usuário autenticado: 0b17dba0-...
📊 Quantidade de registros retornados: 13 ← ENCONTROU!
✅✅✅ Atividades processadas e armazenadas
📊 calendarActivities.length: 13
✅ Calendário carregado com sucesso!
```

**✅ Se esses logs aparecerem:** Carregamento funcionou!
**❌ Se parar em "Buscando user_id":** Problema de autenticação

---

## ✅ TESTE 3: Verificar Visualmente no Calendário

### Passo 1: Olhar a Seção de Calendário

Na página Dashboard, role até a seção **"Calendário de Estudos"**.

**O que você DEVE ver:**
- **Estatísticas:**
  - "Carga Horária Semanal: 18.5h" (ou similar)
  - "Atividades Concluídas: 0/13" (ou similar)
- **Calendário:**
  - **Atividades visíveis** nos dias com blocos coloridos
  - Horários e títulos das atividades

**✅ Se as atividades aparecerem:** SUCESSO TOTAL!
**❌ Se o calendário estiver vazio:** Problema de renderização

---

## ✅ TESTE 4: Criar Nova Atividade e Verificar Persistência

### Passo 1: Criar Atividade
1. Clique em **"Nova Atividade"**
2. Preencha:
   - **Tipo:** Estudo
   - **Matéria:** Selecione uma existente (ex: Matemática)
   - **Título:** "Teste de Persistência"
   - **Data:** Hoje
   - **Hora:** 15:00
   - **Duração:** 1h
3. Clique em **"Salvar"**

### Passo 2: Verificar Criação
**No console, procure:**
```
🆕🆕🆕 === INÍCIO: createActivity === 🆕🆕🆕
✅ Usuário autenticado: [UUID]
📝 Tentando inserir atividade na tabela study_schedules...
✅ Inserção executada com sucesso!
📊 Atividade criada com ID: [UUID]
✅✅✅ createActivity concluído com sucesso
```

**Visualmente:**
- Atividade DEVE aparecer no calendário imediatamente

### Passo 3: Recarregar Página
1. **Pressione F5** (recarregar)
2. **Aguarde carregamento**
3. **Verifique se a atividade "Teste de Persistência" continua aparecendo**

**✅ Se aparecer após F5:** PERSISTÊNCIA FUNCIONA!
**❌ Se sumir após F5:** PERSISTÊNCIA FALHOU!

---

## ✅ TESTE 5: Navegar Entre Páginas

### Passo 1: Navegar para Outra Página
- Clique em **"Metas"** no menu lateral

### Passo 2: Voltar para Dashboard
- Clique em **"Dashboard"** no menu lateral

### Passo 3: Verificar Calendário
**As atividades DEVEM continuar aparecendo!**

**✅ Se aparecerem:** Navegação não afeta dados!
**❌ Se sumirem:** Problema no `onMounted` ou `watchEffect`

---

## ✅ TESTE 6: Marcar Atividade Como Concluída

### Passo 1: Clicar em Uma Atividade
- Clique em uma atividade no calendário
- Modal deve abrir

### Passo 2: Marcar Como Concluída
- Clique no botão **"Marcar como Concluída"**

**No console, procure:**
```
🔄 === INÍCIO: updateActivity === 🔄
✅ Usuário autenticado via session: [UUID]
✅ Atualização executada com sucesso
✅✅✅ updateActivity concluído
```

**Visualmente:**
- Botão deve mudar para **"✓ Concluída"** com fundo verde
- Contador "Atividades Concluídas" deve aumentar

### Passo 3: Recarregar e Verificar
- **F5** para recarregar
- Atividade DEVE continuar marcada como concluída

**✅ Se continuar marcada:** Toggle funciona!
**❌ Se voltar para pendente:** Update não persiste!

---

## ✅ TESTE 7: Deletar Atividade

### Passo 1: Clicar em Uma Atividade
- Clique em uma atividade no calendário
- Modal deve abrir

### Passo 2: Deletar
- Clique no botão **"Excluir"** (ícone de lixeira)
- Confirme a exclusão

**No console, procure:**
```
🗑️ === INÍCIO: deleteActivity === 🗑️
✅ Usuário autenticado via session: [UUID]
✅ Exclusão executada com sucesso
✅✅✅ deleteActivity concluído
```

**Visualmente:**
- Atividade DEVE desaparecer do calendário imediatamente
- Contador "Atividades" deve diminuir

### Passo 3: Recarregar e Verificar
- **F5** para recarregar
- Atividade NÃO deve reaparecer

**✅ Se não reaparecer:** Delete funciona!
**❌ Se reaparecer:** Delete não persiste!

---

## 📊 RESUMO DOS RESULTADOS

Após executar todos os testes, preencha:

| Teste | Resultado | Observações |
|-------|-----------|-------------|
| 1. Dados no banco | ☐ PASS ☐ FAIL | Quantos registros: ___ |
| 2. Console logs | ☐ PASS ☐ FAIL | user_id encontrado: ☐ SIM ☐ NÃO |
| 3. Atividades visíveis | ☐ PASS ☐ FAIL | Quantidade visível: ___ |
| 4. Criar + Persistir | ☐ PASS ☐ FAIL | Atividade persiste após F5: ☐ SIM ☐ NÃO |
| 5. Navegação | ☐ PASS ☐ FAIL | Atividades mantêm após navegar: ☐ SIM ☐ NÃO |
| 6. Toggle concluída | ☐ PASS ☐ FAIL | Status persiste após F5: ☐ SIM ☐ NÃO |
| 7. Deletar | ☐ PASS ☐ FAIL | Atividade não reaparece: ☐ SIM ☐ NÃO |

---

## 🚨 SE ALGUM TESTE FALHAR

### Me envie:
1. ✅ **Nome do teste que falhou**
2. ✅ **Logs completos do console**
3. ✅ **Screenshot do erro**
4. ✅ **Resultado da query SQL (Teste 1)**

---

**🎯 EXECUTAR TODOS OS 7 TESTES E ME REPORTAR OS RESULTADOS! 🎯**

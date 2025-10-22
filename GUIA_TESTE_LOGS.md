# 🔍 Guia de Teste com Logs Detalhados

## ✅ LOGS ADICIONADOS COM SUCESSO!

Foram adicionados logs extremamente detalhados em 3 pontos críticos:
1. **ActivityModal.vue** - Onde o formulário é preenchido e validado
2. **Dashboard.vue** - Onde o evento de salvamento é tratado
3. **useStudySchedule.ts** - Onde a atividade é salva no banco de dados

---

## 🎯 COMO TESTAR AGORA

### Passo 1: Abrir o Console do Navegador (30 segundos)

1. Abra a aplicação PraPassar
2. Pressione **F12** (ou Ctrl+Shift+I)
3. Clique na aba **Console**
4. **IMPORTANTE:** Clique com botão direito no console e selecione **"Clear console"** para limpar
5. Deixe o console aberto e visível

---

### Passo 2: Tentar Criar uma Atividade (1 minuto)

1. No Dashboard, clique em **"Nova Atividade"**
2. Preencha o formulário:
   - Escolha **"Estudar"** ou **"Evento"**
   - Se for Estudar: selecione uma matéria
   - Preencha título (ex: "Teste de salvamento")
   - Escolha data de hoje
   - Escolha horário (qualquer um)
   - Deixe duração padrão (60min)
3. **ANTES DE CLICAR EM SALVAR:** Olhe o console (deve estar vazio ou com poucos logs)
4. Clique em **"Criar Atividade"**

---

### Passo 3: Observar os Logs (2 minutos)

**O console vai ficar CHEIO de logs!** Isso é esperado. Vamos ler eles em ordem:

#### 🟢 LOGS ESPERADOS (Tudo Funcionando):

```
🎬🎬🎬 === INÍCIO: handleSave (ActivityModal) ===
✔️ VALIDAÇÃO 1: Verificando título...
✅ Título OK: Teste de salvamento
✔️ VALIDAÇÃO 2: Verificando matéria...
✅ Matéria OK: abc-123-...
✔️ VALIDAÇÃO 3: Verificando data e horário...
✅ Data OK: 2025-10-22
✅ Horário OK: 14:00
✔️ VALIDAÇÃO 4: Verificando duração...
✅ Duração OK: 60 minutos
📦 Preparando payload...
✅✅✅ Payload final preparado: {...}
⏳ Ativando loading...
➕ Modo: CRIAÇÃO (save)
🚀 Emitindo evento "save"...
✅ Evento "save" emitido
🏁 === FIM: handleSave (ActivityModal) ===

🌟🌟🌟 === INÍCIO: handleSaveActivity (Dashboard) ===
📦 Payload recebido do modal: {...}
📞 Chamando createActivity do composable...

🎬 === INÍCIO: createActivity ===
📊 Payload recebido: {...}
🔐 PASSO 1: Verificando autenticação...
✅ Usuário autenticado: xyz-789-...
📝 PASSO 2: Preparando dados para inserção...
📦 Dados preparados para inserção: {...}
🚀 PASSO 3: Enviando para o banco de dados...
📬 Resposta recebida do banco
✅✅✅ ATIVIDADE CRIADA COM SUCESSO ✅✅✅
🎉 Dados retornados: {...}
🔄 PASSO 4: Processando resposta...
✨ Atividade processada: {...}
📋 PASSO 5: Adicionando à lista local...
✅ Lista atualizada. Total de atividades: 1
🏁 === FIM: createActivity (SUCESSO) ===

✅✅✅ Atividade criada com sucesso! ✅✅✅
🚪 Fechando modal...
🏁 === FIM: handleSaveActivity (SUCESSO) ===
```

**Se você ver isso: PARABÉNS! Funcionou! 🎉**

---

#### 🔴 LOGS DE ERRO (Algo Deu Errado):

O erro pode acontecer em diferentes pontos. Veja onde parou:

##### **ERRO 1: Parou nas Validações**
```
🎬🎬🎬 === INÍCIO: handleSave (ActivityModal) ===
✔️ VALIDAÇÃO 1: Verificando título...
❌ Validação falhou: título vazio
```
**Significado:** Campo obrigatório não foi preenchido
**Solução:** Preencha todos os campos e tente novamente

---

##### **ERRO 2: Parou na Autenticação**
```
🎬 === INÍCIO: createActivity ===
🔐 PASSO 1: Verificando autenticação...
❌ Usuário não autenticado ou session.user.id está undefined
```
**Significado:** Você não está logado ou a sessão expirou
**Solução:** Faça logout e login novamente

---

##### **ERRO 3: Parou no Envio ao Banco (MAIS COMUM)**
```
🚀 PASSO 3: Enviando para o banco de dados...
📬 Resposta recebida do banco
❌❌❌ ERRO AO INSERIR NO BANCO ❌❌❌
Código do erro: XXXXX
Mensagem: [mensagem do erro]
Detalhes: [detalhes]
```

**Este é o erro mais importante!** Copie TODA a seção de erro e veja qual mensagem apareceu:

**Possíveis mensagens e soluções:**

| Mensagem | Significado | Solução |
|----------|-------------|---------|
| "permission denied" / "policy" | RLS bloqueando | Criar/ajustar políticas RLS |
| "null value in column" | Campo obrigatório vazio | Verificar quais campos são obrigatórios |
| "foreign key violation" | Matéria não existe | Verificar se matéria existe no banco |
| "table does not exist" | Tabela não foi criada | Executar migração SQL |
| "column does not exist" | Coluna faltando | Executar migração SQL |

---

### Passo 4: Copiar os Logs (1 minuto)

**MUITO IMPORTANTE:**

1. Clique com botão direito no console
2. Selecione **"Save as..."** ou **"Copy all"**
3. Salve em um arquivo .txt ou cole em um documento
4. **Me envie TODOS os logs**, principalmente:
   - Os logs com ❌❌❌ (erros)
   - A seção "ERRO AO INSERIR NO BANCO" se aparecer
   - A linha que diz "Código do erro:" e "Mensagem:"

---

## 🎯 O QUE FAZER COM OS RESULTADOS

### Se Deu Sucesso (✅✅✅):
- **ÓTIMO!** A atividade deve ter sido salva
- Recarregue a página (F5) e veja se a atividade aparece
- Se aparecer: problema resolvido!
- Se não aparecer: há um problema na visualização (me avise)

### Se Deu Erro (❌❌❌):
- **NÃO se preocupe!** É exatamente isso que precisamos
- Copie TODOS os logs do console
- Me envie junto com:
  - Em qual PASSO parou (1, 2, 3, 4 ou 5)?
  - Qual foi a mensagem de erro exata?
  - O que você estava tentando criar (estudo ou evento)?

---

## 📊 INTERPRETANDO OS LOGS

### Fluxo Normal (Esperado):
```
ActivityModal → Validações ✅
               ↓
Dashboard → Recebe evento ✅
               ↓
useStudySchedule → Verifica auth ✅
                 → Prepara dados ✅
                 → Envia ao banco ✅
                 → Recebe resposta ✅
                 → Processa ✅
                 → Adiciona à lista ✅
               ↓
Dashboard → Fecha modal ✅
          → Recarrega calendário ✅
```

### Se Algo Falhar:
O log vai mostrar EXATAMENTE onde parou e por quê!

---

## 🚨 ERROS COMUNS E SOLUÇÕES RÁPIDAS

### 1. "new row violates row-level security policy"
**Causa:** RLS está bloqueando a inserção
**Solução:** Executar script de políticas RLS

### 2. "relation 'study_schedules' does not exist"
**Causa:** Tabela não foi criada
**Solução:** Executar migração SQL

### 3. "null value in column 'xxx' violates not-null constraint"
**Causa:** Campo obrigatório não está sendo enviado
**Solução:** Verificar quais campos são obrigatórios

### 4. "insert or update on table violates foreign key constraint"
**Causa:** Tentando usar uma matéria que não existe
**Solução:** Criar a matéria primeiro ou usar NULL para eventos

---

## ✅ CHECKLIST DE TESTE

Antes de me enviar os logs, confirme:

- [ ] Limpei o console antes de testar (Clear console)
- [ ] Mantive o console aberto e visível durante o teste
- [ ] Cliquei em "Criar Atividade" e esperei alguns segundos
- [ ] Vi logs aparecerem no console (muitos logs coloridos)
- [ ] Copiei TODOS os logs, não apenas uma parte
- [ ] Se houve erro, copiei a seção ❌❌❌ completa
- [ ] Anotei em qual PASSO o processo parou

---

## 🎓 DICA PROFISSIONAL

Os logs estão organizados em "seções" fáceis de identificar:

- 🎬 = Início de um processo
- ✅ = Algo funcionou corretamente
- ❌ = Algo deu errado
- 📊 = Mostrando dados/informações
- 🚀 = Enviando algo
- 📬 = Recebendo resposta
- 🏁 = Fim de um processo

Procure onde os ✅ param de aparecer e os ❌ começam!

---

## 📞 PRÓXIMOS PASSOS

1. **Execute o teste agora**
2. **Copie os logs**
3. **Me envie dizendo:**
   - ✅ Funcionou! ou ❌ Deu erro
   - Se deu erro: qual foi a mensagem
   - Anexe os logs completos

Com esses logs detalhados, vou identificar **EXATAMENTE** o que está impedindo o salvamento! 🎯

---

**Tempo estimado:** 5 minutos para teste completo
**Dificuldade:** Fácil (só seguir o passo a passo)
**Resultado:** Identificação precisa do problema! 🔍

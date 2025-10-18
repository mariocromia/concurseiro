# 🚨 COMO RESOLVER O ERRO DO CRONÔMETRO - PASSO A PASSO

## ❌ Problema Atual

Você está vendo estes erros no console (F12):

```
❌ Error ao iniciar timer: FetchError: [POST] "/api/study-timer/start": 500 Server Error
❌ POST http://localhost:3000/api/study-timer/start 500 (Server Error)
❌ Uncaught (in promise) FetchError: [POST] "/api/study-timer/start": 500 Server Error
```

**Causa:** A tabela `study_timers` NÃO EXISTE no banco de dados Supabase.

---

## ✅ SOLUÇÃO (5 minutos)

### PASSO 1: Abrir Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto **PraPassar**
4. No menu lateral esquerdo, clique em **SQL Editor**

### PASSO 2: Executar SQL

1. Clique em **"+ New query"** (botão verde)
2. **COPIE TODO O CONTEÚDO** do arquivo: `c:\prapassar\EXECUTE_AGORA.sql`
3. **COLE** no editor SQL do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl+Enter`)

### PASSO 3: Verificar Sucesso

Você deve ver na parte inferior:

```
✅ Tabela study_timers criada com sucesso!
✅ tablename: study_timers, schemaname: public
```

### PASSO 4: Atualizar Navegador

1. Volte para `http://localhost:3000/study`
2. Pressione `F5` para recarregar
3. Selecione uma matéria
4. Clique **"Iniciar Sessão"**

### PASSO 5: Verificar se Funcionou

Deve aparecer:

✅ No console (F12):
```
✅ Timer iniciado: (novo)
🕐 FloatingTimer montado. Estado do timer: { isRunning: true, ... }
```

✅ Na tela:
- Timer começa a contar: `00:00:01`, `00:00:02`, etc.
- FloatingTimer aparece no canto superior direito

---

## 🔍 SE AINDA NÃO FUNCIONAR

### Debug 1: Verificar se tabela existe

No SQL Editor do Supabase, execute:

```sql
SELECT * FROM study_timers LIMIT 1;
```

- **Se retornar erro "relation does not exist"** → A migration não foi executada corretamente
- **Se retornar vazio (0 rows)** → Tabela existe, problema é outro

### Debug 2: Verificar console do navegador

Pressione `F12` → aba **Console**

Procure por:
- ❌ Erros em vermelho começando com "Error ao iniciar timer"
- ❌ Erros 500 nas chamadas `/api/study-timer/*`
- ✅ Mensagens "Timer iniciado" (se funcionou)

### Debug 3: Verificar logs do servidor Nuxt

No terminal onde está rodando `npm run dev`, procure por:

```
❌ [nuxt] [error] Error in API route /api/study-timer/start
❌ relation "study_timers" does not exist
```

### Debug 4: Testar API manualmente

No console do navegador (F12), execute:

```javascript
// Testar se API responde
fetch('/api/study-timer/active')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)

// Deve retornar:
// { hasActiveTimer: false, timer: null }
// OU
// { hasActiveTimer: true, timer: {...} }
```

---

## 📋 Checklist Final

- [ ] Executei o SQL `EXECUTE_AGORA.sql` no Supabase
- [ ] Vi a mensagem "Tabela study_timers criada com sucesso!"
- [ ] Recarreguei a página `http://localhost:3000/study`
- [ ] Selecionei uma matéria no dropdown
- [ ] Cliquei no botão "Iniciar Sessão"
- [ ] O timer começou a contar (00:00:01, 00:00:02...)
- [ ] O FloatingTimer apareceu no canto superior direito
- [ ] Não há erros 500 no console do navegador

---

## 🎯 O que Acontece Após Migration

**Antes (SEM tabela):**
```
Cliente → POST /api/study-timer/start → ❌ 500 Error (tabela não existe)
Timer fica parado em 00:00:00
FloatingTimer não aparece
```

**Depois (COM tabela):**
```
Cliente → POST /api/study-timer/start → ✅ 200 OK
Servidor cria registro: { id, user_id, start_time, is_running: true }
Timer começa: 00:00:01 → 00:00:02 → 00:00:03
FloatingTimer aparece com tempo correto
```

---

## 📞 Ainda com Problema?

Se após executar a migration o timer ainda não funcionar:

1. **Capture screenshot do erro no console (F12)**
2. **Copie os logs do terminal `npm run dev`**
3. **Execute no Supabase SQL Editor:**
   ```sql
   SELECT * FROM study_timers;
   SELECT count(*) FROM study_timers;
   ```
4. **Forneça essas informações para debug**

---

**⏰ Tempo estimado para resolver: 5 minutos**

**Prioridade: CRÍTICA - Sistema não funciona sem a migration!**

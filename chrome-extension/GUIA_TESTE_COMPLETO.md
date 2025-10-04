# Guia de Teste - Extensão Concurseiro

## 🔧 Preparação

1. **Recarregar extensão**: `chrome://extensions/` → Botão reload (↻)
2. **Reiniciar servidor**: `Ctrl+C` → `npm run dev`
3. **Abrir console da extensão**:
   - `chrome://extensions/`
   - Clicar em "Service Worker" na extensão Concurseiro

---

## ✅ Teste 1: Login Compartilhado

### App → Extensão
1. Fazer login no app web (localhost:3000)
2. Abrir popup da extensão
3. **Resultado esperado**: Deve estar logado automaticamente

### Extensão → App
1. Fazer logout no app
2. Fazer login na extensão (popup)
3. Recarregar página do app
4. **Resultado esperado**: Deve estar logado no app

---

## ✅ Teste 2: Reconhecimento de Sessão de Estudo

1. Fazer login no app
2. Ir para página de Estudo
3. Iniciar timer (escolher matéria e clicar em Iniciar)

### Verificar no Console do APP:
```
✅ Timer iniciado - sessão e dados enviados para extensão
```

### Verificar no Console da PÁGINA (F12):
```
📬 [Content Script] Mensagem recebida: AUTH_SESSION
📬 [Content Script] Mensagem recebida: STUDY_SESSION_STARTED
✅ [Content Script] STUDY_SESSION_STARTED enviado
```

### Verificar no Console do SERVICE WORKER (extensão):
```
🔐 Auth session updated
▶️ Study session STARTED {subjectId: ..., studyType: ...}
🔍 Loading blocked sites...
📋 Sites bloqueados carregados: X sites
🚫 Lista: ["facebook.com", "instagram.com", ...]
```

### Verificar ícone da extensão:
- Deve ter badge 📚 verde

---

## ✅ Teste 3: Bloqueio de Sites

**IMPORTANTE**: Primeiro certifique que a sessão está ativa (Teste 2)

1. Com timer rodando, tentar acessar: `facebook.com`

### Verificar no Console do SERVICE WORKER:
```
📍 URL changed: https://facebook.com | Study mode: true | Blocked sites: 6
🔍 Checking facebook.com → 🚫 BLOCKED
🚫 BLOQUEANDO SITE: facebook.com
```

2. **Resultado esperado**:
   - Deve redirecionar para página de bloqueio
   - OU mostrar mensagem de bloqueio

3. Tentar outros sites bloqueados:
   - instagram.com
   - twitter.com
   - tiktok.com
   - netflix.com

---

## ✅ Teste 4: Pausar/Retomar Timer

1. Iniciar timer
2. Clicar em "Pausar"

### Verificar Console SERVICE WORKER:
```
⏸️ Study session PAUSED
```

### Verificar ícone: Badge deve mudar para ⏸️

3. Tentar acessar facebook.com
   - **Deve permitir** (não bloquear quando pausado)

4. Clicar em "Retomar"

### Verificar Console:
```
▶️ Study session RESUMED
```

### Verificar: Badge volta para 📚

---

## ✅ Teste 5: Encerrar Timer

1. Clicar em "Encerrar"

### Verificar Console SERVICE WORKER:
```
⏹️ Study session STOPPED
```

### Verificar:
- Badge desaparece
- Sites não são mais bloqueados

---

## 🐛 Troubleshooting

### Problema: Extensão não reconhece sessão ativa

**Verificar no console do Service Worker:**
- Se `Study mode: false` → A mensagem STUDY_SESSION_STARTED não chegou
- Se `Blocked sites: 0` → Sites não foram carregados

**Solução**:
1. Verificar se usuário está autenticado: `getUser()` retorna usuário?
2. Verificar se tabela `user_block_settings` existe no banco

### Problema: Sites não são bloqueados

**Verificar:**
1. `isStudyMode` está `true`?
2. `blockedSites` tem elementos?
3. Log `🔍 Checking` aparece quando acessa o site?

**Se sim mas não bloqueia:**
- Verificar se `block-overlay.html` existe em `chrome-extension/assets/`

### Problema: Sessão desativa sozinha

**Verificar:**
1. Se app encerrou o timer automaticamente
2. Se service worker reiniciou (perde estado)
3. Se `chrome.storage.local` está salvando corretamente

---

## 📊 Sites Bloqueados por Padrão

### Modo Moderate (padrão):
- facebook.com
- instagram.com
- twitter.com
- tiktok.com
- netflix.com
- primevideo.com

### Modo Strict (adiciona):
- youtube.com
- reddit.com
- twitch.tv
- discord.com
- whatsapp.com
- telegram.org

---

## 🔍 Logs Importantes

### Quando funciona corretamente:

1. **Ao iniciar timer:**
```
[Extension] ▶️ Study session STARTED
[Extension] 🔍 Loading blocked sites...
[Extension] 📋 Sites bloqueados carregados: 6 sites
[Extension] 🚫 Lista: ["facebook.com", ...]
```

2. **Ao acessar site bloqueado:**
```
[Extension] 📍 URL changed: https://facebook.com | Study mode: true | Blocked sites: 6
[Extension] 🔍 Checking facebook.com → 🚫 BLOCKED
[Extension] 🚫 BLOQUEANDO SITE: facebook.com
```

3. **Ao pausar:**
```
[Extension] ⏸️ Study session PAUSED
```

4. **Ao acessar site com timer pausado:**
```
[Extension] 📍 URL changed: https://facebook.com | Study mode: false | Blocked sites: 6
[Extension] ℹ️ Not in study mode, not blocking: facebook.com
```

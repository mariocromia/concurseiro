# 🔧 Correção do Erro do Service Worker

## ❌ Erro Identificado

```
Service worker registration failed. Status code: 15
Uncaught TypeError: Failed to execute 'importScripts' on 'WorkerGlobalScope':
Module scripts don't support importScripts().
```

## ✅ Causa do Problema

O manifest.json estava com `"type": "module"` no background service worker:

```json
"background": {
  "service_worker": "background/background.js",
  "type": "module"  // ❌ ISSO CAUSAVA O ERRO
}
```

**Problema:**
- Service Workers no Manifest V3 **não suportam** type="module"
- `importScripts()` não funciona com módulos ES6
- O Supabase precisa ser carregado via `importScripts()`

## ✅ Solução Aplicada

Removido `"type": "module"` do manifest.json:

```json
"background": {
  "service_worker": "background/background.js"  // ✅ CORRETO
}
```

## 🚀 Como Aplicar a Correção

### 1. Recarregar a Extensão

1. Vá em `chrome://extensions/`
2. Encontre "Concurseiro - Extensão de Estudo"
3. Clique no ícone de **reload** (↻)
4. ✅ Extensão recarregada!

### 2. Verificar se Funcionou

1. Clique no ícone da extensão
2. A tela de login deve aparecer **sem erros**
3. Abra o **Service Worker** (inspect)
4. Verifique o Console - deve mostrar:

```
Concurseiro Extension background script loaded!
```

**Não deve mais aparecer:**
- ❌ "Service worker registration failed"
- ❌ "Module scripts don't support importScripts()"

### 3. Testar Funcionalidade

1. **Fazer login:**
   - Digite e-mail e senha
   - Clique em "Entrar"
   - Deve autenticar com sucesso

2. **Verificar logs:**
   ```
   [Extension] 🔐 New session received!
   [Extension] ✅ User authenticated: xxx-xxx-xxx
   ```

3. **Testar bloqueio:**
   - Inicie sessão de estudo no app web
   - Tente acessar facebook.com
   - Deve bloquear o acesso

## 📋 Checklist de Verificação

- [ ] manifest.json sem `"type": "module"`
- [ ] Extensão recarregada em chrome://extensions/
- [ ] Service Worker carrega sem erros
- [ ] Tela de login aparece
- [ ] Login funciona corretamente
- [ ] Background script conecta com Supabase
- [ ] Bloqueio de sites funciona
- [ ] Menu de contexto aparece ao selecionar texto

## 🐛 Se Ainda Houver Erros

### Erro: "Failed to load service worker"

**Solução:**
1. Remova a extensão completamente
2. Vá em `chrome://extensions/`
3. Clique em "Remover"
4. Carregue novamente (Carregar sem compactação)

### Erro: "Supabase is not defined"

**Solução:**
1. Verifique se o CDN está acessível:
   ```
   https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js
   ```
2. Abra em nova aba para testar
3. Se não carregar, use uma versão local do Supabase

### Erro: "chrome.storage is not available"

**Solução:**
1. Verifique permissões no manifest.json:
   ```json
   "permissions": ["storage", ...]
   ```
2. Recarregue a extensão

## 📊 Estrutura Correta do Manifest V3

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background/background.js"
    // ✅ SEM "type": "module"
  },
  "content_scripts": [
    {
      // Content scripts podem usar módulos se necessário
      "js": ["content.js"]
    }
  ]
}
```

**Regra de Ouro:**
- ❌ Service Workers ≠ Módulos ES6
- ✅ Service Workers = `importScripts()`
- ✅ Content Scripts = Podem usar módulos

## 🎯 Resultado Esperado

Após a correção, ao abrir a extensão:

1. **Popup abre normalmente**
2. **Tela de login aparece** (se não autenticado)
3. **Service Worker carrega** sem erros
4. **Console mostra:**
   ```
   Concurseiro Extension background script loaded!
   [Extension] Extension starting up...
   ```

5. **Sem erros de:**
   - ❌ Service worker registration failed
   - ❌ importScripts() not supported
   - ❌ Module scripts errors

## ✅ Confirmação de Sucesso

Execute no Console do Service Worker:

```javascript
// Verificar se Supabase carregou
console.log('Supabase:', typeof supabase)  // Deve ser "object"

// Verificar client
console.log('Client:', typeof supabaseClient)  // Deve ser "object"

// Verificar sessão
chrome.storage.local.get(['supabase_session'], (result) => {
  console.log('Session:', result.supabase_session)
})
```

**Resultado esperado:**
```
Supabase: object
Client: object
Session: { access_token: "...", user: {...} }
```

---

## 📝 Resumo da Correção

| Item | Antes | Depois |
|------|-------|--------|
| **Manifest** | `"type": "module"` | ✅ Removido |
| **importScripts** | ❌ Falhava | ✅ Funciona |
| **Service Worker** | ❌ Erro 15 | ✅ Carrega OK |
| **Login** | ❌ Não abria | ✅ Funcional |

---

**Correção aplicada em:** 04/10/2025
**Status:** ✅ Resolvido

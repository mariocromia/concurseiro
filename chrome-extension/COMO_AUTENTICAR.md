# 🔐 Como Autenticar a Extensão no Supabase

## ⚠️ Problema Identificado

A extensão não detecta sessões porque **não está autenticada** no Supabase!

O Supabase usa Row Level Security (RLS) - só mostra dados se você estiver logado.

## ✅ Solução: Sincronizar Auth entre App e Extensão

### Método 1: Usar Cookie de Sessão (RECOMENDADO)

Quando você faz login no app web (localhost:3000), o Supabase cria uma sessão.
Precisamos copiar essa sessão para a extensão.

#### Passo a Passo:

1. **Fazer Login no App Web**
   - Abra: `http://localhost:3000`
   - Faça login normalmente

2. **Abrir DevTools do App**
   - Pressione `F12`
   - Vá na aba **Console**

3. **Copiar Sessão do Supabase**
   - Cole este código no console:
   ```javascript
   // Pegar sessão do Supabase
   const session = await $nuxt.$supabase.auth.getSession()
   console.log('Sessão:', session.data.session)

   // Copiar para clipboard
   copy(JSON.stringify(session.data.session))
   console.log('✅ Sessão copiada! Cole na extensão.')
   ```

4. **Colar na Extensão**
   - Clique no ícone da extensão
   - Abra **DevTools da extensão** (clique direito → Inspecionar)
   - No Console, cole:
   ```javascript
   // Colar a sessão (substitua SESSION_AQUI pelo que copiou)
   const session = SESSION_AQUI

   // Salvar no storage
   chrome.storage.local.set({ supabase_session: session })
   console.log('✅ Sessão salva na extensão!')
   ```

5. **Recarregar Extensão**
   - Vá em: `chrome://extensions/`
   - Clique no ícone de reload (↻) da extensão

6. **Testar**
   - Abra o DevTools da extensão (Service Worker)
   - Deve aparecer logs como:
   ```
   [Extension] ✅ User authenticated: xxx-xxx-xxx
   [Extension] ✅ Active session found!
   ```

### Método 2: Auto-Sync (Código Melhorado)

Vou criar um arquivo que sincroniza automaticamente:

#### Adicionar ao App Web:

Crie um arquivo `app/plugins/extension-sync.client.ts`:

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const supabase = useSupabaseClient()

  // Detectar se extensão está instalada
  const EXTENSION_ID = 'SEU_EXTENSION_ID_AQUI' // Pegar em chrome://extensions/

  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth changed:', event)

    if (event === 'SIGNED_IN' && session) {
      // Enviar sessão para extensão
      if (window.chrome && chrome.runtime) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: 'AUTH_SESSION',
            session: session
          },
          (response) => {
            console.log('Sessão enviada para extensão:', response)
          }
        )
      }

      // Também salvar no storage compartilhado
      localStorage.setItem('supabase_session', JSON.stringify(session))
    }
  })
})
```

#### Adicionar na Extensão:

No `background/background.js`, adicionar no início:

```javascript
// Escutar mensagens do app web
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTH_SESSION') {
    console.log('[Extension] Sessão recebida do app web!')

    // Salvar sessão
    chrome.storage.local.set({
      supabase_session: request.session
    })

    // Autenticar Supabase
    supabaseClient.auth.setSession(request.session)

    // Verificar sessão imediatamente
    checkActiveSession()

    sendResponse({ success: true })
  }
  return true
})

// Também tentar ler do localStorage compartilhado
async function tryLoadSessionFromLocalStorage() {
  // Injetar script na aba do app para ler localStorage
  const tabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' })

  if (tabs.length > 0) {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => localStorage.getItem('supabase_session')
    })

    if (result && result[0].result) {
      const session = JSON.parse(result[0].result)
      await chrome.storage.local.set({ supabase_session: session })
      await supabaseClient.auth.setSession(session)
      console.log('[Extension] Sessão carregada do localStorage!')
    }
  }
}

// Tentar carregar ao iniciar
setTimeout(tryLoadSessionFromLocalStorage, 3000)
```

### Método 3: Token Compartilhado

Alternativamente, use um token de acesso compartilhado:

1. No Supabase Dashboard:
   - Settings → API → Service Role Key (⚠️ CUIDADO - não compartilhar)

2. Use esse token na extensão (apenas para dev/teste)

## 🧪 Como Verificar se Funcionou

1. **Ver Logs da Extensão:**
   ```
   chrome://extensions/
   → Concurseiro Extension
   → Service Worker (inspect)
   → Console
   ```

2. **Deve aparecer:**
   ```
   [Extension] ✅ User authenticated: abc-123
   [Extension] 🔍 Checking for active session...
   [Extension] ✅ Active session found!
   ```

3. **Iniciar Sessão no App:**
   - Vá no Timer
   - Inicie uma sessão
   - Em até 10 segundos deve aparecer notificação da extensão

4. **Badge deve mudar:**
   - Ícone da extensão deve mostrar "🔥"

## 🔧 Debug

Se não funcionar, verifique:

```javascript
// No console da extensão:
chrome.storage.local.get(['supabase_session'], (result) => {
  console.log('Sessão armazenada:', result.supabase_session)
})

// Verificar se usuário está autenticado
const { data } = await supabaseClient.auth.getUser()
console.log('Usuário:', data.user)
```

## 📝 Resumo

O problema é autenticação! Escolha um método:

✅ **Método 1** (Manual) - Rápido para testar
✅ **Método 2** (Auto-sync) - Melhor para produção
⚠️ **Método 3** (Token) - Apenas dev/teste

Após autenticar, a extensão vai:
- ✅ Detectar sessões automaticamente
- ✅ Bloquear sites
- ✅ Trackear tempo
- ✅ Sincronizar com app

---

**Qualquer dúvida, me avise!** 🚀

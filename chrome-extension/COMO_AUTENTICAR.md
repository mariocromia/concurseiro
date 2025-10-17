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

### Método 2: Auto-Sync (Código Melhorado) - RECOMENDADO PARA PRODUÇÃO

#### Passo 1: Pegar o Extension ID

1. Vá em: `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" no canto superior direito
3. Encontre a extensão "Concurseiro - Extensão de Estudo"
4. Copie o **ID** que aparece abaixo do nome (exemplo: `abcdefghijklmnopqrstuvwxyz123456`)

#### Passo 2: Adicionar Plugin ao App Web

Crie um arquivo `app/plugins/extension-sync.client.ts`:

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const supabase = useSupabaseClient()

  // IMPORTANTE: Substitua pelo ID da sua extensão (veja passo 1)
  const EXTENSION_ID = 'COLE_SEU_EXTENSION_ID_AQUI'

  // Sincronizar sessão quando houver mudanças de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[App] Auth changed:', event)

    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
      // Enviar sessão para extensão
      if (window.chrome?.runtime) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: 'AUTH_SESSION',
            session: session
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.log('[App] Extension não instalada ou ID incorreto')
            } else {
              console.log('[App] ✅ Sessão enviada para extensão:', response)
            }
          }
        )
      }
    }
  })
})
```

#### Passo 3: Testar

1. Recarregue o app web (`npm run dev`)
2. Faça logout e login novamente
3. Abra o DevTools da extensão (chrome://extensions/ → Service Worker → Console)
4. Deve aparecer:
   ```
   [Extension] 🔐 Session received from web app!
   [Extension] ✅ Session restored successfully!
   [Extension] ✅ User authenticated: xxx-xxx-xxx
   ```

**Nota:** A extensão já está preparada para receber a sessão do app! Não precisa modificar código na extensão.

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

# 🚀 Guia Rápido - Testar Extensão Chrome

## ✅ Problema Corrigido

O problema era que a extensão estava configurada para usar uma URL diferente do Supabase.

**Corrigido:**
- ✅ URLs do Supabase atualizadas na extensão
- ✅ Todas as 7 tabelas da extensão já existem no banco
- ✅ RLS (Row Level Security) configurado

---

## 📝 Passo a Passo para Testar

### 1. Carregar a Extensão no Chrome

1. Abra o Chrome
2. Digite na barra de endereços: `chrome://extensions/`
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **Carregar sem compactação**
5. Selecione a pasta: `C:\xampp\htdocs\consurseiro\concurseiro-app\chrome-extension`
6. A extensão "Concurseiro - Extensão de Estudo" deve aparecer

### 2. Iniciar o App Web

```bash
cd concurseiro-app
npm run dev
```

Aguarde o app iniciar em `http://localhost:3000`

### 3. Fazer Login no App

1. Acesse `http://localhost:3000`
2. Faça login com suas credenciais
3. Deixe a aba aberta

### 4. Autenticar a Extensão (IMPORTANTE!)

#### Opção A: Sincronização Automática (Recomendado)

1. Abra o DevTools do navegador (F12)
2. Vá na aba **Console**
3. Cole e execute este código:

```javascript
// Pegar a sessão atual do Supabase
const { data } = await $fetch('/api/auth/session')
const session = data.session

// Pegar o Extension ID
chrome.management.getAll((extensions) => {
  const ext = extensions.find(e => e.name.includes('Concurseiro'))
  if (ext) {
    console.log('📋 Extension ID:', ext.id)
    console.log('Cole este ID no arquivo mencionado abaixo')
  }
})
```

#### Opção B: Colar Sessão Manualmente (Mais Rápido)

1. Com o app web aberto e logado, aperte **F12**
2. Cole no console:

```javascript
const session = await $nuxt.$supabase.auth.getSession()
copy(JSON.stringify(session.data.session))
console.log('✅ Sessão copiada!')
```

3. Agora abra a extensão:
   - Vá em `chrome://extensions/`
   - Encontre "Concurseiro"
   - Clique em **Service Worker (inspect)**
   - No console que abrir, cole:

```javascript
const sessionData = /* COLE A SESSÃO AQUI */
chrome.storage.local.set({ supabase_session: sessionData })
console.log('✅ Sessão salva!')
```

4. Recarregue a extensão:
   - Volte em `chrome://extensions/`
   - Clique no ícone de reload (↻) da extensão

### 5. Verificar se Funcionou

1. Vá novamente em `chrome://extensions/`
2. Clique em **Service Worker (inspect)** na extensão
3. No console, você deve ver:

```
[Extension] ✅ User authenticated: xxx-xxx-xxx
[Extension] 🔍 Checking for active session...
```

### 6. Testar o Bloqueio de Sites

1. No app web, vá para o **Timer**
2. Inicie uma sessão de estudo (qualquer duração)
3. A extensão deve mostrar uma notificação:
   ```
   🔥 Sessão de Estudo Iniciada!
   Modo foco ativado. Sites de distração serão bloqueados.
   ```
4. Tente acessar `facebook.com` ou `instagram.com`
5. Você deve ver a página bloqueada com uma mensagem

### 7. Testar Captura de Questões

1. Abra qualquer site (ex: Wikipedia)
2. Selecione um texto
3. Clique com botão direito
4. Você deve ver as opções:
   - ✅ "Adicionar ao Caderno Concurseiro"
   - ✅ "Salvar para Revisão"
   - ✅ "Criar Flashcard"
   - ✅ "Adicionar aos Erros"

---

## 🔍 Como Verificar Logs

### Logs da Extensão (Background)

1. `chrome://extensions/`
2. Clique em **Service Worker (inspect)**
3. Vá na aba **Console**

### Logs do App Web

1. Abra o app no navegador
2. Pressione **F12**
3. Aba **Console**

---

## ⚠️ Problemas Comuns

### "Extensão não detecta sessão"

**Solução:** Autentique novamente seguindo o Passo 4

### "Sites não estão sendo bloqueados"

**Verifique:**
1. Se a sessão de estudo está ativa no app
2. Se a extensão está autenticada (veja logs)
3. Se o ícone da extensão mostra "🔥"

### "Menu de contexto não aparece"

**Solução:**
1. Recarregue a extensão em `chrome://extensions/`
2. Recarregue a página onde está tentando usar

---

## 📊 Tabelas da Extensão no Supabase

Todas criadas e funcionando:

✅ `user_block_settings` - Configurações de bloqueio
✅ `browsing_statistics` - Estatísticas de navegação
✅ `captured_notes` - Questões/notas capturadas
✅ `review_items` - Itens para revisão
✅ `error_log` - Registro de erros de questões
✅ `page_highlights` - Destaques em páginas
✅ `extension_settings` - Configurações gerais

---

## 🎯 Próximos Passos (Opcional)

### Implementar Auto-Sync entre App e Extensão

Crie o arquivo `app/plugins/extension-sync.client.ts`:

```typescript
export default defineNuxtPlugin((nuxtApp) => {
  const supabase = useSupabaseClient()

  // IMPORTANTE: Substitua pelo ID da sua extensão
  // Veja o ID em chrome://extensions/
  const EXTENSION_ID = 'SEU_EXTENSION_ID_AQUI'

  supabase.auth.onAuthStateChange((event, session) => {
    if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
      if (window.chrome?.runtime) {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: 'AUTH_SESSION',
            session: session
          },
          (response) => {
            if (!chrome.runtime.lastError) {
              console.log('[App] ✅ Sessão enviada para extensão')
            }
          }
        )
      }
    }
  })
})
```

Com isso, a autenticação será automática sempre que você fizer login!

---

## ✅ Checklist Final

- [ ] Extensão carregada no Chrome
- [ ] App web rodando em localhost:3000
- [ ] Login feito no app
- [ ] Extensão autenticada (sessão copiada)
- [ ] Logs da extensão mostram "User authenticated"
- [ ] Sessão de estudo iniciada no timer
- [ ] Notificação de "Sessão Iniciada" apareceu
- [ ] Sites de distração estão bloqueados
- [ ] Menu de contexto (botão direito) funciona

---

**Pronto!** A extensão está funcionando! 🎉

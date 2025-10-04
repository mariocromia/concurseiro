# 🔐 Guia de Login - Extensão Concurseiro

## ✨ Nova Funcionalidade: Login Direto na Extensão!

Agora você pode fazer login **diretamente na extensão** sem precisar do app web aberto!

---

## 🚀 Como Fazer Login

### Passo 1: Instalar a Extensão

1. Abra o Chrome
2. Acesse: `chrome://extensions/`
3. Ative o **Modo do desenvolvedor**
4. Clique em **Carregar sem compactação**
5. Selecione a pasta: `chrome-extension/`

### Passo 2: Fazer Login

1. **Clique no ícone** da extensão Concurseiro
2. Você verá a **tela de login**:
   ```
   ┌─────────────────────────┐
   │    Concurseiro         │
   │                        │
   │    Faça Login          │
   │    Entre com sua       │
   │    conta para          │
   │    sincronizar         │
   │                        │
   │    E-mail:             │
   │    [_____________]     │
   │                        │
   │    Senha:              │
   │    [_____________]     │
   │                        │
   │    [Entrar]            │
   │                        │
   │        ou              │
   │                        │
   │    [Abrir App Web]     │
   └─────────────────────────┘
   ```

3. **Digite seu e-mail e senha**
   - Use as mesmas credenciais do app web
   - Se não tem conta, clique em "Abrir App Web" para se cadastrar

4. **Clique em "Entrar"**
   - Um loader aparecerá enquanto autentica
   - Se der erro, uma mensagem será exibida

5. **✅ Pronto!**
   - Você verá a tela principal da extensão
   - O ícone mostrará suas estatísticas

---

## 🎯 Após o Login

Quando autenticado, você terá acesso a:

### Tela Principal da Extensão

```
┌─────────────────────────────────┐
│  Concurseiro            [Sair]  │
├─────────────────────────────────┤
│                                 │
│  🔥 Sessão de Estudo Ativa      │
│     Resolução de Questões       │
│     Tempo restante: 45min       │
│                                 │
├─────────────────────────────────┤
│                                 │
│   📚        📝        🎯        │
│   2h30     15        85%        │
│   Hoje   Capturadas  Foco       │
│                                 │
├─────────────────────────────────┤
│                                 │
│  [Abrir App]  [Configurações]   │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Capturas Recentes              │
│  • Questão de Dir. Const...     │
│  • Anotação sobre...            │
│                                 │
└─────────────────────────────────┘
```

### Funcionalidades Disponíveis

✅ **Ver sessão de estudo ativa**
- Tipo de estudo
- Tempo restante
- Status (ativo/inativo)

✅ **Estatísticas em tempo real**
- Tempo estudado hoje
- Questões capturadas
- Score de foco

✅ **Capturas recentes**
- Últimas questões salvas
- Anotações

✅ **Botão de Logout**
- Canto superior direito
- Desconecta e limpa dados

---

## 🔒 Segurança

### Como Funciona a Autenticação

1. **Você digita** e-mail e senha
2. **Extensão envia** para o Supabase (conexão segura HTTPS)
3. **Supabase valida** as credenciais
4. **Retorna um token** de acesso
5. **Extensão salva** o token localmente (criptografado)
6. **Background script** usa o token para acessar dados

### Dados Armazenados

A extensão armazena apenas:
```javascript
{
  supabase_session: {
    access_token: "xxx",
    refresh_token: "xxx",
    user: { id: "xxx", email: "xxx" }
  }
}
```

**Segurança:**
- ✅ Senha NUNCA é armazenada
- ✅ Tokens são criptografados
- ✅ Comunicação via HTTPS
- ✅ Row Level Security (RLS) no banco

---

## 🔄 Sincronização com App Web

### Login na Extensão → App Web

Quando você faz login na extensão:
1. ✅ Dados são sincronizados automaticamente
2. ✅ Sessões de estudo são detectadas
3. ✅ Capturas aparecem no app web
4. ✅ Estatísticas são atualizadas

### Login no App Web → Extensão (Opcional)

Se preferir fazer login no app web:

**Método 1: Auto-Sync (Futuro)**
- Plugin será adicionado ao app
- Sincroniza automaticamente

**Método 2: Manual (Atual)**
1. Faça login no app web
2. Clique na extensão
3. Faça login com mesmas credenciais

---

## ❌ Erros Comuns e Soluções

### "E-mail ou senha incorretos"

**Causa:** Credenciais inválidas

**Solução:**
1. Verifique se digitou corretamente
2. Certifique-se que é a mesma conta do app web
3. Se esqueceu a senha:
   - Clique em "Abrir App Web"
   - Clique em "Esqueci minha senha"

### "Por favor, confirme seu e-mail primeiro"

**Causa:** E-mail não confirmado

**Solução:**
1. Acesse sua caixa de entrada
2. Procure e-mail do Supabase
3. Clique no link de confirmação
4. Tente fazer login novamente

### "Erro ao fazer login. Tente novamente."

**Causa:** Problema de conexão ou servidor

**Solução:**
1. Verifique sua internet
2. Tente novamente em alguns segundos
3. Se persistir, verifique se o app web está funcionando

### Extensão não salva login

**Causa:** Cookies/Storage bloqueados

**Solução:**
1. Vá em `chrome://settings/content/cookies`
2. Verifique se "Permitir cookies" está ativado
3. Adicione exceção para `chrome-extension://`
4. Recarregue a extensão

---

## 🔓 Fazer Logout

### Método 1: Pelo Popup

1. Clique no ícone da extensão
2. Clique no botão **Sair** (canto superior direito)
3. ✅ Deslogado!

### Método 2: Pelas Configurações

1. Clique direito no ícone da extensão
2. Selecione "Opções"
3. Clique em "Sair da Conta"

### O que Acontece ao Fazer Logout

- ❌ Token de acesso é removido
- ❌ Sessão é limpa
- ❌ Bloqueio de sites é desativado
- ❌ Realtime é desconectado
- ✅ Você volta para a tela de login

**Nota:** Suas questões e dados permanecem salvos no banco de dados!

---

## 🧪 Testar o Login

### Passo a Passo

1. **Instale a extensão**
   ```
   chrome://extensions/ → Carregar sem compactação
   ```

2. **Clique no ícone da extensão**
   - Deve aparecer a tela de login

3. **Digite suas credenciais**
   - E-mail: seu@email.com
   - Senha: ••••••••

4. **Clique em "Entrar"**
   - Loader aparece
   - Aguarde autenticação

5. **Verifique os logs** (opcional)
   ```
   chrome://extensions/ → Service Worker (inspect) → Console
   ```

   Deve aparecer:
   ```
   [Popup] Initializing...
   [Popup] Checking authentication...
   [Popup] Attempting login...
   [Popup] Login successful!
   [Extension] 🔐 New session received!
   [Extension] ✅ User authenticated: xxx-xxx-xxx
   ```

6. **Teste a funcionalidade**
   - Inicie uma sessão no Timer (app web)
   - Extensão deve detectar e mostrar notificação
   - Badge deve mostrar "🔥"

---

## 📊 Logs de Debug

### Ver Logs do Popup

1. Clique no ícone da extensão
2. Clique direito na janela do popup
3. Selecione **Inspecionar**
4. Vá na aba **Console**

**Logs esperados:**
```
[Popup] Script loaded, waiting for Supabase...
[Popup] Initializing...
[Popup] Checking authentication...
[Popup] User is not authenticated → Tela de login
```

**Após login:**
```
[Popup] Attempting login...
[Popup] Login successful!
[Popup] User is authenticated
```

### Ver Logs do Background

1. Vá em `chrome://extensions/`
2. Encontre a extensão Concurseiro
3. Clique em **Service Worker (inspect)**
4. Vá na aba **Console**

**Logs esperados:**
```
Concurseiro Extension background script loaded!
[Extension] Auth session updated from popup
[Extension] 🔐 New session received!
[Extension] ✅ User authenticated: abc-123-def
[Extension] 🔍 Checking for active session...
```

---

## 🎯 Checklist de Teste

Use este checklist para testar o login:

- [ ] Extensão instalada
- [ ] Popup abre ao clicar no ícone
- [ ] Tela de login aparece
- [ ] Campos de e-mail e senha funcionam
- [ ] Botão "Entrar" funciona
- [ ] Loader aparece durante autenticação
- [ ] Mensagens de erro aparecem se credenciais inválidas
- [ ] Tela principal aparece após login bem-sucedido
- [ ] Botão "Sair" funciona
- [ ] Logout retorna para tela de login
- [ ] Logs mostram autenticação correta

---

## 🚀 Próximos Passos

Após fazer login com sucesso:

1. ✅ **Inicie uma sessão de estudo** no app web
2. ✅ **Veja a notificação** na extensão
3. ✅ **Tente acessar** um site bloqueado (ex: facebook.com)
4. ✅ **Capture uma questão** (botão direito → "Adicionar ao Caderno")
5. ✅ **Verifique estatísticas** no popup

---

**Versão:** 1.0.0
**Data:** 04/10/2025
**Status:** ✅ Login Implementado e Funcionando!

# 📋 Changelog - Extensão Concurseiro

## [1.0.0] - 2025-10-04

### ✨ Adicionado

#### 🔐 Sistema de Login Completo
- **Tela de login** integrada ao popup da extensão
- **Autenticação direta** via Supabase (sem precisar do app web)
- **Validação de credenciais** com mensagens de erro amigáveis
- **Botão de logout** no header da extensão
- **Persistência de sessão** no Chrome Storage
- **Sincronização automática** entre login e background script

#### 🎨 Interface do Usuário
- Design moderno com gradiente escuro
- Formulário de login responsivo
- Loader durante autenticação
- Mensagens de erro contextualizadas:
  - "E-mail ou senha incorretos"
  - "Por favor, confirme seu e-mail primeiro"
  - "Erro ao fazer login. Tente novamente"
- Botão "Abrir App Web" para usuários sem conta

#### 🔄 Gerenciamento de Estado
- Detecção automática de usuário autenticado
- Alternância entre tela de login e dashboard
- Limpeza de dados ao fazer logout
- Restauração de sessão ao reabrir a extensão

### 🔧 Corrigido

#### ⚠️ Problema de Conexão com Supabase
- **Corrigido:** URLs do Supabase estavam incorretas
  - Anterior: `qpzgsqjnbvsluwdvmftu.supabase.co`
  - Atual: `ubeivchkuoptmhkcglny.supabase.co`
- Atualizados arquivos:
  - `chrome-extension/lib/supabase-client.js`
  - `chrome-extension/background/background.js`

#### ✅ Tabelas do Banco de Dados
- Verificado que todas as 7 tabelas existem:
  - ✅ `user_block_settings`
  - ✅ `browsing_statistics`
  - ✅ `captured_notes`
  - ✅ `review_items`
  - ✅ `error_log`
  - ✅ `page_highlights`
  - ✅ `extension_settings`

### 📚 Documentação

#### Novos Arquivos
- **[GUIA_LOGIN.md](GUIA_LOGIN.md)** - Guia completo de login e autenticação
- **[CHANGELOG.md](CHANGELOG.md)** - Este arquivo
- **[GUIA_RAPIDO_TESTE.md](GUIA_RAPIDO_TESTE.md)** - Atualizado com novo fluxo

#### Documentação Atualizada
- Removida necessidade de copiar sessão manualmente
- Adicionadas instruções de login direto
- Seção de troubleshooting expandida

### 🏗️ Arquitetura

#### Fluxo de Autenticação Implementado

```
┌─────────────┐
│   USUÁRIO   │
└──────┬──────┘
       │
       │ 1. Clica no ícone da extensão
       ▼
┌─────────────────────┐
│   POPUP (HTML/JS)   │
│  - Mostra login se  │
│    não autenticado  │
└──────────┬──────────┘
           │
           │ 2. Digita credenciais e clica "Entrar"
           ▼
┌────────────────────────────┐
│  SUPABASE AUTH API         │
│  - Valida credenciais      │
│  - Retorna access_token    │
└─────────────┬──────────────┘
              │
              │ 3. Token salvo no Chrome Storage
              ▼
┌────────────────────────────┐
│  BACKGROUND SCRIPT         │
│  - Recebe notificação      │
│  - Configura Supabase      │
│  - Inicia Realtime         │
│  - Verifica sessões ativas │
└────────────────────────────┘
```

#### Comunicação entre Componentes

**Popup → Background:**
```javascript
chrome.runtime.sendMessage({
  type: 'AUTH_SESSION_UPDATED',
  session: { access_token, refresh_token, user }
})
```

**Background → Popup:**
```javascript
chrome.runtime.sendMessage({
  action: 'getStudySession'
})
```

**Storage Structure:**
```javascript
{
  supabase_session: {
    access_token: "eyJhbGc...",
    refresh_token: "v1.xxx...",
    user: {
      id: "uuid",
      email: "user@example.com",
      ...
    }
  }
}
```

### 🔒 Segurança

#### Implementações de Segurança
- ✅ Senha nunca armazenada localmente
- ✅ Apenas tokens de acesso/refresh são salvos
- ✅ Comunicação HTTPS com Supabase
- ✅ Row Level Security (RLS) ativo em todas as tabelas
- ✅ Tokens são validados a cada requisição
- ✅ Logout limpa todos os dados sensíveis

### 📊 Estatísticas

#### Arquivos Modificados
- `chrome-extension/popup/popup.html` - Adicionada tela de login
- `chrome-extension/popup/popup.css` - Estilos do login
- `chrome-extension/popup/popup.js` - Lógica de autenticação (reescrito)
- `chrome-extension/background/background.js` - Handlers de auth
- `chrome-extension/lib/supabase-client.js` - URLs corrigidas

#### Linhas de Código
- **Adicionadas:** ~350 linhas
- **Modificadas:** ~50 linhas
- **Removidas:** ~80 linhas (código obsoleto de sync manual)

### 🧪 Testes

#### Cenários Testados
- ✅ Login com credenciais válidas
- ✅ Login com credenciais inválidas
- ✅ Login com e-mail não confirmado
- ✅ Logout e retorno à tela de login
- ✅ Persistência de sessão ao reabrir
- ✅ Sincronização com background script
- ✅ Detecção de sessões de estudo
- ✅ Mensagens de erro apropriadas

### 🚀 Como Usar

#### Para Usuários

1. **Instalar extensão:**
   ```
   chrome://extensions/ → Carregar sem compactação
   ```

2. **Fazer login:**
   - Clicar no ícone da extensão
   - Digitar e-mail e senha
   - Clicar em "Entrar"

3. **Usar funcionalidades:**
   - Ver sessões de estudo
   - Capturar questões
   - Ver estatísticas

#### Para Desenvolvedores

1. **Testar login:**
   ```javascript
   // No console do popup (Inspect)
   console.log('[Popup] Testing login...')
   ```

2. **Ver sessão armazenada:**
   ```javascript
   chrome.storage.local.get(['supabase_session'], console.log)
   ```

3. **Forçar logout:**
   ```javascript
   chrome.storage.local.remove(['supabase_session'])
   ```

### 📝 Notas de Desenvolvimento

#### Decisões Técnicas

**Por que não usar OAuth?**
- OAuth requer redirect_uri, complicado em extensões
- E-mail/senha é mais simples e funcional
- Supabase Auth já fornece segurança adequada

**Por que armazenar no Chrome Storage?**
- Persiste entre sessões
- Acessível de qualquer script da extensão
- Sincroniza entre dispositivos (se ativado)

**Por que reescrever popup.js?**
- Código anterior assumia sessão já existente
- Necessário adicionar lógica de autenticação
- Melhor separação de responsabilidades

### 🐛 Bugs Conhecidos

**Nenhum no momento!** 🎉

### 🔮 Próximas Versões

#### [1.1.0] - Planejado
- [ ] Auto-sync entre app web e extensão
- [ ] Refresh automático de tokens
- [ ] Modo "Lembrar de mim"
- [ ] Recuperação de senha na extensão

#### [1.2.0] - Planejado
- [ ] Login com Google
- [ ] Biometria (se disponível no navegador)
- [ ] Multi-account support

### 📞 Suporte

**Problemas com login?**
1. Veja os logs: `chrome://extensions/` → Service Worker → Console
2. Leia: [GUIA_LOGIN.md](GUIA_LOGIN.md)
3. Verifique: Credenciais estão corretas?

---

## Versões Anteriores

### [0.9.0] - 2025-10-04 (Antes do Login)
- Sistema de bloqueio de sites
- Captura de questões
- Integração com Timer
- Tracking de tempo
- **Problema:** Necessitava copiar sessão manualmente

---

**Mantido por:** Equipe Concurseiro
**Licença:** MIT
**Repositório:** github.com/concurseiro-app

# 🚀 Guia de Instalação - Extensão Concurseiro

## 📋 Pré-requisitos

1. Google Chrome ou Microsoft Edge instalado
2. Supabase configurado com as tabelas da extensão

## 🗄️ Passo 1: Configurar Banco de Dados

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard

2. Selecione seu projeto: `qpzgsqjnbvsluwdvmftu`

3. Vá em **SQL Editor** (menu lateral)

4. Clique em **New Query**

5. Copie TODO o conteúdo do arquivo `docs/extension-database.sql`

6. Cole no editor SQL

7. Clique em **Run** (ou pressione Ctrl+Enter)

8. Verifique se apareceu a mensagem:
   ```
   Chrome Extension database tables created successfully!
   ```

✅ **Banco de dados configurado!**

## 🔧 Passo 2: Carregar Extensão no Chrome

### Método 1: Via Chrome Extensions

1. Abra o Google Chrome

2. Digite na barra de endereços:
   ```
   chrome://extensions/
   ```

3. No canto superior direito, **ative** o "Modo do desenvolvedor"

4. Clique no botão **"Carregar sem compactação"**

5. Navegue até a pasta:
   ```
   C:\xampp\htdocs\consurseiro\concurseiro-app\chrome-extension
   ```

6. Clique em **"Selecionar pasta"**

7. A extensão será carregada! Você verá:
   ```
   ✅ Concurseiro - Extensão de Estudo
   ID: [um ID gerado automaticamente]
   Versão: 1.0.0
   ```

### Método 2: Via Edge

Se estiver usando Microsoft Edge:

1. Digite: `edge://extensions/`
2. Siga os mesmos passos acima

## ✅ Passo 3: Verificar Instalação

### 3.1 Verificar Ícone

- Deve aparecer um ícone azul com um livro na barra de ferramentas
- Se não aparecer, clique no ícone de **extensões** (peça de quebra-cabeça) e fixe

### 3.2 Testar Popup

1. Clique no ícone da extensão
2. Deve abrir um popup com:
   - Status da sessão
   - Estatísticas
   - Botões de ação

### 3.3 Testar Configurações

1. Clique com botão direito no ícone
2. Escolha "Opções"
3. Deve abrir uma página de configurações completa

## 🧪 Passo 4: Testar Funcionalidades

### Teste 1: Captura de Questões

1. Abra qualquer site (ex: Google)
2. Selecione um texto longo (mínimo 20 caracteres)
3. Deve aparecer uma toolbar flutuante com ícones:
   - 📓 Caderno
   - 🔖 Revisão
   - 🃏 Flashcard
   - ✨ Destacar

4. Ou clique com botão direito → "Adicionar ao Caderno Concurseiro"

### Teste 2: Bloqueio de Sites

1. No app web (localhost:3000), inicie uma sessão de estudo
2. Tente acessar facebook.com ou instagram.com
3. Deve aparecer um overlay de bloqueio

### Teste 3: Tracking

1. Com uma sessão ativa, navegue em alguns sites
2. Os dados serão salvos automaticamente
3. Veja as estatísticas no popup da extensão

## ⚙️ Configuração Inicial Recomendada

1. Abra as **Configurações** da extensão

2. Em **Bloqueio de Sites**:
   - Escolha modo "Moderate" ou "Strict"
   - Adicione sites personalizados se quiser

3. Em **Rastreamento**:
   - Mantenha ativado para estatísticas

4. Em **Notificações**:
   - Ative notificações Pomodoro

5. Clique em **Salvar Configurações**

## 🔍 Solução de Problemas

### Problema: "Erro ao carregar extensão"

**Solução:**
- Verifique se está na pasta correta
- Certifique-se que os ícones PNG existem na pasta `icons/`

### Problema: "Supabase não conecta"

**Solução:**
1. Verifique as credenciais em `lib/supabase-client.js`
2. URL: `https://qpzgsqjnbvsluwdvmftu.supabase.co`
3. Key: deve estar correta

### Problema: "Não detecta sessão ativa"

**Solução:**
1. Certifique-se que o app web está rodando
2. Inicie uma sessão no Timer
3. Aguarde até 30 segundos (polling interval)

### Problema: "Sites não são bloqueados"

**Solução:**
1. Verifique se tem sessão ativa
2. Vá em Configurações → Bloqueio de Sites
3. Confirme que "Bloquear apenas durante estudo" está ativado
4. Reload na página bloqueada

## 📊 Console de Desenvolvimento

Para debug avançado:

1. Vá em `chrome://extensions/`
2. Na extensão Concurseiro, clique em **"background page"** ou **"service worker"**
3. Abrirá o DevTools
4. Veja logs no Console

Ou:

1. Clique com botão direito no popup
2. "Inspecionar"
3. Veja erros JavaScript

## 🎯 Próximos Passos

Após instalação bem-sucedida:

1. ✅ Execute o SQL no Supabase
2. ✅ Configure suas preferências
3. ✅ Inicie uma sessão de estudo
4. ✅ Teste captura de questões
5. ✅ Veja as estatísticas

## 📞 Suporte

Problemas? Entre em contato:
- WhatsApp: +55 21 99780-8370

---

**Boa sorte nos estudos! 🎓**

# 🎓 Concurseiro - Extensão Chrome

Extensão de navegador integrada ao Concurseiro App para controle de navegação, captura inteligente de questões e sincronização em tempo real.

## 📋 Funcionalidades

### 🔒 Bloqueio de Sites durante Estudo
- Sincronização automática com sessões ativas do timer
- Bloqueio configurável de sites de distração
- Overlay informativo ao acessar site bloqueado
- 3 modos: Strict, Moderate, Custom

### 📝 Captura Inteligente de Questões
- Seleção de texto com botão direito
- Detecção automática de:
  - Questões de múltipla escolha
  - Alternativas (A, B, C, D, E)
  - Gabarito (quando visível)
  - Matéria/assunto
  - Nível de dificuldade
  - Banca examinadora
- Captura de imagens
- Salvamento direto no caderno

### ⏱️ Tracking de Tempo
- Rastreamento automático de tempo por site
- Categorização: sites educacionais vs distrações
- Estatísticas de produtividade
- Integração com dashboard do app

### 🔔 Notificações
- Alertas Pomodoro (5 min antes, ao finalizar)
- Notificações de captura bem-sucedida
- Avisos de inatividade

## 🚀 Instalação

### Modo Desenvolvedor (Chrome)

1. Clone o repositório:
```bash
cd concurseiro-app/chrome-extension
```

2. Abra o Chrome e vá para `chrome://extensions/`

3. Ative o "Modo do desenvolvedor" (canto superior direito)

4. Clique em "Carregar sem compactação"

5. Selecione a pasta `chrome-extension`

6. A extensão estará instalada! 🎉

### Configuração do Banco de Dados

1. Acesse o Supabase SQL Editor

2. Execute o script `docs/extension-database.sql`

3. Verifique se todas as tabelas foram criadas com sucesso

## 📖 Como Usar

### 1. Iniciar Sessão de Estudo

1. Abra o [Concurseiro App](http://localhost:3000)
2. Vá para o Timer
3. Configure e inicie uma sessão
4. A extensão detectará automaticamente e ativará o modo foco

### 2. Capturar Questões

**Método 1: Menu de Contexto**
1. Selecione o texto da questão
2. Clique com botão direito
3. Escolha "Adicionar ao Caderno Concurseiro"
4. Revise os dados detectados
5. Selecione o caderno de destino
6. Clique em "Salvar"

**Método 2: Toolbar Rápida**
1. Selecione texto (mínimo 20 caracteres)
2. Uma toolbar aparecerá automaticamente
3. Clique no ícone desejado (📓 Caderno, 🔖 Revisão, etc)

### 3. Configurar Bloqueios

1. Clique no ícone da extensão
2. Clique em "Configurações"
3. Escolha o modo de bloqueio:
   - **Strict**: Bloqueia redes sociais, streaming, jogos, notícias
   - **Moderate**: Bloqueia apenas redes sociais principais
   - **Custom**: Personalize sua lista
4. Adicione/remova sites conforme necessário

### 4. Ver Estatísticas

1. Clique no ícone da extensão
2. Veja:
   - Tempo de estudo hoje
   - Questões capturadas
   - Score de foco
   - Sessão ativa

## 🛠️ Estrutura de Arquivos

```
chrome-extension/
├── manifest.json              # Configuração da extensão
├── background/
│   └── background.js          # Service Worker principal
├── content/
│   ├── content-script.js      # Script injetado nas páginas
│   ├── selection-handler.js   # Gerencia seleções de texto
│   └── question-detector.js   # Detecção inteligente de questões
├── popup/
│   ├── popup.html            # Interface do popup
│   ├── popup.js              # Lógica do popup
│   └── popup.css             # Estilos do popup
├── lib/
│   └── supabase-client.js    # Cliente Supabase
└── assets/
    └── content-styles.css    # Estilos para content scripts
```

## 🔧 Tecnologias

- **Manifest V3** (Chrome Extensions)
- **Supabase** (Backend e Realtime)
- **Vanilla JavaScript** (Performance)
- **CSS3** (Estilos modernos)

## 🎯 Sites Compatíveis

Detecção otimizada para:
- ✅ QConcursos
- ✅ TEC Concursos
- ✅ Gran Cursos Online
- ✅ Estratégia Concursos
- ✅ Planalto (legislação)
- ✅ STF/STJ (jurisprudência)
- ✅ Qualquer site com seleção de texto

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- `user_block_settings` - Configurações de bloqueio
- `browsing_statistics` - Estatísticas de navegação
- `captured_notes` - Questões/conteúdos capturados
- `review_items` - Itens para revisão
- `error_log` - Erros marcados
- `page_highlights` - Destaques de texto
- `extension_settings` - Configurações gerais

## 🔐 Permissões

A extensão solicita as seguintes permissões:

- `storage` - Armazenar configurações localmente
- `tabs` - Acessar informações de abas
- `activeTab` - Interagir com aba ativa
- `contextMenus` - Menu de captura de conteúdo
- `notifications` - Alertas de Pomodoro
- `webRequest` - Bloqueio de sites
- `<all_urls>` - Funcionar em qualquer site

## 🔒 Privacidade

- ✅ Dados criptografados antes do envio
- ✅ Tracking pode ser desativado
- ✅ Conteúdo capturado é privado
- ✅ Sem venda de dados
- ✅ Sem coleta de senhas ou formulários

## 🐛 Problemas Conhecidos

- Alguns sites com CSP restritivo podem bloquear a injeção de scripts
- Detecção de questões pode não funcionar em PDFs (OCR em desenvolvimento)
- Bloqueio de sites requer reload da página

## 🚀 Roadmap

- [ ] Extensão Firefox
- [ ] OCR para PDFs
- [ ] Resumo automático com IA
- [ ] Flashcards automáticos
- [ ] Integração com YouTube (timestamps)
- [ ] Modo offline

## 📝 Changelog

### v1.0.0 (2025-10-04)
- ✨ Lançamento inicial
- 🔒 Sistema de bloqueio de sites
- 📝 Captura inteligente de questões
- ⏱️ Tracking de tempo
- 🔔 Notificações Pomodoro
- 🎨 Interface moderna

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte do Concurseiro App.

## 📞 Suporte

- Email: suporte@concurseiro.app
- WhatsApp: +55 21 99780-8370

---

**Desenvolvido com ❤️ para concurseiros**

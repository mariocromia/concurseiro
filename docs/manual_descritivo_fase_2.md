# Manual Descritivo - Fase 2: Extensão de Navegador Integrada

## Visão Geral

A Fase 2 do projeto Concurseiro App consiste no desenvolvimento de uma extensão de navegador (Chrome/Edge) integrada ao aplicativo web, permitindo controle avançado de navegação, captura inteligente de conteúdo e sincronização em tempo real com o sistema de estudos.

---

## Objetivos Principais

1. **Navegador Controlado**: Criar ambiente de navegação livre de distrações durante sessões de estudo
2. **Captura Inteligente**: Permitir captura de questões, conteúdos e anotações diretamente de sites
3. **Sincronização Total**: Integração em tempo real entre extensão e aplicativo web
4. **Produtividade**: Tracking de tempo, estatísticas e insights de navegação

---

## Arquitetura da Solução

```
┌─────────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│   App Web (Nuxt)    │ ←────→  │  Supabase API    │ ←────→  │ Extensão Chrome     │
│   - Dashboard       │         │  - Realtime      │         │  - Background       │
│   - Timer           │         │  - Database      │         │  - Content Script   │
│   - Cadernos        │         │  - Auth          │         │  - Popup            │
└─────────────────────┘         └──────────────────┘         └─────────────────────┘
```

### Fluxo de Comunicação

1. **App → Supabase**: Atualiza estado de sessões, configurações, cadernos
2. **Supabase → Extensão**: Extensão monitora mudanças via Realtime ou polling
3. **Extensão → Supabase**: Envia capturas, estatísticas, eventos de navegação
4. **Supabase → App**: App atualiza interface em tempo real

---

## Estrutura da Extensão

```
chrome-extension/
├── manifest.json              # Configuração e permissões da extensão
├── icons/                     # Ícones da extensão (16x16, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background/                # Service Worker (lógica principal)
│   ├── background.js
│   ├── api-client.js         # Comunicação com Supabase
│   └── block-manager.js      # Gerencia bloqueios de sites
├── content/                   # Scripts injetados em páginas
│   ├── content-script.js     # Roda em todas as páginas
│   ├── selection-handler.js  # Captura seleções de texto
│   ├── question-detector.js  # Detecta questões automaticamente
│   └── overlay.js            # Overlay de bloqueio/notificações
├── popup/                     # Interface do ícone da extensão
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/                   # Página de configurações
│   ├── options.html
│   ├── options.js
│   └── options.css
├── lib/                       # Bibliotecas e utilitários
│   ├── supabase-client.js
│   ├── utils.js
│   └── storage.js
└── assets/                    # CSS, imagens, etc
    ├── styles.css
    └── block-overlay.html
```

---

## Funcionalidades Detalhadas

### 1. Bloqueio de Sites durante Estudo

#### 1.1 Requisitos
- Sincronizar com sessões ativas do timer no app web
- Bloquear sites pré-configurados da lista de distrações
- Permitir configuração personalizada de sites bloqueados/permitidos
- Exibir overlay informativo ao tentar acessar site bloqueado

#### 1.2 Implementação Técnica

**Background Script (background.js)**
```javascript
// Monitora sessões ativas via Supabase Realtime
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Escuta mudanças em study_sessions
supabase
  .channel('study-sessions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'study_sessions'
  }, handleSessionChange)
  .subscribe()

// Intercepta requisições
chrome.webRequest.onBeforeRequest.addListener(
  checkBlockedSite,
  { urls: ["<all_urls>"] },
  ["blocking"]
)

function checkBlockedSite(details) {
  const url = new URL(details.url)
  const isStudyActive = getCurrentStudySession()
  const blockedSites = getBlockedSites()

  if (isStudyActive && isBlocked(url.hostname, blockedSites)) {
    return { cancel: true } // Bloqueia requisição
  }
}
```

**Content Script (overlay.js)**
```javascript
// Quando site é bloqueado, injeta overlay
function showBlockOverlay(reason) {
  const overlay = document.createElement('div')
  overlay.className = 'concurseiro-block-overlay'
  overlay.innerHTML = `
    <div class="block-message">
      <h1>🚫 Site Bloqueado</h1>
      <p>Você está em uma sessão de estudo ativa.</p>
      <p class="study-info">
        Tipo: ${currentSession.type}<br>
        Tempo restante: ${currentSession.remaining}
      </p>
      <button id="end-session">Encerrar Sessão</button>
    </div>
  `
  document.body.appendChild(overlay)
}
```

#### 1.3 Configurações de Bloqueio

**Tabela Supabase: `user_block_settings`**
```sql
CREATE TABLE user_block_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  blocked_sites TEXT[], -- ['facebook.com', 'instagram.com']
  allowed_sites TEXT[], -- Sites educacionais sempre permitidos
  block_mode VARCHAR(20), -- 'strict', 'moderate', 'custom'
  block_during_study_only BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

**Sites Pré-configurados por Modo:**
- **Strict**: Bloqueia redes sociais, streaming, jogos, notícias
- **Moderate**: Bloqueia apenas redes sociais principais
- **Custom**: Usuário define lista completa

#### 1.4 Permissões Necessárias (manifest.json)
```json
{
  "permissions": [
    "webRequest",
    "webRequestBlocking",
    "tabs",
    "storage",
    "<all_urls>"
  ]
}
```

---

### 2. Tracking de Tempo e Produtividade

#### 2.1 Métricas Coletadas
- Tempo total navegando durante sessões de estudo
- Tempo em sites educacionais vs sites de distração
- Sites mais visitados durante estudo
- Padrões de navegação (horários, frequência)

#### 2.2 Implementação

**Background Script (tracking.js)**
```javascript
// Rastreia tempo ativo em cada site
let currentTab = null
let sessionStartTime = null
let siteTimeTracker = {}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (currentTab) {
    recordTimeSpent(currentTab)
  }

  const tab = await chrome.tabs.get(activeInfo.tabId)
  currentTab = {
    url: tab.url,
    startTime: Date.now()
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (currentTab) recordTimeSpent(currentTab)
    currentTab = { url: changeInfo.url, startTime: Date.now() }
  }
})

function recordTimeSpent(tab) {
  const timeSpent = Date.now() - tab.startTime
  const domain = new URL(tab.url).hostname

  // Salva no storage local
  siteTimeTracker[domain] = (siteTimeTracker[domain] || 0) + timeSpent

  // Envia para Supabase periodicamente
  if (shouldSync()) {
    syncTrackingData()
  }
}
```

**Tabela Supabase: `browsing_statistics`**
```sql
CREATE TABLE browsing_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES study_sessions(id),
  site_domain VARCHAR(255),
  time_spent INTEGER, -- em segundos
  site_category VARCHAR(50), -- 'educational', 'distraction', 'neutral'
  visited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Índices para performance
CREATE INDEX idx_browsing_user_date ON browsing_statistics(user_id, visited_at);
CREATE INDEX idx_browsing_session ON browsing_statistics(session_id);
```

#### 2.3 Categorização Automática de Sites

```javascript
const siteCategories = {
  educational: [
    'qconcursos.com', 'tecconcursos.com.br', 'grancursosonline.com.br',
    'estrategiaconcursos.com.br', 'planalto.gov.br', 'stf.jus.br',
    'youtube.com/watch?*' // Específico para vídeos (pode filtrar por canal)
  ],
  distraction: [
    'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com',
    'netflix.com', 'primevideo.com', 'reddit.com'
  ]
}

function categorize(domain) {
  if (siteCategories.educational.some(site => domain.includes(site))) {
    return 'educational'
  }
  if (siteCategories.distraction.some(site => domain.includes(site))) {
    return 'distraction'
  }
  return 'neutral'
}
```

---

### 3. Integração com Timer do App

#### 3.1 Sincronização de Estado

**Fluxo:**
1. Usuário inicia sessão de estudo no app web
2. App cria registro em `study_sessions` com status `active`
3. Extensão detecta via Realtime
4. Extensão ativa modo de estudo e bloqueios
5. Ao encerrar sessão, extensão envia estatísticas acumuladas

#### 3.2 Notificações Pomodoro

**Background Script (notifications.js)**
```javascript
// Monitora tempo restante da sessão
function checkPomodoroTimer() {
  const session = getCurrentSession()

  if (!session) return

  const remaining = session.end_time - Date.now()
  const minutes = Math.floor(remaining / 60000)

  // Notifica 5 minutos antes do fim
  if (minutes === 5 && !notified5min) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Concurseiro - Sessão terminando',
      message: 'Faltam 5 minutos para o fim da sua sessão de estudo!',
      priority: 2
    })
    notified5min = true
  }

  // Notifica no fim
  if (remaining <= 0) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Concurseiro - Sessão finalizada!',
      message: 'Hora de fazer uma pausa! 🎉',
      priority: 2,
      buttons: [
        { title: 'Iniciar Pausa' },
        { title: 'Continuar Estudando' }
      ]
    })
  }
}

setInterval(checkPomodoroTimer, 30000) // Verifica a cada 30s
```

#### 3.3 Detecção de Inatividade

```javascript
let lastActivityTime = Date.now()

// Monitora atividade do usuário
document.addEventListener('mousemove', () => lastActivityTime = Date.now())
document.addEventListener('keypress', () => lastActivityTime = Date.now())

function checkInactivity() {
  const inactiveTime = Date.now() - lastActivityTime

  // Se inativo por 5 minutos durante sessão ativa
  if (inactiveTime > 300000 && isStudySessionActive()) {
    chrome.runtime.sendMessage({
      type: 'PAUSE_SESSION',
      reason: 'inactivity'
    })

    showInactivityOverlay()
  }
}

setInterval(checkInactivity, 60000) // Verifica a cada minuto
```

---

### 4. Captura Inteligente de Questões (Funcionalidade Principal)

#### 4.1 Fluxo Completo de Uso

```
1. Usuário navega em site de questões (ex: QConcursos)
2. Seleciona texto da questão com mouse
3. Clica botão direito → "Adicionar ao Caderno Concurseiro"
4. Extensão analisa seleção e detecta:
   - Texto da questão
   - Alternativas (A, B, C, D, E)
   - Gabarito (se visível)
   - Imagens/gráficos
5. Abre popup de captura com:
   - Preview do conteúdo
   - Seletor de caderno de destino
   - Campo de tags/matéria
   - Campo de nota pessoal
6. Usuário confirma
7. Extensão salva no Supabase
8. App web atualiza caderno em tempo real (Realtime)
9. Questão aparece instantaneamente no caderno aberto
```

#### 4.2 Context Menu (Menu de Botão Direito)

**Manifest.json**
```json
{
  "permissions": [
    "contextMenus",
    "activeTab",
    "clipboardWrite"
  ],
  "background": {
    "service_worker": "background/background.js"
  }
}
```

**Background Script (context-menu.js)**
```javascript
// Cria menu de contexto ao instalar extensão
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-to-notebook',
    title: 'Adicionar ao Caderno Concurseiro',
    contexts: ['selection']
  })

  chrome.contextMenus.create({
    id: 'add-to-review',
    title: 'Salvar para Revisão',
    contexts: ['selection']
  })

  chrome.contextMenus.create({
    id: 'create-flashcard',
    title: 'Criar Flashcard',
    contexts: ['selection']
  })

  chrome.contextMenus.create({
    id: 'mark-as-error',
    title: 'Adicionar aos Erros',
    contexts: ['selection']
  })
})

// Escuta cliques no menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-to-notebook') {
    handleAddToNotebook(info, tab)
  }
  // ... outros handlers
})
```

#### 4.3 Detecção Inteligente de Questões

**Content Script (question-detector.js)**
```javascript
class QuestionDetector {
  constructor(selectedText, selectedHTML) {
    this.text = selectedText
    this.html = selectedHTML
    this.parser = new DOMParser()
    this.doc = this.parser.parseFromString(selectedHTML, 'text/html')
  }

  // Detecta se é uma questão de múltipla escolha
  isMultipleChoice() {
    const patterns = [
      /[A-E]\)\s*.+/gi,
      /\([A-E]\)\s*.+/gi,
      /[A-E]\.\s*.+/gi
    ]
    return patterns.some(pattern => pattern.test(this.text))
  }

  // Extrai alternativas
  extractAlternatives() {
    const alternatives = []
    const lines = this.text.split('\n')
    const altPattern = /^([A-E])[.)]\s*(.+)/

    lines.forEach(line => {
      const match = line.match(altPattern)
      if (match) {
        alternatives.push({
          letter: match[1],
          text: match[2].trim()
        })
      }
    })

    return alternatives
  }

  // Detecta gabarito (se estiver visível na página)
  detectAnswer() {
    const answerPatterns = [
      /gabarito:\s*([A-E])/i,
      /resposta:\s*([A-E])/i,
      /correta:\s*([A-E])/i,
      /alternativa\s+correta:\s*([A-E])/i
    ]

    // Busca no texto selecionado
    for (let pattern of answerPatterns) {
      const match = this.text.match(pattern)
      if (match) return match[1]
    }

    // Busca em elementos próximos (DOM)
    const nearbyText = this.getNearbyText()
    for (let pattern of answerPatterns) {
      const match = nearbyText.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  // Extrai imagens da seleção
  extractImages() {
    const images = []
    const imgElements = this.doc.querySelectorAll('img')

    imgElements.forEach(img => {
      images.push({
        src: img.src,
        alt: img.alt || '',
        width: img.width,
        height: img.height
      })
    })

    return images
  }

  // Detecta matéria/assunto baseado em palavras-chave
  detectSubject() {
    const subjects = {
      'Direito Constitucional': [
        'constituição', 'STF', 'supremo', 'constitucional',
        'direitos fundamentais', 'poder constituinte'
      ],
      'Direito Administrativo': [
        'administração pública', 'servidor público', 'licitação',
        'contrato administrativo', 'ato administrativo'
      ],
      'Português': [
        'sintaxe', 'semântica', 'concordância', 'regência',
        'ortografia', 'gramática'
      ],
      'Matemática': [
        'equação', 'função', 'geometria', 'trigonometria',
        'probabilidade', 'estatística'
      ],
      'Raciocínio Lógico': [
        'proposição', 'silogismo', 'tabela verdade',
        'premissa', 'conclusão lógica'
      ]
    }

    const textLower = this.text.toLowerCase()

    for (let [subject, keywords] of Object.entries(subjects)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return subject
      }
    }

    return 'Não identificado'
  }

  // Detecta dificuldade (se o site mostrar)
  detectDifficulty() {
    const difficultyPatterns = [
      /dificuldade:\s*(fácil|média|difícil)/i,
      /nível:\s*(fácil|médio|difícil)/i,
      /(fácil|média|difícil)/i
    ]

    for (let pattern of difficultyPatterns) {
      const match = this.text.match(pattern)
      if (match) {
        const level = match[1].toLowerCase()
        if (level.includes('fácil')) return 'easy'
        if (level.includes('méd')) return 'medium'
        if (level.includes('difícil')) return 'hard'
      }
    }

    return null
  }

  // Monta objeto completo da questão
  analyze() {
    return {
      isQuestion: this.isMultipleChoice(),
      questionText: this.extractQuestionText(),
      alternatives: this.extractAlternatives(),
      correctAnswer: this.detectAnswer(),
      images: this.extractImages(),
      subject: this.detectSubject(),
      difficulty: this.detectDifficulty(),
      rawText: this.text,
      rawHTML: this.html
    }
  }

  extractQuestionText() {
    // Remove alternativas do texto para pegar só o enunciado
    const alternatives = this.extractAlternatives()
    let questionText = this.text

    alternatives.forEach(alt => {
      const pattern = new RegExp(`[A-E][.)]\s*${alt.text}`, 'gi')
      questionText = questionText.replace(pattern, '')
    })

    return questionText.trim()
  }

  getNearbyText() {
    // Pega texto próximo à seleção (para buscar gabarito)
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer.parentElement

    // Busca em elementos irmãos e pais
    let nearbyText = container.textContent

    if (container.nextElementSibling) {
      nearbyText += ' ' + container.nextElementSibling.textContent
    }
    if (container.previousElementSibling) {
      nearbyText += ' ' + container.previousElementSibling.textContent
    }

    return nearbyText
  }
}

// Uso
function analyzeSelection() {
  const selection = window.getSelection()
  const selectedText = selection.toString()

  // Captura HTML da seleção (preserva formatação)
  const range = selection.getRangeAt(0)
  const container = document.createElement('div')
  container.appendChild(range.cloneContents())
  const selectedHTML = container.innerHTML

  const detector = new QuestionDetector(selectedText, selectedHTML)
  return detector.analyze()
}
```

#### 4.4 Popup de Captura

**popup-capture.html**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Adicionar ao Caderno</title>
  <link rel="stylesheet" href="popup-capture.css">
</head>
<body>
  <div class="capture-container">
    <h2>Adicionar Conteúdo ao Caderno</h2>

    <!-- Preview do conteúdo capturado -->
    <div class="content-preview">
      <h3>Preview</h3>
      <div id="preview-content"></div>
      <div id="preview-images"></div>
    </div>

    <!-- Seleção de caderno -->
    <div class="form-group">
      <label for="notebook-select">Salvar em:</label>
      <select id="notebook-select">
        <option value="">Carregando cadernos...</option>
      </select>
    </div>

    <!-- Informações detectadas -->
    <div class="detected-info">
      <div class="info-chip" id="subject-chip"></div>
      <div class="info-chip" id="difficulty-chip"></div>
      <div class="info-chip" id="answer-chip"></div>
    </div>

    <!-- Tags/Matéria -->
    <div class="form-group">
      <label for="tags-input">Tags (separadas por vírgula):</label>
      <input type="text" id="tags-input" placeholder="Princípios, STF, Jurisprudência">
    </div>

    <!-- Tipo de conteúdo -->
    <div class="form-group">
      <label for="content-type">Tipo:</label>
      <select id="content-type">
        <option value="question">Questão</option>
        <option value="note">Anotação</option>
        <option value="excerpt">Trecho/Citação</option>
        <option value="error">Erro para revisar</option>
      </select>
    </div>

    <!-- Nota pessoal -->
    <div class="form-group">
      <label for="user-note">Nota pessoal (opcional):</label>
      <textarea id="user-note" rows="3" placeholder="Adicione suas observações..."></textarea>
    </div>

    <!-- Ações -->
    <div class="actions">
      <button id="cancel-btn" class="btn-secondary">Cancelar</button>
      <button id="save-btn" class="btn-primary">Salvar</button>
    </div>
  </div>

  <script src="popup-capture.js"></script>
</body>
</html>
```

**popup-capture.js**
```javascript
// Carrega dados da captura
chrome.storage.local.get(['capturedContent'], async (result) => {
  const content = result.capturedContent

  // Preenche preview
  document.getElementById('preview-content').innerHTML = content.html

  // Mostra imagens
  if (content.images && content.images.length > 0) {
    const imagesDiv = document.getElementById('preview-images')
    content.images.forEach(img => {
      const imgEl = document.createElement('img')
      imgEl.src = img.src
      imgEl.alt = img.alt
      imagesDiv.appendChild(imgEl)
    })
  }

  // Mostra informações detectadas
  if (content.subject) {
    document.getElementById('subject-chip').textContent = content.subject
  }
  if (content.difficulty) {
    const difficultyText = {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil'
    }
    document.getElementById('difficulty-chip').textContent = difficultyText[content.difficulty]
  }
  if (content.correctAnswer) {
    document.getElementById('answer-chip').textContent = `Gabarito: ${content.correctAnswer}`
  }

  // Carrega cadernos do usuário
  await loadNotebooks()
})

async function loadNotebooks() {
  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('id, title')
    .order('title')

  const select = document.getElementById('notebook-select')
  select.innerHTML = '<option value="">Selecione um caderno...</option>'

  notebooks.forEach(notebook => {
    const option = document.createElement('option')
    option.value = notebook.id
    option.textContent = notebook.title
    select.appendChild(option)
  })
}

// Botão salvar
document.getElementById('save-btn').addEventListener('click', async () => {
  const notebookId = document.getElementById('notebook-select').value

  if (!notebookId) {
    alert('Selecione um caderno!')
    return
  }

  const capturedContent = await chrome.storage.local.get(['capturedContent'])
  const content = capturedContent.capturedContent

  const tags = document.getElementById('tags-input').value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  const contentType = document.getElementById('content-type').value
  const userNote = document.getElementById('user-note').value

  // Monta objeto para salvar
  const noteData = {
    notebook_id: notebookId,
    user_id: (await supabase.auth.getUser()).data.user.id,
    type: contentType,
    content: {
      question_text: content.questionText,
      alternatives: content.alternatives,
      correct_answer: content.correctAnswer,
      images: content.images,
      raw_html: content.rawHTML
    },
    source: {
      url: content.sourceUrl,
      site_name: new URL(content.sourceUrl).hostname,
      captured_at: new Date().toISOString()
    },
    metadata: {
      subject: content.subject,
      tags: tags,
      difficulty: content.difficulty
    },
    user_notes: userNote
  }

  // Salva no Supabase
  const { data, error } = await supabase
    .from('captured_notes')
    .insert([noteData])

  if (error) {
    alert('Erro ao salvar: ' + error.message)
    return
  }

  // Mostra feedback e fecha popup
  showSuccessMessage()
  setTimeout(() => window.close(), 1500)
})

// Botão cancelar
document.getElementById('cancel-btn').addEventListener('click', () => {
  window.close()
})

function showSuccessMessage() {
  const container = document.querySelector('.capture-container')
  container.innerHTML = `
    <div class="success-message">
      <h2>✅ Conteúdo salvo com sucesso!</h2>
      <p>Já está disponível no seu caderno.</p>
    </div>
  `
}
```

#### 4.5 Estrutura de Dados - Tabela Supabase

**Tabela: `captured_notes`**
```sql
CREATE TABLE captured_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,

  -- Tipo de conteúdo
  type VARCHAR(20) NOT NULL, -- 'question', 'note', 'excerpt', 'error'

  -- Conteúdo principal
  content JSONB NOT NULL, -- {question_text, alternatives, correct_answer, images, raw_html}

  -- Fonte
  source JSONB, -- {url, site_name, captured_at}

  -- Metadados
  metadata JSONB, -- {subject, tags[], difficulty, custom_fields}

  -- Nota pessoal do usuário
  user_notes TEXT,

  -- Controle de revisão
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMP,
  review_count INTEGER DEFAULT 0,

  -- Status
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Índices para performance
CREATE INDEX idx_captured_notes_user ON captured_notes(user_id);
CREATE INDEX idx_captured_notes_notebook ON captured_notes(notebook_id);
CREATE INDEX idx_captured_notes_type ON captured_notes(type);
CREATE INDEX idx_captured_notes_created ON captured_notes(created_at DESC);

-- Índice GIN para busca em JSONB
CREATE INDEX idx_captured_notes_metadata ON captured_notes USING GIN (metadata);
CREATE INDEX idx_captured_notes_content ON captured_notes USING GIN (content);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_captured_notes_updated_at
  BEFORE UPDATE ON captured_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 4.6 Integração com App Web (Tempo Real)

**Componente Vue - NotebookView.vue**
```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const supabase = useSupabaseClient()
const route = useRoute()

const notebookId = route.params.id
const notes = ref([])
let realtimeChannel = null

onMounted(async () => {
  // Carrega notas existentes
  await loadNotes()

  // Configura Realtime para novas capturas
  realtimeChannel = supabase
    .channel(`notebook-${notebookId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'captured_notes',
      filter: `notebook_id=eq.${notebookId}`
    }, handleNewNote)
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})

async function loadNotes() {
  const { data } = await supabase
    .from('captured_notes')
    .select('*')
    .eq('notebook_id', notebookId)
    .order('created_at', { ascending: false })

  notes.value = data
}

function handleNewNote(payload) {
  // Nova nota adicionada pela extensão!
  notes.value.unshift(payload.new)

  // Mostra notificação
  showToast('Nova questão adicionada ao caderno! 🎉')
}
</script>

<template>
  <div class="notebook-view">
    <h1>{{ notebookTitle }}</h1>

    <div class="notes-list">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
      />
    </div>
  </div>
</template>
```

#### 4.7 Sites Compatíveis (Inicial)

A extensão funcionará em qualquer site, mas terá detecção otimizada para:

- **QConcursos** (qconcursos.com)
- **TEC Concursos** (tecconcursos.com.br)
- **Gran Cursos Online** (questoes.grancursosonline.com.br)
- **Estratégia Concursos** (questoes.estrategiaconcursos.com.br)
- **Planalto** (planalto.gov.br) - legislação
- **STF/STJ** - jurisprudência
- **PDFs** - questões em PDF

---

### 5. Funcionalidades Adicionais

#### 5.1 Screenshot de Área

Capturar screenshot de área específica da tela (útil para questões em imagem/PDF).

**Manifest.json**
```json
{
  "permissions": ["activeTab", "tabs"]
}
```

**Content Script**
```javascript
// Ao clicar em "Capturar Screenshot"
chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (screenshotUrl) => {
  // Abre editor de crop
  openCropEditor(screenshotUrl)
})
```

#### 5.2 OCR para PDFs/Imagens

Integrar com API de OCR (Google Vision, Tesseract.js) para extrair texto de imagens.

```javascript
async function extractTextFromImage(imageUrl) {
  // Opção 1: Tesseract.js (local, gratuito)
  const { data: { text } } = await Tesseract.recognize(imageUrl, 'por')

  // Opção 2: Google Cloud Vision API (melhor precisão)
  const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
    method: 'POST',
    body: JSON.stringify({
      requests: [{
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION' }]
      }]
    })
  })

  return text
}
```

#### 5.3 Resumo Automático com IA

Integrar com API de LLM para resumir questões longas.

```javascript
async function summarizeQuestion(questionText) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Resuma a seguinte questão de concurso em 2-3 linhas, mantendo a essência:\n\n${questionText}`
      }],
      max_tokens: 150
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}
```

#### 5.4 Banco de Questões Colaborativo

Permitir que usuários compartilhem questões capturadas (com permissão).

**Tabela: `shared_questions`**
```sql
CREATE TABLE shared_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_note_id UUID REFERENCES captured_notes(id),
  shared_by UUID REFERENCES auth.users(id),
  subject VARCHAR(100),
  tags TEXT[],
  difficulty VARCHAR(20),
  content JSONB,
  times_used INTEGER DEFAULT 0,
  rating DECIMAL(3,2), -- Avaliação média
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Usuários podem adicionar questões compartilhadas aos seus cadernos
CREATE TABLE user_shared_questions (
  user_id UUID REFERENCES auth.users(id),
  shared_question_id UUID REFERENCES shared_questions(id),
  added_to_notebook_id UUID REFERENCES notebooks(id),
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, shared_question_id)
)
```

---

## Manifest.json Completo

```json
{
  "manifest_version": 3,
  "name": "Concurseiro - Extensão de Estudo",
  "version": "1.0.0",
  "description": "Extensão integrada ao Concurseiro App para controle de navegação e captura inteligente de questões.",

  "permissions": [
    "storage",
    "tabs",
    "activeTab",
    "contextMenus",
    "notifications",
    "webRequest",
    "webNavigation",
    "clipboardWrite"
  ],

  "host_permissions": [
    "<all_urls>"
  ],

  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": [
        "lib/supabase-client.js",
        "content/content-script.js",
        "content/selection-handler.js",
        "content/question-detector.js"
      ],
      "css": ["assets/content-styles.css"],
      "run_at": "document_idle"
    }
  ],

  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },

  "options_page": "options/options.html",

  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "web_accessible_resources": [
    {
      "resources": ["assets/*", "overlay.html"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## Fluxo de Desenvolvimento

### Fase 2.1 - Infraestrutura Base (2-3 semanas)
- [ ] Criar estrutura de pastas da extensão
- [ ] Configurar manifest.json
- [ ] Implementar cliente Supabase na extensão
- [ ] Criar sistema de autenticação (sincronizar com app web)
- [ ] Implementar storage local (cache)
- [ ] Configurar background service worker

### Fase 2.2 - Bloqueio e Tracking (2 semanas)
- [ ] Implementar bloqueio de sites
- [ ] Criar overlay de bloqueio
- [ ] Implementar tracking de tempo
- [ ] Criar categorização de sites
- [ ] Desenvolver sistema de notificações
- [ ] Integrar com timer do app web

### Fase 2.3 - Captura de Conteúdo (3-4 semanas)
- [ ] Implementar context menu
- [ ] Desenvolver QuestionDetector
- [ ] Criar popup de captura
- [ ] Implementar preview de conteúdo
- [ ] Desenvolver extração de imagens
- [ ] Criar sistema de tags automáticas
- [ ] Implementar salvamento no Supabase
- [ ] Configurar Realtime no app web

### Fase 2.4 - Interface de Usuário (2 semanas)
- [ ] Design do popup principal
- [ ] Página de configurações (options)
- [ ] Estilos do overlay
- [ ] Feedback visual (toasts, animações)
- [ ] Onboarding para novos usuários

### Fase 2.5 - Funcionalidades Avançadas (3 semanas)
- [ ] Screenshot e crop de área
- [ ] OCR para imagens/PDFs
- [ ] Resumo automático com IA
- [ ] Banco de questões colaborativo
- [ ] Sistema de estatísticas avançadas

### Fase 2.6 - Testes e Otimização (2 semanas)
- [ ] Testes em diferentes sites
- [ ] Otimização de performance
- [ ] Tratamento de erros
- [ ] Compatibilidade com navegadores
- [ ] Documentação de uso

### Fase 2.7 - Publicação (1 semana)
- [ ] Preparar assets para Chrome Web Store
- [ ] Criar screenshots e vídeo de demonstração
- [ ] Escrever descrição e política de privacidade
- [ ] Submeter para revisão
- [ ] Criar landing page da extensão

---

## Tecnologias e Bibliotecas

### Extensão
- **Manifest V3** (padrão mais recente do Chrome)
- **Supabase JS Client** (comunicação com backend)
- **Tesseract.js** (OCR opcional)
- **OpenAI API** (resumos opcionais)

### App Web (Integração)
- **Nuxt 3** (já implementado)
- **Supabase Realtime** (sincronização)
- **Vue 3 Composition API**

---

## Segurança e Privacidade

### Permissões Justificadas
- `<all_urls>`: Necessário para funcionar em qualquer site
- `webRequest`: Bloqueio de sites durante estudo
- `storage`: Armazenar configurações localmente
- `contextMenus`: Menu de captura de conteúdo
- `notifications`: Alertas de Pomodoro

### Privacidade
- Dados de navegação são criptografados antes do envio
- Usuário pode desativar tracking a qualquer momento
- Conteúdo capturado é privado por padrão
- Opção de compartilhar questões é opt-in

### Política de Dados
```markdown
# Política de Privacidade - Extensão Concurseiro

## Dados Coletados
- URLs de sites visitados durante sessões de estudo (apenas domínios)
- Tempo gasto em cada site (agregado)
- Conteúdo capturado pelo usuário (questões, notas)

## Uso dos Dados
- Estatísticas de produtividade pessoal
- Sincronização com app web
- Melhorias no produto

## Não Coletamos
- Senhas ou dados de formulários
- Histórico completo de navegação
- Dados de sites fora de sessões de estudo (se configurado)

## Compartilhamento
- Dados NUNCA são vendidos a terceiros
- Questões compartilhadas são opt-in
- Dados estatísticos agregados e anonimizados podem ser usados para pesquisa
```

---

## Métricas de Sucesso

### KPIs da Extensão
- **Taxa de instalação**: % de usuários do app que instalam a extensão
- **Engajamento**: Usuários ativos diários com extensão instalada
- **Capturas**: Média de questões/notas capturadas por usuário/semana
- **Tempo bloqueado**: Média de tempo em modo estudo vs distrações evitadas
- **Retenção**: % de usuários que mantêm extensão após 30 dias

### Metas Iniciais (3 meses)
- 500+ instalações
- 60% dos usuários ativos usam a extensão
- Média de 10 capturas/usuário/semana
- 80% de redução em tempo de distração durante estudo
- Avaliação 4.5+ na Chrome Web Store

---

## Roadmap Futuro (Fase 3)

### Funcionalidades Planejadas
- **Modo Offline**: Capturar conteúdo sem internet e sincronizar depois
- **Integração com PDF**: Abrir PDFs diretamente na extensão com highlighter
- **Flashcards Automáticos**: Gerar flashcards a partir de questões capturadas
- **Integração com YouTube**: Capturar timestamps de vídeo-aulas
- **Gamificação**: Badges por questões capturadas, tempo de estudo
- **Modo Focus**: Integração com técnicas de produtividade (Pomodoro+)
- **Extensão Firefox**: Portar para Firefox
- **App Mobile**: Versão mobile da extensão (Safari iOS, Chrome Android)

---

## Recursos de Desenvolvimento

### Documentação Oficial
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

### Exemplos de Código
- Repositório oficial: `github.com/concurseiro-app/browser-extension`
- Exemplos de detecção de questões: `/examples/question-detection/`
- Templates de UI: `/examples/ui-templates/`

### Ferramentas de Desenvolvimento
- **Chrome Extension Dev Mode**: Testar localmente
- **chrome://extensions/**: Debug e logs
- **Supabase Dashboard**: Monitorar Realtime
- **PostHog/Mixpanel**: Analytics da extensão

---

## Conclusão

A Fase 2 representa uma evolução significativa do Concurseiro App, transformando-o em uma plataforma completa de produtividade para concurseiros. A extensão de navegador não é apenas um complemento, mas sim uma parte fundamental da experiência do usuário, permitindo:

✅ **Controle total** sobre distrações durante estudo
✅ **Captura eficiente** de conteúdo de qualquer fonte
✅ **Integração perfeita** com o app web existente
✅ **Dados valiosos** sobre hábitos de estudo
✅ **Diferencial competitivo** no mercado de apps para concurseiros

Com a implementação completa desta fase, o Concurseiro App se posicionará como a **ferramenta mais completa** do mercado para preparação de concursos públicos.

---

**Documento criado em**: 04/10/2025
**Versão**: 1.0
**Status**: Planejamento
**Próximos passos**: Iniciar Fase 2.1 - Infraestrutura Base

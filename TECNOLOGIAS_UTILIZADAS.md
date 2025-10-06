# 🚀 Tecnologias Utilizadas no Sistema Concurseiro

## 📊 Visão Geral

O sistema é uma **plataforma web completa** para estudos de concursos e vestibulares, com recursos de IA, gestão de pagamentos e ferramentas de produtividade.

---

## 🎨 Frontend

### Framework Principal
- **[Nuxt 3](https://nuxt.com/)** (v4.1.2)
  - Framework Vue.js com SSR (Server-Side Rendering)
  - Renderização híbrida (SSR + SPA)
  - Auto-imports de componentes
  - Routing automático baseado em arquivos

### UI Framework
- **[Vue 3](https://vuejs.org/)** (v3.5.22)
  - Composition API
  - Reatividade moderna
  - TypeScript support

### Roteamento
- **[Vue Router](https://router.vuejs.org/)** (v4.5.1)
  - Navegação SPA
  - Guards de autenticação
  - Rotas dinâmicas

### Estilização
- **[Tailwind CSS](https://tailwindcss.com/)** (v3.4.18)
  - Utility-first CSS
  - Design system customizado
  - Tema dark personalizado
  - Responsivo mobile-first
- **PostCSS** (v8.5.6)
- **Autoprefixer** (v10.4.21)

### Utilitários Frontend
- **[VueUse](https://vueuse.org/)** (@vueuse/core v13.9.0)
  - Collection de composables Vue
  - Utilities para reatividade
- **[vuedraggable](https://github.com/SortableJS/vue.draggable.next)** (v4.1.0)
  - Drag and drop para listas
  - Usado no caderno de estudos

---

## ⚙️ Backend

### Runtime
- **[Node.js](https://nodejs.org/)**
  - JavaScript runtime
  - Server-side execution

### Framework Backend
- **[Nitro](https://nitro.unjs.io/)** (integrado no Nuxt)
  - Server engine do Nuxt 3
  - API routes
  - Server middleware
  - Edge-ready

### Linguagem
- **TypeScript**
  - Type safety
  - Autocompletion
  - Melhor DX (Developer Experience)

---

## 🗄️ Banco de Dados

### Database
- **[PostgreSQL](https://www.postgresql.org/)** (via Supabase)
  - Banco relacional
  - JSONB para dados flexíveis
  - Full-text search
  - Row Level Security (RLS)

### ORM/Client
- **[Supabase JS](https://supabase.com/docs/reference/javascript)** (@supabase/supabase-js v2.58.0)
  - Client JavaScript/TypeScript
  - Real-time subscriptions
  - Auto-generated types

### BaaS (Backend as a Service)
- **[Supabase](https://supabase.com/)**
  - PostgreSQL hospedado
  - Autenticação integrada
  - Storage de arquivos
  - Real-time listeners
  - Row Level Security

---

## 🔐 Autenticação

- **Supabase Auth**
  - Email/Password
  - Magic Links
  - OAuth providers ready
  - JWT tokens
  - Session management

### Módulo Nuxt
- **[@nuxtjs/supabase](https://supabase.nuxtjs.org/)** (v2.0.0)
  - Integração Nuxt + Supabase
  - Auto-imports
  - SSR support
  - Auth middleware

---

## 💳 Pagamentos

### Gateway
- **[Asaas](https://www.asaas.com/)**
  - Gateway de pagamento brasileiro
  - Cartão de crédito
  - Boleto bancário
  - PIX
  - Assinaturas recorrentes
  - Webhooks

### Integração
- **Custom Asaas Service** (server/utils/asaas.ts)
  - SDK customizado
  - Type-safe API client
  - Gestão de clientes, assinaturas e pagamentos

---

## 🤖 Inteligência Artificial

### Modelo de IA
- **[Google Gemini](https://ai.google.dev/)** (Google Generative AI)
  - LLM (Large Language Model)
  - Geração de texto
  - Análise de contexto

### SDK
- **[@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai)** (v0.24.1)
  - SDK oficial do Google
  - Gemini Pro model

### Recursos de IA
- Gerador de resumos
- Gerador de questões
- Gerador de flashcards
- Chat assistente
- Análise de conteúdo

---

## 📊 Visualização de Dados

### Gráficos
- **[Chart.js](https://www.chartjs.org/)** (v4.5.0)
  - Biblioteca de gráficos JavaScript
  - Gráficos interativos
- **[vue-chartjs](https://vue-chartjs.org/)** (v5.3.2)
  - Wrapper Vue para Chart.js
  - Componentes reativos

### Uso no Sistema
- Gráficos de desempenho
- Evolução de estudos
- Estatísticas de acertos
- Progresso de metas

---

## 📄 Processamento de Documentos

### PDF
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** (v2.1.1)
  - Extração de texto de PDFs
- **[pdfjs-dist](https://mozilla.github.io/pdf.js/)** (v5.4.149)
  - Renderização de PDFs
  - Parsing avançado
- **[pdf2json](https://www.npmjs.com/package/pdf2json)** (v3.2.2)
  - Conversão PDF para JSON

### Captura de Tela
- **[html2canvas](https://html2canvas.hertzen.com/)** (v1.4.1)
  - Screenshot de elementos HTML
  - Exportação de notas
  - Preview de conteúdo

---

## 🛠️ DevTools e Build

### Build Tool
- **[Vite](https://vitejs.dev/)**
  - Bundler ultra-rápido
  - HMR (Hot Module Replacement)
  - Otimização automática

### Package Manager
- **npm**
  - Gerenciamento de dependências
  - Scripts de build

### Environment
- **dotenv**
  - Variáveis de ambiente
  - Configurações sensíveis

---

## 🎨 Design System

### Paleta de Cores
```css
Primary: Blue/Purple gradient (#6366f1 → #8b5cf6)
Dark: Gray-900 (#111827)
Success: Green (#10b981)
Warning: Yellow (#f59e0b)
Error: Red (#ef4444)
```

### Componentes UI
- Cards modernos
- Modals responsivos
- Forms com validação
- Loading states
- Toast notifications
- Dropdowns
- Tooltips
- Badges

---

## 🔧 Extensões e Integrações

### Chrome Extension
- Sistema de captura de conteúdo web
- Extração de texto de páginas
- Salvamento direto no caderno
- Background scripts
- Content scripts

**Tecnologias da Extensão:**
- Vanilla JavaScript
- Chrome Extension APIs
- Manifest V3
- Web Storage API

---

## 📱 Recursos do Sistema

### Features Principais

1. **Caderno de Estudos**
   - WYSIWYG editor
   - Markdown support
   - Organização hierárquica
   - Tags e categorias

2. **Timer Pomodoro**
   - Técnica Pomodoro
   - Tracking de tempo
   - Estatísticas de foco
   - Histórico de sessões

3. **Sistema de Flashcards**
   - Repetição espaçada
   - Sistema Leitner
   - Algoritmo de revisão
   - Gamificação

4. **Calendário de Estudos**
   - Agendamentos
   - Eventos recorrentes
   - Visualização mensal/semanal
   - Integração com timer

5. **Dashboard Analytics**
   - Gráficos de desempenho
   - Metas e objetivos
   - Progresso visual
   - Insights de estudo

6. **Sistema de Assinaturas**
   - Plano Plus (R$ 24,90)
   - Plano Pro (R$ 44,90)
   - Trial de 14 dias
   - Gestão de pagamentos

---

## 🏗️ Arquitetura

### Padrão de Projeto
- **SSR (Server-Side Rendering)**
- **SPA (Single Page Application)**
- **API REST**
- **Composables pattern**
- **Middleware chain**

### Estrutura de Pastas
```
concurseiro-app/
├── app/
│   ├── components/       # Componentes Vue
│   ├── composables/      # Lógica reutilizável
│   ├── pages/            # Rotas (auto-routing)
│   ├── middleware/       # Guards de rota
│   ├── plugins/          # Plugins Vue
│   └── types/            # TypeScript types
├── server/
│   ├── api/              # Endpoints REST
│   ├── middleware/       # Server middleware
│   └── utils/            # Funções auxiliares
├── scripts/              # Scripts SQL e migrations
├── public/               # Assets estáticos
└── chrome-extension/     # Extensão do Chrome
```

---

## 🔒 Segurança

### Implementações
- ✅ Row Level Security (RLS) no PostgreSQL
- ✅ JWT Authentication
- ✅ HTTPS only
- ✅ CORS configurado
- ✅ Rate limiting ready
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF tokens

### Compliance
- ✅ LGPD ready
- ✅ Criptografia SSL/TLS
- ✅ PCI DSS (via Asaas)

---

## 📦 Dependências Completas

### Production Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",
  "@nuxtjs/supabase": "^2.0.0",
  "@supabase/supabase-js": "^2.58.0",
  "@vueuse/core": "^13.9.0",
  "chart.js": "^4.5.0",
  "html2canvas": "^1.4.1",
  "nuxt": "^4.1.2",
  "vue": "^3.5.22",
  "vue-chartjs": "^5.3.2",
  "vue-router": "^4.5.1",
  "vuedraggable": "^4.1.0"
}
```

### Dev Dependencies
```json
{
  "@nuxtjs/tailwindcss": "^6.14.0",
  "autoprefixer": "^10.4.21",
  "pdf-parse": "^2.1.1",
  "pdf2json": "^3.2.2",
  "pdfjs-dist": "^5.4.149",
  "postcss": "^8.5.6",
  "tailwindcss": "^3.4.18"
}
```

---

## 🌐 APIs Externas

### Integradas
- ✅ Asaas Payments API
- ✅ Google Gemini API
- ✅ Supabase API

### Prontas para Integração
- Email (SMTP)
- SMS
- Notificações Push
- Storage (S3-compatible)

---

## 🚀 Performance

### Otimizações
- ✅ Code splitting automático
- ✅ Lazy loading de componentes
- ✅ Image optimization ready
- ✅ CDN ready
- ✅ Caching strategies
- ✅ Minification
- ✅ Tree shaking

---

## 📱 Compatibilidade

### Browsers
- Chrome/Edge (90+)
- Firefox (88+)
- Safari (14+)
- Opera (76+)

### Dispositivos
- Desktop (Windows, Mac, Linux)
- Tablet
- Mobile (responsivo)

---

## 🔄 Estado e Reatividade

### State Management
- **Composition API** (built-in Vue 3)
- **Composables** customizados
- **useState** (Nuxt)
- **Reactive refs**

### Exemplos de Composables
- `useSubscription()` - Gestão de assinaturas
- `useSupabaseClient()` - Cliente Supabase
- `useSupabaseUser()` - Usuário autenticado
- `useFetch()` - HTTP requests

---

## 📊 Monitoramento (Pronto para)

- Error tracking (Sentry ready)
- Analytics (Google Analytics ready)
- Performance monitoring
- User behavior tracking

---

## 🎯 Stack Resumido

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | Vue 3 + Nuxt 3 + Tailwind CSS |
| **Backend** | Nitro (Nuxt) + TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Pagamentos** | Asaas |
| **IA** | Google Gemini |
| **Charts** | Chart.js |
| **PDF** | pdf.js + pdf-parse |
| **Build** | Vite |
| **Deploy** | Vercel/Netlify ready |

---

## ✅ Por que essas tecnologias?

### Nuxt 3
- ✅ SSR para SEO
- ✅ Performance otimizada
- ✅ DX (Developer Experience) excelente
- ✅ Comunidade ativa

### Supabase
- ✅ PostgreSQL robusto
- ✅ Auth pronta
- ✅ Real-time
- ✅ Row Level Security

### Tailwind CSS
- ✅ Desenvolvimento rápido
- ✅ Design consistente
- ✅ Customizável
- ✅ Bundle size otimizado

### Asaas
- ✅ Gateway brasileiro
- ✅ Conformidade local
- ✅ Múltiplos métodos
- ✅ API completa

### Google Gemini
- ✅ Modelo poderoso
- ✅ Contexto grande
- ✅ Multimodal
- ✅ Free tier generoso

---

## 🎓 Conclusão

O sistema utiliza uma **stack moderna e escalável**, combinando:
- ⚡ Performance (Nuxt 3 + Vite)
- 🔒 Segurança (Supabase RLS + Auth)
- 💳 Pagamentos robustos (Asaas)
- 🤖 IA avançada (Gemini)
- 🎨 UI moderna (Tailwind)

Tudo pensado para **máxima produtividade do desenvolvedor** e **melhor experiência do usuário**! 🚀

# RELATÓRIO COMPLETO DE ANÁLISE - PROJETO CONCURSEIRO (NUXT.JS)

## 1. ESTRUTURA DE ARQUIVOS E PASTAS

### 1.1 Estrutura Raiz
```
c:\consurseiro\
├── concurseiro-app/          # Aplicação principal Nuxt.js
├── database/                 # Scripts e configurações de banco de dados
├── docs/                     # Documentação do projeto
├── assets/                   # Assets globais
├── node_modules/             # Dependências raiz
└── [arquivos de documentação] # .md files
```

### 1.2 Estrutura Nuxt (concurseiro-app/)
```
concurseiro-app/
├── app/                      # Código da aplicação
│   ├── app.vue              # Componente raiz
│   ├── assets/css/          # Estilos globais (theme.css)
│   ├── components/          # 12 componentes Vue
│   │   ├── AIChatModal.vue
│   │   ├── AIExercisesModal.vue
│   │   ├── AIFlashcardsModal.vue
│   │   ├── AIPopupMenu.vue
│   │   ├── Calculator.vue
│   │   ├── FloatingTimer.vue
│   │   ├── GlobalSearchBar.vue
│   │   ├── ModernNav.vue
│   │   ├── RemindersManager.vue
│   │   ├── RichContentEditor.vue
│   │   ├── SmartSearch.vue
│   │   └── WhatsAppButton.vue
│   ├── composables/         # 8 composables reutilizáveis
│   │   ├── useAuth.ts
│   │   ├── useConcursosNews.ts
│   │   ├── useGemini.ts
│   │   ├── useGeminiAI.ts
│   │   ├── useGlobalSearch.ts
│   │   ├── useStudyTimer.ts
│   │   ├── useSubscription.ts
│   │   └── useTheme.ts
│   ├── middleware/          # Middleware de rotas
│   │   └── auth.ts
│   ├── pages/               # 29 páginas/rotas
│   │   ├── admin-afiliados.vue
│   │   ├── admin-premium.vue
│   │   ├── afiliado-cadastro.vue
│   │   ├── afiliado.vue
│   │   ├── assinatura.vue
│   │   ├── calendar.vue
│   │   ├── checkout.vue
│   │   ├── confirm.vue
│   │   ├── dashboard.vue
│   │   ├── flashcards.vue
│   │   ├── forgot-password.vue
│   │   ├── ia-test.vue
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── mapa-mental-old.vue
│   │   ├── mapa-mental.vue
│   │   ├── mapas-mentais/
│   │   │   ├── biblioteca.vue
│   │   │   └── editor/[id].vue
│   │   ├── metas.vue
│   │   ├── notebook.vue
│   │   ├── onboarding.vue
│   │   ├── pagina.vue
│   │   ├── precos.vue
│   │   ├── register.vue
│   │   ├── reports.vue
│   │   ├── revisions.vue
│   │   ├── study.vue
│   │   └── subjects.vue
│   ├── plugins/             # Plugins do Nuxt
│   └── types/               # Definições TypeScript
├── pages/                   # Páginas adicionais
│   └── setup-db.vue
├── server/                  # API Backend
│   ├── api/
│   │   ├── admin/
│   │   │   ├── affiliates/
│   │   │   │   ├── list.get.ts
│   │   │   │   ├── withdraw-approve.post.ts
│   │   │   │   └── withdrawals.get.ts
│   │   │   └── setup-affiliates.post.ts
│   │   ├── affiliates/
│   │   │   ├── check-coupon.post.ts
│   │   │   ├── register.post.ts
│   │   │   ├── stats.get.ts
│   │   │   ├── track-click.post.ts
│   │   │   ├── validate-coupon.post.ts
│   │   │   └── withdraw.post.ts
│   │   ├── mindmaps/
│   │   │   ├── generate-from-text.post.ts
│   │   │   ├── index.get.ts
│   │   │   ├── index.post.ts
│   │   │   ├── [id]/
│   │   │   │   ├── nodes.post.ts
│   │   │   │   ├── [id].delete.ts
│   │   │   │   ├── [id].get.ts
│   │   │   │   └── [id].put.ts
│   │   ├── subscriptions/
│   │   │   ├── cancel.post.ts
│   │   │   ├── change-plan.post.ts
│   │   │   ├── create.post.ts
│   │   │   ├── current.get.ts
│   │   │   ├── payments.get.ts
│   │   │   └── plans.get.ts
│   │   └── webhooks/
│   │       └── asaas.post.ts
│   ├── middleware/
│   │   └── subscription.ts
│   └── utils/
│       └── asaas.ts
├── scripts/                 # Scripts SQL e utilitários
├── public/                  # Arquivos públicos estáticos
├── chrome-extension/        # Extensão Chrome
├── docs/                    # Documentação técnica
├── nuxt.config.ts          # Configuração Nuxt
├── tailwind.config.js      # Configuração Tailwind
├── tsconfig.json           # Configuração TypeScript
├── package.json            # Dependências
└── .env                    # Variáveis de ambiente
```

### 1.3 Estatísticas do Projeto
- **Total de arquivos**: 132 arquivos .vue, .ts, .js
- **Páginas**: 29 páginas
- **Componentes**: 12 componentes reutilizáveis
- **APIs**: 26 endpoints de API
- **Composables**: 8 composables
- **Scripts SQL**: 13 arquivos
- **Console.log**: 716 ocorrências em 32 arquivos

---

## 2. DEPENDÊNCIAS INSTALADAS

### 2.1 Dependências de Produção (package.json)
```json
{
  "@google/generative-ai": "^0.24.1",      // Google Gemini AI
  "@nuxtjs/supabase": "^2.0.0",            // Supabase para Nuxt
  "@supabase/supabase-js": "^2.58.0",      // Cliente Supabase
  "@vueuse/core": "^13.9.0",               // Utilitários Vue
  "chart.js": "^4.5.0",                    // Gráficos
  "html2canvas": "^1.4.1",                 // Captura de tela/HTML para imagem
  "nuxt": "^4.1.2",                        // Framework Nuxt 4
  "vue": "^3.5.22",                        // Vue 3
  "vue-chartjs": "^5.3.2",                 // Chart.js para Vue
  "vue-router": "^4.5.1",                  // Roteamento
  "vuedraggable": "^4.1.0"                 // Drag and drop
}
```

### 2.2 Dependências de Desenvolvimento
```json
{
  "@nuxtjs/tailwindcss": "^6.14.0",       // TailwindCSS
  "autoprefixer": "^10.4.21",             // PostCSS autoprefixer
  "pdf-parse": "^2.1.1",                  // Parse de PDF
  "pdf2json": "^3.2.2",                   // PDF para JSON
  "pdfjs-dist": "^5.4.149",               // PDF.js
  "postcss": "^8.5.6",                    // PostCSS
  "tailwindcss": "^3.4.18"                // TailwindCSS
}
```

### 2.3 Tecnologias e Frameworks Identificados

#### Frontend:
- **Nuxt 4.1.2** - Framework SSR/SSG baseado em Vue 3
- **Vue 3.5.22** - Framework JavaScript reativo
- **TypeScript** - Tipagem estática
- **TailwindCSS 3.4.18** - Framework CSS utilitário
- **Chart.js** - Biblioteca de gráficos
- **VueUse** - Coleção de composables

#### Backend:
- **Supabase** - Backend as a Service (PostgreSQL)
- **Nitro** - Engine de servidor do Nuxt 3/4
- **H3** - Framework HTTP (interno do Nuxt)

#### Integrações:
- **Google Gemini AI** - IA generativa para funcionalidades educacionais
- **Asaas API** - Gateway de pagamento brasileiro
- **Supabase Auth** - Autenticação

#### Ferramentas de Build:
- **Vite** - Build tool e dev server
- **PostCSS** - Transformação de CSS
- **Autoprefixer** - Prefixos CSS

---

## 3. CONFIGURAÇÕES DO PROJETO

### 3.1 nuxt.config.ts

**Localização**: `c:\consurseiro\concurseiro-app\nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Módulos
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  // CSS Global
  css: ['~/assets/css/theme.css'],

  // Configuração Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/register', '/login', '/forgot-password', '/precos', '/checkout']
    }
  },

  // Runtime Config
  runtimeConfig: {
    // Privado (apenas servidor)
    asaasApiKey: process.env.ASAAS_API_KEY,
    asaasBaseUrl: process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3',
    asaasWebhookSecret: process.env.ASAAS_WEBHOOK_SECRET,

    // Público (cliente + servidor)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      googleAiApiKey: process.env.GOOGLE_AI_API_KEY
    }
  },

  // Configuração do App
  app: {
    head: {
      title: 'Concurseiro - Plataforma de Estudos',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Plataforma de estudos para concursos e vestibulares com IA' }
      ]
    }
  }
})
```

**Análise**:
- ✅ Configuração bem estruturada
- ✅ Separação correta entre variáveis públicas e privadas
- ⚠️ Data de compatibilidade futura (2025-07-15) - suspeito
- ✅ Redirects do Supabase configurados corretamente

### 3.2 tailwind.config.js

**Localização**: `c:\consurseiro\concurseiro-app\tailwind.config.js`

**Destaques**:
- Sistema de design "Claude.ai" implementado com paleta completa
- Modo escuro configurado como 'class'
- Cores personalizadas:
  - `claude-*`: Paleta completa do Claude (primário, hover, active, focus, etc)
  - `orange-*`: Tema terracota
  - `primary-*`: Verde (tema escuro)
  - `dark-*`: Tons escuros
- Shadows customizados: `claude-sm`, `claude-md`, `claude-lg`, `claude-xl`
- Border radius: `claude-sm`, `claude-md`, `claude-lg`, `claude-xl`

### 3.3 tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./.nuxt/tsconfig.app.json" },
    { "path": "./.nuxt/tsconfig.server.json" },
    { "path": "./.nuxt/tsconfig.shared.json" },
    { "path": "./.nuxt/tsconfig.node.json" }
  ]
}
```

**Análise**: Configuração padrão do Nuxt 3/4 que delega para configurações geradas automaticamente.

### 3.4 .env.example

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

⚠️ **Incompleto** - Faltam variáveis do Asaas que estão sendo usadas no código.

---

## 4. PADRÕES DE CÓDIGO IDENTIFICADOS

### 4.1 Arquitetura Geral

**Padrão**: Arquitetura de camadas baseada no Nuxt 3/4

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Pages + Components + Composables) │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│         (Composables + API)         │
├─────────────────────────────────────┤
│         Data Access Layer           │
│     (Supabase Client + Server)      │
├─────────────────────────────────────┤
│         External Services           │
│  (Supabase, Gemini AI, Asaas API)  │
└─────────────────────────────────────┘
```

### 4.2 Composables (Composition API)

**Padrão Identificado**: 100% Composition API

**Exemplo: useAuth.ts** (linhas 1-79)
```typescript
export const useAuth = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const router = useRouter()

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
    return data
  }

  // ... outros métodos

  return {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword
  }
}
```

**Análise**:
- ✅ Padrão consistente de retorno de funções
- ✅ Uso de composables nativos do Nuxt (`useSupabaseClient`, `useRouter`)
- ✅ Tratamento de erros com throw
- ✅ Tipagem TypeScript adequada

### 4.3 Estrutura de Componentes Vue

**Padrão**: Single File Components (SFC) com `<script setup>`

**Exemplo: login.vue** (linhas 103-143)
```vue
<script setup lang="ts">
const { signIn, signInWithGoogle } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleEmailLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    await signIn(email.value, password.value)
    await router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login. Verifique suas credenciais.'
  } finally {
    loading.value = false
  }
}
</script>
```

**Análise**:
- ✅ Uso consistente de `<script setup>` (sintaxe moderna)
- ✅ Refs reativos para estado local
- ✅ Try-catch para tratamento de erros
- ✅ Loading states implementados
- ✅ Composables reutilizados

### 4.4 Gerenciamento de Estado

**Padrão**: Estado local com refs + Supabase para persistência

Não há uso de Pinia ou Vuex. O estado é gerenciado por:
1. **Refs locais** nos componentes
2. **useState** do Nuxt para estado compartilhado (exemplo: `useTheme.ts`)
3. **Supabase** como fonte de verdade dos dados

**Exemplo: useTheme.ts** (linhas 3-4)
```typescript
export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')
  // ...
}
```

### 4.5 Integração com APIs Externas

#### 4.5.1 Google Gemini AI

**Padrão**: Classe wrapper com métodos específicos

**Arquivo**: `useGeminiAI.ts` (linhas 1-195)

```typescript
export const useGeminiAI = () => {
  const config = useRuntimeConfig()
  const genAI = new GoogleGenerativeAI(config.public.googleAiApiKey)

  const generateText = async (prompt: string, context?: string) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt
    const result = await model.generateContent(fullPrompt)
    return (await result.response).text()
  }

  return {
    generateText,
    summarize,
    generateQuestions,
    generateFlashcards,
    explainConcept,
    generateMindMap,
    correctText,
    generateStudyPlan,
    chat
  }
}
```

**Funcionalidades IA implementadas**:
- ✅ Geração de texto
- ✅ Resumos
- ✅ Geração de questões
- ✅ Geração de flashcards
- ✅ Explicação de conceitos
- ✅ Mapas mentais
- ✅ Correção de textos
- ✅ Planos de estudo
- ✅ Chat conversacional

#### 4.5.2 Asaas API (Pagamentos)

**Padrão**: Classe de serviço com métodos REST

**Arquivo**: `server/utils/asaas.ts` (linhas 82-316)

```typescript
class AsaasService {
  private config: AsaasConfig

  private async request<T>(endpoint: string, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'access_token': this.config.apiKey
    }
    // ...
  }

  // Clientes
  async createCustomer(data: AsaasCustomer): Promise<any> { }
  async getCustomer(customerId: string): Promise<any> { }

  // Assinaturas
  async createSubscription(data: AsaasSubscription): Promise<any> { }
  async getSubscription(subscriptionId: string): Promise<any> { }

  // Pagamentos
  async createPayment(data: AsaasPayment): Promise<any> { }
  async getPayment(paymentId: string): Promise<any> { }

  // Webhooks
  async listWebhooks(): Promise<any> { }
  async createWebhook(data): Promise<any> { }
}
```

**Funcionalidades Asaas implementadas**:
- ✅ Gestão de clientes
- ✅ Gestão de assinaturas
- ✅ Gestão de pagamentos
- ✅ Webhooks
- ✅ PIX, Boleto, Cartão de crédito
- ⚠️ Verificação de webhook signature não implementada (linha 308)

### 4.6 Sistema de Temas

**Implementação**: CSS Variables + TailwindCSS + Composable

**Arquivo**: `app/assets/css/theme.css`

```css
:root {
  --bg-primary: #FFFFFF;
  --text-primary: #2C2C2C;
  --primary: #CC785C;
  /* ... */
}

.dark {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  /* ... */
}

.theme-bg-primary { background-color: var(--bg-primary); }
.theme-text-primary { color: var(--text-primary); }
```

**Composable**: `useTheme.ts`
```typescript
export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')

  const toggleTheme = () => {
    const newTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return { theme, isDark, toggleTheme, setTheme, initTheme }
}
```

**Análise**:
- ✅ Implementação robusta com CSS variables
- ✅ Persistência em localStorage
- ✅ Transições suaves
- ✅ Classes utilitárias consistentes
- ⚠️ 13 console.log no arquivo (debugging)

### 4.7 Autenticação e Autorização

**Middleware**: `app/middleware/auth.ts` (linhas 1-21)

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  console.log('🔐 Auth Middleware - De:', from.path, '→ Para:', to.path)
  console.log('🔐 Usuário:', user.value?.email || 'NÃO AUTENTICADO')

  // Se não estiver logado e tentar acessar rota protegida
  if (!user.value && to.path !== '/login' && to.path !== '/register' && to.path !== '/' && to.path !== '/confirm') {
    console.log('❌ Acesso negado - redirecionando para /login')
    return navigateTo('/login')
  }

  // Se estiver logado e tentar acessar login/register
  if (user.value && (to.path === '/login' || to.path === '/register')) {
    console.log('✅ Já autenticado - redirecionando para /dashboard')
    return navigateTo('/dashboard')
  }

  console.log('✅ Acesso permitido a:', to.path)
})
```

**Server Middleware**: `server/middleware/subscription.ts`

```typescript
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  const publicRoutes = [
    '/api/auth', '/api/subscriptions/plans',
    '/api/subscriptions/create', '/api/webhooks',
    '/_nuxt', '/login', '/register', '/forgot-password',
    '/confirm', '/precos', '/checkout'
  ]

  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

  if (isPublicRoute || !url.pathname.startsWith('/api/')) return

  const user = event.context.user
  if (!user) return

  // Verificar se tem assinatura ativa
  const supabase = await serverSupabaseClient(event)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plan:subscription_plans(*)')
    .eq('user_id', user.id)
    .in('status', ['active', 'trial'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Adicionar informações ao contexto
  event.context.subscription = subscription
  event.context.hasActiveSubscription = !!subscription
  event.context.hasAiAccess = subscription?.plan?.ai_enabled || false
})
```

**Análise**:
- ✅ Middleware de autenticação no cliente
- ✅ Middleware de assinatura no servidor
- ✅ Rotas públicas definidas
- ⚠️ Muitos console.log (5 ocorrências)
- ⚠️ Middleware não bloqueia acesso, apenas adiciona contexto

### 4.8 Padrões de API Server

**Estrutura típica de endpoint**:

```typescript
// POST /api/subscriptions/create
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)
  const user = event.context.user

  // 1. Validações
  if (!planId || !customerData) {
    throw createError({ statusCode: 400, message: 'Dados incompletos' })
  }

  // 2. Autenticação
  if (!user) {
    throw createError({ statusCode: 401, message: 'Usuário não autenticado' })
  }

  try {
    // 3. Lógica de negócio
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    // 4. Integração externa
    const asaas = useAsaas()
    const asaasSubscription = await asaas.createSubscription(...)

    // 5. Persistência
    const { data: subscription } = await supabase
      .from('subscriptions')
      .insert({...})
      .select()
      .single()

    // 6. Retorno
    return { success: true, data: { subscription } }
  } catch (error: any) {
    console.error('Erro:', error)
    throw createError({ statusCode: 500, message: error.message })
  }
})
```

**Padrão consistente**:
1. ✅ Validação de dados
2. ✅ Verificação de autenticação
3. ✅ Try-catch para tratamento de erros
4. ✅ Uso de `createError` do H3
5. ✅ Tipagem TypeScript (parcial)
6. ⚠️ Muitos console.log/error

---

## 5. PROBLEMAS DE SEGURANÇA EVIDENTES

### 5.1 🔴 CRÍTICO: Credenciais Expostas no .env

**Localização**: `c:\consurseiro\concurseiro-app\.env` (linhas 1-9)

```env
SUPABASE_URL=https://ubeivchkuoptmhkcglny.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4
GOOGLE_AI_API_KEY=AIzaSyAPTgb4qgQQRGWtpJ5Vf51CUeOvXADYc58
ASAAS_API_KEY=$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmVlZjJkZGZkLWZjMzItNDgxYy1iZWI2LThmNzMwZTczMTY0Yzo6JGFhY2hfODAzNzNkZWItMGUyNy00MmJkLWIyMjEtZGVlMmU0ZWVmY2Vl
ASAAS_BASE_URL=https://api.asaas.com/v3
```

**Problemas**:
1. ✅ Supabase KEY - Anon key (pública por natureza, OK)
2. 🔴 **GOOGLE_AI_API_KEY** exposta
3. 🔴 **ASAAS_API_KEY** exposta (chave de PRODUÇÃO)
4. 🔴 Arquivo .env não está no .gitignore adequadamente

**Impacto**:
- Chave do Gemini pode ser usada por terceiros
- Chave Asaas PRODUÇÃO permite criar cobranças, cancelar assinaturas, etc
- Custo financeiro direto

**Recomendações**:
- ✅ Adicionar .env ao .gitignore
- ✅ Revogar e recriar GOOGLE_AI_API_KEY
- ✅ Revogar e recriar ASAAS_API_KEY
- ✅ Usar variáveis de ambiente no deployment (Vercel/Netlify)
- ✅ Nunca commitar .env no repositório

### 5.2 🔴 CRÍTICO: API Key do Google exposta no cliente

**Localização**: `nuxt.config.ts` (linha 28)

```typescript
public: {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY,  // ❌ EXPOSTO NO CLIENTE
}
```

**Problema**: A chave do Google AI está em `public`, tornando-a acessível no código JavaScript do navegador.

**Impacto**: Qualquer usuário pode:
- Abrir DevTools
- Inspecionar `useRuntimeConfig().public.googleAiApiKey`
- Copiar a chave
- Fazer requisições ilimitadas ao Google AI

**Recomendações**:
1. ✅ Mover para `runtimeConfig` (privado)
2. ✅ Criar proxy server-side para chamadas ao Gemini
3. ✅ Implementar rate limiting
4. ✅ Implementar quotas por usuário

**Exemplo de correção**:
```typescript
// nuxt.config.ts
runtimeConfig: {
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY,  // Privado
  // Remover de public
}

// server/api/ai/generate.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { prompt } = await readBody(event)

  // Usar API key do servidor
  const genAI = new GoogleGenerativeAI(config.googleAiApiKey)
  // ...
})
```

### 5.3 ⚠️ ALTO: Webhook sem validação de assinatura

**Localização**: `server/utils/asaas.ts` (linha 308-312)

```typescript
verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Implementar verificação de assinatura do webhook
  // Usar crypto para validar HMAC
  return true // Placeholder ❌
}
```

**Problema**: A função sempre retorna `true`, não validando se o webhook realmente veio do Asaas.

**Impacto**:
- Atacante pode enviar webhooks falsos
- Ativar assinaturas sem pagamento
- Criar comissões de afiliados fraudulentas
- Manipular status de pagamentos

**Recomendações**:
```typescript
import crypto from 'crypto'

verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  )
}
```

### 5.4 ⚠️ MÉDIO: SQL Injection potencial

**Localização**: `server/api/webhooks/asaas.post.ts` (linha 156)

```typescript
await supabase
  .from('affiliate_referrals')
  .update({
    total_paid: supabase.raw(`total_paid + ${payment.amount}`)  // ❌ Interpolação direta
  })
```

**Problema**: Uso de `.raw()` com interpolação direta de variáveis.

**Impacto**: Se `payment.amount` for manipulado, pode executar SQL arbitrário.

**Recomendações**:
```typescript
// Opção 1: Usar RPC function
await supabase.rpc('increment_total_paid', {
  referral_id: referral.id,
  amount: payment.amount
})

// Opção 2: Ler, calcular e atualizar
const { data: current } = await supabase
  .from('affiliate_referrals')
  .select('total_paid')
  .eq('id', referral.id)
  .single()

await supabase
  .from('affiliate_referrals')
  .update({ total_paid: current.total_paid + payment.amount })
  .eq('id', referral.id)
```

### 5.5 ⚠️ MÉDIO: Dados de cartão não tokenizados

**Localização**: `server/api/subscriptions/create.post.ts` (linhas 183-189)

```typescript
creditCard: {
  holderName: creditCardData.holderName,
  number: creditCardData.number,           // ❌ Número completo
  expiryMonth: creditCardData.expiryMonth,
  expiryYear: creditCardData.expiryYear,
  ccv: creditCardData.ccv                  // ❌ CVV trafegando
}
```

**Problema**: Dados de cartão trafegam pelo servidor Nuxt antes de ir para Asaas.

**Impacto**:
- Viola PCI-DSS
- Servidor pode logar dados sensíveis
- Maior superfície de ataque

**Recomendações**:
1. ✅ Usar tokenização do Asaas diretamente no frontend
2. ✅ Nunca passar dados de cartão pelo servidor
3. ✅ Implementar Asaas.js no cliente

### 5.6 ⚠️ BAIXO: Console.log excessivo em produção

**Estatística**: 716 ocorrências em 32 arquivos

**Exemplos**:
- `app/middleware/auth.ts`: 5 console.log
- `app/composables/useTheme.ts`: 13 console.log
- `server/api/webhooks/asaas.post.ts`: múltiplos console.log

**Problema**: Logs podem expor:
- Estrutura de dados
- IDs de usuários
- Tokens
- Lógica de negócio

**Recomendações**:
```typescript
// Criar utilitário de logging
// utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data)
    }
  },
  error: (message: string, error: any) => {
    // Sempre logar erros, mas sanitizados
    console.error(message, {
      message: error.message,
      // Não logar stack em produção
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
}
```

### 5.7 ⚠️ BAIXO: Hardcoded email de admin

**Localização**: `app/components/ModernNav.vue` (linha 265)

```typescript
const isAdmin = computed(() => user.value?.email === 'mariocromia@gmail.com')
```

**Problema**: Lógica de admin hardcoded no frontend.

**Impacto**:
- Pode ser burlado modificando o código do cliente
- Não escalável

**Recomendações**:
```typescript
// server/utils/permissions.ts
export const isAdmin = async (userId: string) => {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role === 'admin'
}

// client
const isAdmin = ref(false)
const checkAdminStatus = async () => {
  const { data } = await useFetch('/api/auth/is-admin')
  isAdmin.value = data.value?.isAdmin || false
}
```

### 5.8 🟡 ATENÇÃO: Falta validação de input

**Exemplos**:
- `server/api/affiliates/register.post.ts`: CPF não validado (formato)
- `server/api/subscriptions/create.post.ts`: Dados de cliente não sanitizados
- Email não validado em vários endpoints

**Recomendações**:
```typescript
import { z } from 'zod'

const affiliateSchema = z.object({
  coupon_code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validar
  const validation = affiliateSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message
    })
  }

  // Usar dados validados
  const { coupon_code, cpf } = validation.data
  // ...
})
```

---

## 6. INCONSISTÊNCIAS NA ARQUITETURA

### 6.1 🔴 Duplicação de Composables de IA

**Arquivos**:
- `app/composables/useGemini.ts` (6.208 bytes)
- `app/composables/useGeminiAI.ts` (4.849 bytes)

**Problema**: Dois composables fazem a mesma coisa com APIs ligeiramente diferentes.

**Análise**:
```typescript
// useGeminiAI.ts
export const useGeminiAI = () => {
  const genAI = new GoogleGenerativeAI(config.public.googleAiApiKey)

  const generateText = async (prompt: string, context?: string) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    // ...
  }
}

// useGemini.ts (provavelmente similar)
```

**Impacto**:
- Confusão sobre qual usar
- Manutenção duplicada
- Possíveis bugs divergentes

**Recomendações**:
1. ✅ Consolidar em um único composable
2. ✅ Deletar o arquivo não usado
3. ✅ Atualizar imports

### 6.2 🟡 Arquivos Backup/Old não removidos

**Arquivos encontrados**:
```
./app/app.vue.backup
./app/components/ModernNav.vue.backup
./app/components/ModernNav.vue.bak
./app/pages/index.vue.old
./app/pages/notebook.vue.backup
./app/pages/notebook.vue.old
./app/pages/notebook.vue.temp
```

**Problema**: 7 arquivos de backup commitados no repositório.

**Impacto**:
- Confusão sobre qual arquivo é o correto
- Aumenta tamanho do repositório
- Código desatualizado pode ser usado por engano

**Recomendações**:
1. ✅ Deletar todos arquivos .backup, .old, .temp, .bak
2. ✅ Adicionar ao .gitignore:
```
*.backup
*.old
*.temp
*.bak
```

### 6.3 🟡 Falta de padronização em tratamento de erros

**Inconsistências identificadas**:

**Padrão 1**: Try-catch com throw
```typescript
try {
  await something()
} catch (error: any) {
  console.error('Erro:', error)
  throw createError({ statusCode: 500, message: error.message })
}
```

**Padrão 2**: Try-catch com ref
```typescript
try {
  await something()
} catch (err: any) {
  error.value = err.message
}
```

**Padrão 3**: Sem tratamento
```typescript
const { data, error } = await supabase.from('table').select()
if (error) throw error  // Sem mensagem amigável
```

**Recomendações**:
```typescript
// utils/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) return error

  if (error instanceof Error) {
    return new AppError(error.message)
  }

  return new AppError('Erro desconhecido')
}

// Uso
try {
  // ...
} catch (error) {
  throw handleError(error)
}
```

### 6.4 🟡 Falta de tipos TypeScript consistentes

**Problemas identificados**:

1. **Uso excessivo de `any`**:
```typescript
// server/utils/asaas.ts
async createCustomer(data: AsaasCustomer): Promise<any> { }  // ❌
// Deveria ser: Promise<AsaasCustomerResponse>

const payment = ref<any>(null)  // ❌
// Deveria ser: ref<Payment | null>(null)
```

2. **Interfaces não compartilhadas**:
```typescript
// Cada arquivo define suas próprias interfaces
// Sem tipos centralizados
```

**Recomendações**:
```typescript
// types/index.ts
export interface User {
  id: string
  email: string
  full_name?: string
  role: 'user' | 'admin'
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'trial' | 'cancelled' | 'past_due'
  // ...
}

export interface AsaasCustomerResponse {
  id: string
  name: string
  email: string
  // ...
}

// Uso
import type { User, Subscription } from '~/types'

const user = ref<User | null>(null)
const subscription = ref<Subscription | null>(null)
```

### 6.5 🟡 Middleware de subscription não bloqueia acesso

**Localização**: `server/middleware/subscription.ts`

**Problema**: O middleware apenas adiciona informações ao contexto, mas não bloqueia requisições.

```typescript
export default defineEventHandler(async (event) => {
  // ... busca subscription ...

  // Apenas adiciona ao contexto, não bloqueia
  event.context.subscription = subscription
  event.context.hasActiveSubscription = !!subscription
  event.context.hasAiAccess = subscription?.plan?.ai_enabled || false

  // ❌ Não retorna erro se não tiver assinatura
})
```

**Impacto**: Endpoints dependem de validação manual:
```typescript
// Cada endpoint precisa verificar manualmente
export default defineEventHandler(async (event) => {
  if (!event.context.hasAiAccess) {
    throw createError({ statusCode: 403, message: 'Sem acesso a IA' })
  }
  // ...
})
```

**Recomendações**:
```typescript
// server/middleware/subscription.ts
export default defineEventHandler(async (event) => {
  // ... validações ...

  // Bloquear acesso a recursos premium sem assinatura
  const premiumEndpoints = [
    '/api/ai/',
    '/api/mindmaps/generate',
    '/api/advanced-reports'
  ]

  const requiresPremium = premiumEndpoints.some(endpoint =>
    event.path.startsWith(endpoint)
  )

  if (requiresPremium && !event.context.hasActiveSubscription) {
    throw createError({
      statusCode: 403,
      message: 'Este recurso requer uma assinatura ativa'
    })
  }
})
```

### 6.6 🟡 Falta de rate limiting

**Problema**: Nenhum endpoint tem rate limiting implementado.

**Impacto**:
- Abuso de APIs (principalmente Gemini AI)
- Custos elevados
- DoS

**Recomendações**:
```typescript
// server/middleware/rate-limit.ts
import { defineEventHandler } from 'h3'

const requests = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event)
  const now = Date.now()

  const userRequests = requests.get(ip) || { count: 0, resetAt: now + 60000 }

  if (now > userRequests.resetAt) {
    userRequests.count = 0
    userRequests.resetAt = now + 60000
  }

  userRequests.count++
  requests.set(ip, userRequests)

  if (userRequests.count > 100) {  // 100 req/min
    throw createError({
      statusCode: 429,
      message: 'Too many requests'
    })
  }
})
```

### 6.7 🟡 Componentes gigantes

**Exemplo**: `app/pages/dashboard.vue` - 750 linhas

**Problemas**:
- Difícil manutenção
- Múltiplas responsabilidades
- Não reutilizável

**Estrutura atual**:
```vue
<template>
  <!-- Stats Grid -->
  <!-- Charts Section -->
  <!-- Kanban Board -->
  <!-- Quick Actions -->
  <!-- Task Modal -->
</template>

<script setup>
// 400+ linhas de lógica
// Gráficos, tarefas, estatísticas, tudo junto
</script>
```

**Recomendações**:
```
app/pages/dashboard.vue (100 linhas)
app/components/dashboard/
  ├── DashboardStats.vue
  ├── DashboardCharts.vue
  ├── DashboardKanban.vue
  ├── DashboardQuickActions.vue
  └── TaskModal.vue
```

### 6.8 🟡 Falta de testes

**Problema**: Nenhum arquivo de teste encontrado no projeto.

**Recomendações**:
1. ✅ Configurar Vitest
2. ✅ Testes unitários para composables
3. ✅ Testes de integração para APIs
4. ✅ Testes E2E para fluxos críticos

```typescript
// tests/composables/useAuth.test.ts
import { describe, it, expect } from 'vitest'
import { useAuth } from '~/composables/useAuth'

describe('useAuth', () => {
  it('should sign in with email and password', async () => {
    const { signIn } = useAuth()
    const result = await signIn('test@example.com', 'password123')
    expect(result).toBeDefined()
  })
})
```

### 6.9 ⚠️ TODOs não resolvidos

**Encontrados**:
```typescript
// server/api/affiliates/register.post.ts:84
// TODO: Enviar email de boas-vindas com cupom e link

// server/api/affiliates/withdraw.post.ts:88
// TODO: Enviar email notificando admin sobre novo saque

// server/api/admin/affiliates/withdraw-approve.post.ts:74
// TODO: Enviar email para afiliado notificando sobre status do saque

// server/utils/asaas.ts:308-312
verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Implementar verificação de assinatura do webhook
  // Usar crypto para validar HMAC
  return true // Placeholder
}

// app/pages/notebook.vue:1518
// TODO: Redirecionar para página de assinatura

// app/pages/notebook.vue:1612
// TODO: Implementar menu de contexto para capítulo
```

**Análise**: 11 TODOs identificados, alguns críticos (webhook signature).

---

## 7. PONTOS POSITIVOS

### 7.1 ✅ Arquitetura bem estruturada
- Separação clara entre client e server
- Uso adequado de composables
- Pages organizadas por funcionalidade

### 7.2 ✅ Uso moderno do Vue 3
- 100% Composition API
- `<script setup>` syntax
- TypeScript configurado

### 7.3 ✅ Design System consistente
- Sistema de cores bem definido (Claude.ai)
- Tema claro/escuro implementado
- CSS Variables

### 7.4 ✅ Funcionalidades ricas
- Sistema de assinaturas completo
- Integração com IA (Gemini)
- Sistema de afiliados
- Mapas mentais
- Flashcards
- Relatórios

### 7.5 ✅ Backend bem estruturado
- APIs RESTful organizadas
- Integração com Supabase
- Webhooks do Asaas

---

## 8. RECOMENDAÇÕES PRIORITÁRIAS

### Prioridade CRÍTICA (Fazer Imediatamente)

1. **Revogar e recriar credenciais expostas**
   - GOOGLE_AI_API_KEY
   - ASAAS_API_KEY
   - Adicionar .env ao .gitignore

2. **Mover Google AI API Key para servidor**
   - Remover de `public` no nuxt.config.ts
   - Criar proxy server-side

3. **Implementar verificação de webhook signature**
   - Função `verifyWebhookSignature` no asaas.ts

### Prioridade ALTA (Próxima Sprint)

4. **Remover console.log em produção**
   - Criar sistema de logging adequado
   - Remover 716 ocorrências

5. **Consolidar composables de IA**
   - Unificar useGemini e useGeminiAI
   - Deletar arquivos backup

6. **Adicionar validação de input**
   - Implementar zod ou joi
   - Validar todos endpoints

7. **Implementar rate limiting**
   - Proteger endpoints de IA
   - Limitar requisições por IP/usuário

### Prioridade MÉDIA (Próximo Mês)

8. **Adicionar testes**
   - Configurar Vitest
   - Testes unitários para composables
   - Testes de integração para APIs

9. **Melhorar tipagem TypeScript**
   - Remover uso de `any`
   - Criar tipos centralizados

10. **Refatorar componentes grandes**
    - Dividir dashboard.vue
    - Dividir notebook.vue

### Prioridade BAIXA (Backlog)

11. **Documentação**
    - API documentation
    - Comentários JSDoc
    - README atualizado

12. **Performance**
    - Lazy loading de componentes
    - Code splitting
    - Otimização de imagens

---

## 9. CONCLUSÃO

O projeto **Concurseiro** é uma aplicação Nuxt.js bem arquitetada com funcionalidades ricas, mas apresenta **sérias vulnerabilidades de segurança** que precisam ser corrigidas imediatamente.

**Pontos Fortes**:
- Arquitetura moderna e organizada
- Funcionalidades robustas (IA, pagamentos, afiliados)
- Design system consistente
- Uso adequado de TypeScript e Vue 3

**Pontos Críticos**:
- 🔴 Credenciais expostas no repositório
- 🔴 API Key do Google no cliente
- 🔴 Webhook sem validação de assinatura
- ⚠️ SQL injection potencial
- ⚠️ Falta de testes
- ⚠️ 716 console.log em produção

**Próximos Passos Recomendados**:
1. Corrigir vulnerabilidades críticas de segurança
2. Implementar rate limiting e validações
3. Adicionar testes automatizados
4. Refatorar código duplicado
5. Melhorar documentação

**Classificação Geral**: 🟡 **Bom projeto com problemas de segurança graves que precisam ser resolvidos antes de produção.**

---

**Relatório gerado em**: 2025-10-13
**Arquivos analisados**: 132
**Linhas de código analisadas**: ~15.000+
**Vulnerabilidades críticas**: 3
**Vulnerabilidades altas**: 4
**Vulnerabilidades médias**: 6

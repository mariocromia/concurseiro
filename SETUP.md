# Concurseiro - Setup e Configuração

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Git configurado

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/mariocromia/concurseiro.git
cd concurseiro/concurseiro-app
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

O arquivo `.env` já está configurado com as credenciais do Supabase:

```env
SUPABASE_URL=https://ubeivchkuoptmhkcglny.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Configurar banco de dados no Supabase

1. Acesse o painel do Supabase: https://app.supabase.com
2. Navegue até SQL Editor
3. Execute o arquivo `../database/schema.sql`
4. Aguarde a criação de todas as tabelas

### 5. Configurar Google OAuth no Supabase

Para habilitar o login com Google:

1. Acesse o painel do Supabase
2. Vá em **Authentication** → **Providers**
3. Habilite o provider **Google**
4. Configure as credenciais OAuth do Google:

#### Criar credenciais no Google Cloud Console:

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - Application type: **Web application**
   - Name: **Concurseiro**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://ubeivchkuoptmhkcglny.supabase.co`
   - Authorized redirect URIs:
     - `https://ubeivchkuoptmhkcglny.supabase.co/auth/v1/callback`

6. Copie o **Client ID** e **Client Secret**
7. Cole no Supabase em Authentication → Providers → Google

### 6. Executar o projeto

```bash
npm run dev
```

O projeto estará disponível em: http://localhost:3000

## 🗄️ Estrutura do Projeto

```
concurseiro-app/
├── app/                    # App Vue principal
├── pages/                  # Páginas da aplicação
│   ├── index.vue          # Página inicial
│   ├── login.vue          # Login
│   ├── register.vue       # Registro
│   ├── confirm.vue        # Callback OAuth
│   └── dashboard.vue      # Dashboard principal
├── composables/           # Composables Vue
│   └── useAuth.ts        # Lógica de autenticação
├── middleware/           # Middlewares Nuxt
│   └── auth.ts          # Proteção de rotas
├── types/               # Tipos TypeScript
│   └── database.types.ts # Tipos do banco
├── public/             # Arquivos estáticos
├── .env               # Variáveis de ambiente
├── nuxt.config.ts    # Configuração Nuxt
└── tailwind.config.js # Configuração Tailwind
```

## 🔐 Autenticação

O sistema suporta:

- ✅ Login com email/senha
- ✅ Registro com email/senha
- ✅ Login com Google OAuth
- ✅ Recuperação de senha
- ✅ Proteção de rotas

## 🎯 Próximos Passos

Agora que o sistema de autenticação está funcionando, os próximos módulos a implementar são:

1. **Onboarding** - Wizard de configuração inicial
2. **Gestão de Matérias** - CRUD de matérias
3. **Cronômetro de Estudo** - Controle de tempo
4. **Sistema de Revisões** - R1, R2, R3...
5. **Caderno Virtual** - Editor de anotações
6. **Tutor IA** - Integração com Gemini/GPT
7. **Fábrica de Questões** - Geração de simulados

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run generate     # Gerar site estático
```

## 🐛 Troubleshooting

### Erro de conexão com Supabase

Verifique se:
- As credenciais no `.env` estão corretas
- O banco de dados foi criado (execute o `schema.sql`)
- As políticas RLS estão habilitadas

### Login com Google não funciona

Verifique se:
- As credenciais OAuth estão configuradas no Supabase
- As URLs de redirect estão corretas
- O provider Google está habilitado no Supabase

### Erro "User not found"

Execute o SQL no Supabase para garantir que o trigger está criado:

```sql
-- Verificar se o trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub:
https://github.com/mariocromia/concurseiro/issues

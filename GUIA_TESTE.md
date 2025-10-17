# 🎯 GUIA DE TESTE - Sistema PraPassar

## ⚠️ IMPORTANTE - CONFIGURAÇÃO DO BANCO DE DADOS

### Passo 1: Executar o Schema no Supabase

1. Acesse o Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Abra o arquivo `database/schema_safe.sql`
6. **Copie TODO o conteúdo** do arquivo
7. **Cole no SQL Editor** do Supabase
8. Clique em **RUN** (ou pressione Ctrl+Enter)
9. Aguarde a execução (pode demorar 10-30 segundos)
10. Verifique se não há erros em vermelho

### Passo 2: Verificar se as Tabelas Foram Criadas

1. No Supabase, vá em **SQL Editor**
2. Crie uma **New Query**
3. Abra o arquivo `database/verificar_tabelas.sql`
4. Cole o conteúdo e execute
5. Você deve ver as tabelas: `users`, `subjects`, `study_goals`, `tasks`, etc.

### Passo 3: Verificar Políticas RLS (Row Level Security)

As políticas RLS são ESSENCIAIS para o funcionamento. Verifique se foram criadas:

1. No Supabase, vá em **Authentication** > **Policies**
2. Selecione a tabela `subjects`
3. Você deve ver as seguintes políticas:
   - ✅ "Usuários podem ver suas próprias matérias" (SELECT)
   - ✅ "Usuários podem criar suas próprias matérias" (INSERT)
   - ✅ "Usuários podem atualizar suas próprias matérias" (UPDATE)
   - ✅ "Usuários podem deletar suas próprias matérias" (DELETE)

---

## 🚀 TESTANDO A APLICAÇÃO

### Servidor Rodando

O servidor Nuxt está rodando em: **http://localhost:3000/**

### Fluxo de Teste Completo

#### 1. **Registro de Novo Usuário**

1. Acesse: http://localhost:3000/
2. Clique em **"Cadastre-se grátis"**
3. Preencha:
   - Nome completo: Seu Nome
   - Email: seuemail@teste.com
   - Senha: 123456 (mínimo 6 caracteres)
   - Confirmar senha: 123456
4. Marque **"Concordo com os Termos"**
5. Clique em **"Criar conta grátis"**
6. Você será redirecionado para o login

#### 2. **Login**

1. Entre com o email e senha cadastrados
2. Você será redirecionado para: http://localhost:3000/onboarding

#### 3. **Onboarding (Primeira Configuração)**

**Passo 1 - Meta de Estudo:**
- Nome da meta: "Concurso TRF 2025"
- Descrição: "Preparação para o concurso do TRF"
- Data objetivo: 15/10/2025
- Clique em **"Continuar"**

**Passo 2 - Adicionar Matérias:**
- Adicione pelo menos 3 matérias:
  1. **Direito Administrativo** - Cor: Verde
  2. **Direito Constitucional** - Cor: Azul
  3. **Português** - Cor: Amarelo
- Clique em **"Finalizar"**

**Passo 3 - Conclusão:**
- Verifique o resumo
- Clique em **"Começar a estudar 🚀"**

#### 4. **Dashboard**

Você verá:
- ✅ Estatísticas (Tempo Hoje, Revisões, Matérias, Sequência)
- ✅ Gráficos de progresso semanal
- ✅ Mural de tarefas (Kanban)
- ✅ Ações rápidas (4 botões)

**Teste 1 - Adicionar uma Tarefa:**
1. Clique em **"Nova Tarefa"** no Mural de Tarefas
2. Preencha:
   - Título: "Estudar Atos Administrativos"
   - Descrição: "Capítulos 1 a 3"
   - Matéria: Direito Administrativo
   - Data: Amanhã
3. Clique em **"Criar"**
4. A tarefa aparece na coluna "A Fazer"

**Teste 2 - Mover Tarefa:**
1. Clique na tarefa criada
2. Mude o Status para "Em Progresso"
3. Clique em **"Salvar"**
4. A tarefa move para a coluna "Em Progresso"

#### 5. **Gerenciar Matérias**

1. No Dashboard, clique em **"Gerenciar Matérias"** (Ações Rápidas)
2. Você será levado para: http://localhost:3000/subjects

**Teste - Adicionar Matéria:**
1. No formulário superior:
   - Nome: "Raciocínio Lógico"
   - Cor: Roxo
2. Clique em **"Adicionar"**
3. A matéria aparece na lista abaixo
4. Você pode:
   - ✅ **Editar** a matéria
   - ✅ **Excluir** a matéria

**Teste - Editar Matéria:**
1. Clique em **"Editar"** em uma matéria
2. Altere o nome ou cor
3. Clique em **"Atualizar"**
4. Clique em **"Cancelar edição"** para voltar ao normal

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Não consigo adicionar matérias"

**Sintomas:**
- Clica em "Adicionar" mas nada acontece
- Aparece erro vermelho

**Solução:**
1. Abra o DevTools do navegador (F12)
2. Vá na aba **Console**
3. Procure por erros em vermelho
4. Se ver erro tipo `permission denied for table subjects`:
   - Execute o `schema_safe.sql` novamente no Supabase
   - Verifique as políticas RLS

### Problema 2: "RLS policy violated"

**Causa:** Políticas de segurança não foram criadas

**Solução:**
1. No Supabase SQL Editor, execute:
```sql
-- Habilitar RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Usuários podem ver suas próprias matérias"
ON public.subjects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias matérias"
ON public.subjects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias matérias"
ON public.subjects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias matérias"
ON public.subjects FOR DELETE
USING (auth.uid() = user_id);
```

### Problema 3: "Layout antigo ainda aparece"

**Solução:**
- Pressione **Ctrl + Shift + R** (ou Cmd + Shift + R no Mac)
- Isso força o navegador a recarregar sem cache

### Problema 4: "Servidor não está respondendo"

**Solução:**
1. Verifique se o servidor está rodando
2. Abra um terminal no VS Code
3. Execute:
```bash
cd c:\prapassar\prapassar-app
npm run dev
```
4. Aguarde ver: `✔ Vite client built`
5. Acesse: http://localhost:3000/

---

## 📊 CHECKLIST DE FUNCIONALIDADES

### ✅ Autenticação
- [x] Registro de novo usuário
- [x] Login com email/senha
- [x] Logout
- [x] Recuperação de senha
- [x] Redirecionamento automático

### ✅ Onboarding
- [x] Passo 1: Criar meta de estudo
- [x] Passo 2: Adicionar matérias
- [x] Passo 3: Resumo e conclusão
- [x] Navegação entre passos
- [x] Salvar dados no Supabase

### ✅ Dashboard
- [x] Estatísticas em tempo real
- [x] Gráfico de progresso semanal
- [x] Gráfico de distribuição por matéria
- [x] Mural de tarefas (Kanban)
- [x] Criar/editar/excluir tarefas
- [x] Mover tarefas entre colunas
- [x] Ações rápidas funcionais

### ✅ Gestão de Matérias
- [x] Listar matérias
- [x] Adicionar nova matéria
- [x] Editar matéria
- [x] Excluir matéria
- [x] Escolher cor da matéria
- [x] Contador de sessões e tempo

### 🔄 Em Desenvolvimento
- [ ] Cronômetro de estudos
- [ ] Caderno virtual
- [ ] Sistema de revisões espaçadas
- [ ] Gerador de questões (IA)
- [ ] Tutor inteligente (IA)

---

## 🎨 DESIGN ATUAL

**Cores:**
- Fundo: Gradiente escuro (dark-900 → dark-800 → dark-900)
- Primária: Verde (#22C55E)
- Texto: Branco/Cinza claro
- Bordas: Cinza escuro (dark-700)
- Cards: Fundo translúcido com backdrop blur

**Componentes:**
- Botões com gradiente verde
- Cards com hover effects
- Inputs escuros com foco verde
- Modais com backdrop blur

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique o console do navegador** (F12)
2. **Verifique o terminal do servidor**
3. **Execute o verificar_tabelas.sql** no Supabase
4. **Limpe o cache** (Ctrl+Shift+R)
5. **Reinicie o servidor** (Ctrl+C e npm run dev)

---

## 🎯 PRÓXIMOS PASSOS

Após testar tudo acima:

1. **Implementar página de estudos** com cronômetro
2. **Implementar caderno virtual** com editor rich text
3. **Implementar sistema de revisões** com algoritmo espaçado (R1, R2, R3...)
4. **Integrar IA** para tutor e gerador de questões
5. **Adicionar gráficos avançados** de performance

---

**Data de criação:** 02/10/2025
**Versão:** 1.0
**Status:** ✅ Pronto para teste

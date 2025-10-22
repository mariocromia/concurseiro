# 🔧 Instruções para Corrigir o Calendário de Estudos

## 🚨 PROBLEMA IDENTIFICADO

A tabela `study_schedules` **NÃO EXISTE** ou **NÃO ESTÁ CONFIGURADA CORRETAMENTE** no banco de dados Supabase. Isso explica 100% por que as atividades não estão sendo salvas.

---

## 📋 O QUE PRECISA SER FEITO

Você precisa executar 2 scripts SQL no painel do Supabase para criar/ajustar a tabela:

1. **Verificar status atual** (opcional, mas recomendado)
2. **Executar migração** (obrigatório)

---

## 🔍 PASSO 1: Verificar Status Atual (Opcional)

Este passo é opcional mas ajuda a entender o estado atual do banco.

### Como fazer:

1. Acesse o **Supabase Dashboard** (https://supabase.com)
2. Selecione seu projeto **PraPassar**
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**
5. Copie TODO o conteúdo do arquivo: `database/CHECK_TABLE_STATUS.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)

### O que você vai ver:

O script vai mostrar:
- ✅ Se a tabela existe
- 📊 Estrutura atual da tabela (colunas, tipos, etc)
- 🔒 Políticas de segurança configuradas
- 📈 Índices criados
- 📝 Quantidade de registros
- ✅ Verificação de colunas essenciais

**Resultado esperado:**
- Se mostrar "❌ Tabela NÃO EXISTE" → Precisa executar a migração
- Se mostrar "⚠️ Algumas colunas estão faltando" → Precisa executar a migração
- Se mostrar "✅ PERFEITO! Todas as colunas necessárias existem" → Pode pular para o PASSO 3

---

## 🛠️ PASSO 2: Executar Migração (OBRIGATÓRIO)

Este é o passo mais importante! Vai criar/ajustar a tabela para o formato correto.

### Como fazer:

1. Ainda no **SQL Editor** do Supabase
2. Crie uma **New query**
3. Copie TODO o conteúdo do arquivo: `database/migrations/2025-10-22_fix_study_schedules_for_calendar.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione Ctrl+Enter)

### O que o script faz:

✅ Cria a tabela `study_schedules` se não existir
✅ Adiciona todas as colunas necessárias:
   - `title` (VARCHAR) - Título da atividade
   - `description` (TEXT) - Descrição opcional
   - `scheduled_date` (DATE) - Data do agendamento
   - `start_time` (TIME) - Horário de início
   - `duration` (INTEGER) - Duração em minutos
   - `is_completed` (BOOLEAN) - Se foi concluída
   - `color` (VARCHAR) - Cor do agendamento
   - `subject_id` (UUID, NULLABLE) - Matéria (NULL para eventos)

✅ Torna `subject_id` NULLABLE (permite eventos sem matéria)
✅ Cria índices para melhor performance
✅ Configura políticas RLS (Row Level Security)
✅ Cria trigger para atualizar `updated_at` automaticamente
✅ Exibe verificação final mostrando se tudo está OK

### Resultado esperado:

Você vai ver várias mensagens tipo:
```
✅ Coluna title adicionada
✅ Coluna description adicionada
✅ Coluna scheduled_date adicionada
... (outras colunas)
✅ SUCESSO! Tabela configurada corretamente para o calendário
```

**⚠️ IMPORTANTE:**
- Se aparecer "⏭️ Coluna já existe" é normal, significa que a coluna já estava lá
- Se aparecer algum erro, leia com atenção e me avise para eu ajudar

---

## ✅ PASSO 3: Verificar se Funcionou

Após executar a migração, vamos verificar se tudo está OK:

### Opção A: Verificar no Supabase

1. No **SQL Editor**, execute novamente o script `CHECK_TABLE_STATUS.sql`
2. Você deve ver: **"✅ PERFEITO! Todas as colunas necessárias existem"**

### Opção B: Testar na aplicação

1. Abra a aplicação PraPassar
2. Faça login
3. Vá para o **Dashboard**
4. Clique em **"Nova Atividade"**
5. Tente criar uma atividade de **Estudo** (com matéria)
6. Tente criar uma atividade de **Evento** (sem matéria)

**Se funcionou:**
- ✅ A atividade aparece no calendário
- ✅ Não há erro no console do navegador
- ✅ A atividade fica salva (mesmo se você recarregar a página)

**Se ainda não funciona:**
- ❌ Abra o Console do navegador (F12)
- 📝 Copie as mensagens de erro
- 📧 Me avise com os erros para eu corrigir

---

## 🐛 LOGS DE DEBUG

Após executar a migração, quando você tentar criar uma atividade, verá logs assim no console:

```
🔍 Carregando matérias do usuário: [uuid]
✅ 5 matérias carregadas com sucesso
💾 Tentando salvar atividade: {type: 'study', title: '...'}
✅ Payload preparado: {...}
➕ Criando nova atividade
➕ Criando atividade: {type: 'study', title: '...', has_subject: true}
✅ Atividade criada no banco: {id: '...', ...}
✨ Atividade adicionada à lista local
```

Se aparecer ❌ em algum log, copie a mensagem e me avise!

---

## 📊 ESTRUTURA FINAL DA TABELA

Após a migração, a tabela `study_schedules` terá:

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| id | UUID | ✅ Sim | ID único da atividade |
| user_id | UUID | ✅ Sim | ID do usuário (vem do auth) |
| subject_id | UUID | ❌ Não | ID da matéria (NULL para eventos) |
| title | VARCHAR(255) | ✅ Sim | Título da atividade |
| description | TEXT | ❌ Não | Descrição detalhada |
| scheduled_date | DATE | ✅ Sim | Data agendada (ex: 2025-10-22) |
| start_time | TIME | ✅ Sim | Horário (ex: 14:30) |
| duration | INTEGER | ✅ Sim | Duração em minutos (ex: 60) |
| is_completed | BOOLEAN | ✅ Sim | Se foi concluída (default: false) |
| color | VARCHAR(7) | ❌ Não | Cor hex (ex: #8B5CF6) |
| created_at | TIMESTAMP | ✅ Sim | Data de criação (automático) |
| updated_at | TIMESTAMP | ✅ Sim | Data de atualização (automático) |

---

## 🔒 POLÍTICAS DE SEGURANÇA (RLS)

As seguintes políticas serão criadas automaticamente:

✅ **SELECT** - Usuários podem ver suas próprias atividades
✅ **INSERT** - Usuários podem criar suas próprias atividades
✅ **UPDATE** - Usuários podem atualizar suas próprias atividades
✅ **DELETE** - Usuários podem deletar suas próprias atividades

Isso garante que cada usuário só vê e modifica suas próprias atividades!

---

## ❓ PERGUNTAS FREQUENTES

### 1. E se a tabela já existir?

O script é seguro! Ele só adiciona as colunas que estão faltando. Se a tabela já estiver correta, ele não faz nada.

### 2. Vou perder dados existentes?

NÃO! O script usa `IF NOT EXISTS` e `ADD COLUMN`, então não apaga nada. Dados existentes ficam intactos.

### 3. Posso executar o script várias vezes?

SIM! O script é idempotente (pode rodar múltiplas vezes sem problemas).

### 4. E se der erro ao executar?

Copie a mensagem de erro completa e me avise. Provavelmente é um problema de permissões ou alguma configuração específica do seu banco.

### 5. Como voltar atrás se der problema?

Se precisar, pode deletar a tabela inteira com:
```sql
DROP TABLE IF EXISTS study_schedules CASCADE;
```
Mas **cuidado**: isso apaga todos os dados!

---

## 📧 PRECISA DE AJUDA?

Se tiver qualquer dúvida ou problema:

1. Copie os logs do console do navegador (F12)
2. Copie as mensagens que apareceram no SQL Editor
3. Tire screenshots se ajudar
4. Me avise e vou te ajudar!

---

## ✅ CHECKLIST FINAL

Antes de testar a aplicação, confirme:

- [ ] Executei o script de verificação (`CHECK_TABLE_STATUS.sql`)
- [ ] Executei a migração (`2025-10-22_fix_study_schedules_for_calendar.sql`)
- [ ] Vi a mensagem "✅ SUCESSO! Tabela configurada corretamente"
- [ ] Executei novamente a verificação e vi "✅ PERFEITO!"
- [ ] Recarreguei a aplicação (Ctrl+F5)
- [ ] Abri o console do navegador (F12) para ver os logs

---

**Boa sorte! 🚀**

Após executar a migração, o calendário deve funcionar perfeitamente!

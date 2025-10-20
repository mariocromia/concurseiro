# 🔍 Diagnóstico Final: Relatórios Não Exibindo Dados

## 📝 Resumo do Problema

**Sintoma**: Tempo de estudo está sendo registrado na tabela `study_sessions`, mas não aparece na página de relatórios.

**Erros no Console**:
```
GET http://localhost:3001/rest/v1/study_sessions?user_id=eq.undefined 400 (Bad Request)
ERROR: invalid input syntax for type uuid: "undefined"
```

---

## ✅ Correções Aplicadas

### 1. Fix no Composable `useReports.ts`

**Problema**: O composable estava tentando executar queries antes do usuário estar disponível, causando `user.value.id === undefined`.

**Solução Aplicada**:
```typescript
const loadReportData = async (period: string = '30days'): Promise<ReportData | null> => {
  // ✅ ADICIONADO: Verificar se usuário existe
  if (!user.value?.id) {
    console.error('[useReports] Usuário não autenticado')
    return null
  }

  // ✅ ADICIONADO: Armazenar userId em constante
  const userId = user.value.id
  console.log('[useReports] Carregando dados para user:', userId)

  // ✅ MODIFICADO: Usar userId ao invés de user.value.id
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*, subjects(name, color)')
    .eq('user_id', userId)  // ← Antes era user.value.id
    // ...
}
```

### 2. Fix na Página `reports.vue`

**Problema**: A página carregava dados no `onMounted`, mas o usuário ainda não estava disponível naquele momento.

**Solução Aplicada**:
```typescript
// ❌ CÓDIGO ANTIGO (onMounted - executa imediatamente):
// onMounted(async () => {
//   await refreshData()
// })

// ✅ CÓDIGO NOVO (watchEffect - aguarda usuário):
const user = useSupabaseUser()

watchEffect(() => {
  if (user.value?.id && !reportData.value) {
    console.log('✅ [Reports] Usuário disponível, carregando dados...')
    refreshData()
  }
})
```

### 3. Página de Teste Criada

Criei uma página simplificada para isolar o problema: `/test-reports-simple`

**Objetivo**: Verificar se o problema é:
- ❓ Carregamento de dados (se a página de teste também falhar)
- ❓ Renderização dos gráficos (se a página de teste funcionar mas `/reports` não)

---

## 🧪 Como Testar

### Passo 1: Acessar a Página de Teste

1. Certifique-se de que o servidor está rodando:
   ```bash
   cd prapassar-app
   npm run dev
   ```

2. Acesse no navegador: **http://localhost:3001/test-reports-simple**

3. Abra o **Console do Navegador** (F12 → Console)

### Passo 2: Interpretar os Resultados

#### ✅ **CENÁRIO A: Página de teste mostra dados**

**O que você verá**:
```
✅ Usuário pronto, carregando...
🔍 Buscando sessões para user: [seu-user-id]
✅ Sessões encontradas: 5
📊 Dados: [array com sessões]
⏱️ Total: 1800s = 30 minutos
```

**Na tela**: Lista de sessões com datas, tempos e matérias.

**Conclusão**: ✅ Dados estão carregando corretamente!

**Próximo passo**: O problema está na página `/reports`. Possíveis causas:
- Chart.js não está renderizando
- Dados não estão sendo transformados corretamente
- Problema de CSS/visibilidade

**Ação**:
1. Acesse http://localhost:3001/reports
2. Abra o console e procure por logs `[useReports]`
3. Cole aqui os logs para eu analisar

---

#### ❌ **CENÁRIO B: Página de teste NÃO mostra dados (erro ou vazio)**

**O que você verá**:
```
❌ Erro: [mensagem de erro]
```

OU

```
⚠️ Nenhuma sessão encontrada
```

**Conclusão**: ❌ Problema no carregamento de dados.

**Possíveis causas**:
1. **RLS (Row Level Security) bloqueando acesso**
   - As políticas do Supabase podem estar impedindo leitura

2. **Usuário não está autenticado corretamente**
   - Token expirado ou sessão inválida

3. **Não há dados no banco para este usuário**
   - As sessões foram criadas com outro `user_id`

**Próximos passos de debug**: Continue para a seção **Verificação do Banco de Dados** abaixo.

---

## 🗄️ Verificação do Banco de Dados

Se a página de teste falhar, execute estas queries no **Supabase SQL Editor**:

### Query 1: Verificar se sessões existem

```sql
-- Ver todas as sessões (últimas 10)
SELECT
  id,
  user_id,
  subject_id,
  started_at,
  duration,
  created_at
FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado**: Deve mostrar as sessões criadas pelo timer.

**Se retornar vazio**: O timer não está salvando. Verifique se:
- Você clicou em "Encerrar" no timer (não apenas fechou a página)
- Não houve erro no console ao encerrar

---

### Query 2: Descobrir seu user_id

```sql
-- Ver usuários cadastrados
SELECT
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Anote o UUID do seu usuário** (coluna `id`).

---

### Query 3: Verificar se sessões pertencem a você

```sql
-- Substitua 'SEU_USER_ID_AQUI' pelo UUID da Query 2
SELECT
  COUNT(*) as total_sessoes,
  SUM(duration) as total_segundos,
  SUM(duration) / 60.0 as total_minutos
FROM public.study_sessions
WHERE user_id = 'SEU_USER_ID_AQUI';
```

**Resultado esperado**:
- `total_sessoes`: Número de vezes que você usou o timer
- `total_minutos`: Tempo total em minutos

**Se retornar 0**: As sessões no banco pertencem a outro usuário. Possíveis causas:
- Você fez logout e login com outro email
- Houve múltiplas contas criadas

---

### Query 4: Verificar políticas RLS

```sql
-- Ver políticas da tabela study_sessions
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'study_sessions';
```

**Resultado esperado**: Deve mostrar políticas como:
- "Usuários veem suas sessões" (SELECT)
- "Usuários criam suas sessões" (INSERT)

**Se não houver políticas**: RLS está desabilitado ou mal configurado.

**Solução temporária** (APENAS PARA DEBUG):
```sql
-- TEMPORÁRIO: Desabilitar RLS
ALTER TABLE public.study_sessions DISABLE ROW LEVEL SECURITY;
```

⚠️ **ATENÇÃO**: Isso é INSEGURO e deve ser revertido após o teste!

Reverter com:
```sql
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
```

---

## 📋 Checklist de Diagnóstico

Execute e marque cada item:

- [ ] **Teste 1**: Acessei `/test-reports-simple` e vi dados?
- [ ] **Teste 2**: Console mostra logs `[useReports]` ou erros?
- [ ] **Query 1**: Sessões existem na tabela `study_sessions`?
- [ ] **Query 2**: Identifiquei meu `user_id`?
- [ ] **Query 3**: Sessões pertencem ao meu `user_id`?
- [ ] **Query 4**: Políticas RLS estão corretas?
- [ ] **Teste 3**: Tentei criar nova sessão e verificar se salvou?

---

## 🔧 Soluções Baseadas nos Resultados

### Se página de teste FUNCIONOU:

**Problema**: Renderização da página `/reports`

**Próximos passos**:
1. Acesse `/reports` e abra o console
2. Procure por erros de Chart.js
3. Verifique se `reportData.value` tem dados (log no console)
4. Cole os logs aqui para análise

**Possível correção**:
- Problema com Chart.js: Reinstalar dependências
- Dados não transformados: Revisar lógica de processamento
- CSS escondendo elementos: Inspecionar com DevTools

---

### Se página de teste NÃO FUNCIONOU:

**Problema**: Carregamento de dados

**Soluções**:

#### Solução 1: RLS bloqueando (mais comum)

Execute no Supabase SQL Editor:
```sql
-- Criar política de SELECT se não existir
CREATE POLICY "Usuários veem suas próprias sessões"
  ON public.study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);
```

#### Solução 2: Sessões com user_id errado

Se as sessões existem mas com `user_id` diferente:
```sql
-- VER QUAL user_id está nas sessões
SELECT DISTINCT user_id FROM public.study_sessions;

-- Atualizar para o user_id correto (CUIDADO!)
-- Substitua os UUIDs apropriadamente
UPDATE public.study_sessions
SET user_id = 'SEU_USER_ID_CORRETO'
WHERE user_id = 'USER_ID_ERRADO';
```

#### Solução 3: Criar sessão de teste manualmente

```sql
-- Criar sessão de teste (Substitua SEU_USER_ID)
INSERT INTO public.study_sessions (
  user_id,
  subject_id,
  started_at,
  ended_at,
  duration,
  notes
) VALUES (
  'SEU_USER_ID'::uuid,
  NULL,  -- Sem matéria
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '10 minutes',
  1200,  -- 20 minutos em segundos
  'Teste manual de debug'
);

-- Verificar se foi criado
SELECT * FROM public.study_sessions
WHERE notes = 'Teste manual de debug';
```

Depois, acesse `/test-reports-simple` novamente. Se agora aparecer, o problema era falta de dados.

---

## 📊 Arquivos Modificados Nesta Sessão

1. **`prapassar-app/app/composables/useReports.ts`**
   - Adicionado verificação de usuário
   - Armazenado `userId` em constante
   - Adicionado logs de debug

2. **`prapassar-app/app/pages/reports.vue`**
   - Mudado de `onMounted` para `watchEffect`
   - Aguarda usuário antes de carregar

3. **`prapassar-app/app/pages/debug-reports.vue`**
   - Adicionado lógica de espera de usuário

4. **`prapassar-app/app/pages/test-reports-simple.vue`** (NOVO)
   - Página de teste simplificada
   - Mostra dados brutos da tabela
   - Logs detalhados no console

---

## 📞 Cole Aqui os Resultados

### Resultado do Teste da Página `/test-reports-simple`:

```
[Cole aqui o que apareceu na tela e no console]
```

### Resultado das Queries SQL:

**Query 1 (sessões existem?):**
```
[Cole resultado aqui]
```

**Query 2 (meu user_id):**
```
[Cole resultado aqui]
```

**Query 3 (sessões do meu user):**
```
[Cole resultado aqui]
```

### Console da página `/reports`:

```
[Cole aqui os logs quando acessar /reports]
```

---

## 🎯 Próxima Ação Recomendada

1. ✅ **PRIMEIRO**: Acesse http://localhost:3001/test-reports-simple
2. ✅ **Abra o console** (F12 → Console)
3. ✅ **Observe** se aparecem dados ou erros
4. ✅ **Cole aqui os resultados** (texto da tela + logs do console)

Com essas informações, poderei identificar exatamente onde está o problema e fornecer a solução específica!

---

**Status**: Aguardando resultados do teste 🔄

**Desenvolvido com Claude Code** | Data: 2025-10-19

# 🧪 TESTE NO CONSOLE DO NAVEGADOR

## 🎯 Objetivo
Verificar se os dados estão sendo carregados do banco de dados.

---

## 📋 PASSO A PASSO

### 1. Abrir a aplicação
```
http://localhost:3000/notebook
```

### 2. Abrir DevTools (F12)
- Pressione **F12**
- Vá na aba **Console**

### 3. Executar testes de carregamento

#### Teste 1: Verificar autenticação
```javascript
const supabase = useSupabaseClient()
const { data } = await supabase.auth.getUser()
console.log('🔑 User ID:', data?.user?.id)
console.log('📧 Email:', data?.user?.email)
```

**✅ Resultado esperado:** UUID e email aparecem
**❌ Se NULL:** Você não está logado - faça login primeiro

---

#### Teste 2: Carregar SUBJECTS (cadernos)
```javascript
const supabase = useSupabaseClient()
const { data: user } = await supabase.auth.getUser()
const userId = user?.user?.id

console.log('🔍 Buscando subjects para user:', userId)

const { data, error } = await supabase
  .from('subjects')
  .select('*')
  .eq('user_id', userId)

console.log('📚 Subjects encontrados:', data?.length)
console.log('📋 Dados:', data)
console.log('❌ Erro:', error)
```

**✅ Resultado esperado:** Array com subjects
**❌ Se error:** RLS está bloqueando - execute `FIX_RLS_COMPLETO.sql`
**❌ Se data vazio:** Não há subjects no banco para este user

---

#### Teste 3: Carregar CHAPTERS (capítulos)
```javascript
const supabase = useSupabaseClient()
const { data: user } = await supabase.auth.getUser()
const userId = user?.user?.id

// Primeiro pegar subject_ids
const { data: subjects } = await supabase
  .from('subjects')
  .select('id')
  .eq('user_id', userId)

const subjectIds = subjects?.map(s => s.id) || []
console.log('📚 Subject IDs:', subjectIds)

// Depois buscar chapters
const { data, error } = await supabase
  .from('chapters')
  .select('*')
  .in('subject_id', subjectIds)

console.log('📖 Chapters encontrados:', data?.length)
console.log('📋 Dados:', data)
console.log('❌ Erro:', error)
```

**✅ Resultado esperado:** Array com chapters
**❌ Se error:** RLS bloqueando
**❌ Se data vazio:** Não há chapters para estes subjects

---

#### Teste 4: Carregar PAGES (páginas)
```javascript
const supabase = useSupabaseClient()
const { data: user } = await supabase.auth.getUser()
const userId = user?.user?.id

// Pegar chapters do usuário
const { data: subjects } = await supabase
  .from('subjects')
  .select('id')
  .eq('user_id', userId)

const subjectIds = subjects?.map(s => s.id) || []

const { data: chapters } = await supabase
  .from('chapters')
  .select('id')
  .in('subject_id', subjectIds)

const chapterIds = chapters?.map(c => c.id) || []
console.log('📖 Chapter IDs:', chapterIds)

// Buscar pages
const { data, error } = await supabase
  .from('pages')
  .select('*')
  .in('chapter_id', chapterIds)

console.log('📄 Pages encontradas:', data?.length)
console.log('📋 Dados:', data)
console.log('❌ Erro:', error)
```

**✅ Resultado esperado:** Array com pages
**❌ Se error:** RLS bloqueando
**❌ Se data vazio:** Não há pages para estes chapters

---

#### Teste 5: Query completa (JOIN)
```javascript
const supabase = useSupabaseClient()
const { data: user } = await supabase.auth.getUser()
const userId = user?.user?.id

const { data, error } = await supabase
  .from('subjects')
  .select(`
    id,
    name,
    chapters:chapters (
      id,
      title,
      pages:pages (
        id,
        title,
        content
      )
    )
  `)
  .eq('user_id', userId)

console.log('🌳 Estrutura completa:', data)
console.log('❌ Erro:', error)
```

**✅ Resultado esperado:** Hierarquia completa de subjects → chapters → pages
**❌ Se error:** Problema de RLS ou relacionamento

---

## 🔧 DIAGNÓSTICO RÁPIDO

### Cenário 1: Erro "permission denied" ou "row level security"
**Causa:** RLS está bloqueando acesso

**Solução:**
1. Execute `FIX_RLS_COMPLETO.sql` no Supabase SQL Editor
2. Reinicie servidor: `npm run dev`
3. Recarregue página (F5)
4. Tente novamente

### Cenário 2: data = [] (array vazio)
**Causa:** Não há dados no banco OU os dados pertencem a outro user_id

**Solução A - Verificar se há dados:**
```javascript
// No console
const supabase = useSupabaseClient()

// Contar todos os registros (ignora RLS)
const { count: subjectsCount } = await supabase
  .from('subjects')
  .select('*', { count: 'exact', head: true })

console.log('📊 Total subjects no banco:', subjectsCount)
```

**Solução B - Ver user_id dos dados existentes:**
Execute no Supabase SQL Editor:
```sql
SELECT DISTINCT user_id FROM public.subjects;
SELECT DISTINCT user_id FROM public.chapters;
SELECT DISTINCT user_id FROM public.pages;
```

Se o UUID retornado **NÃO CORRESPONDE** ao seu user_id atual, os dados foram criados por outro usuário.

### Cenário 3: error = null, data = null
**Causa:** Query retornou sem erro mas sem dados

**Solução:** Mesma do Cenário 2

### Cenário 4: Tudo funciona no console mas não na interface
**Causa:** Problema no componente Vue (não no banco)

**Solução:**
1. Verificar se `loadSubjects()` e `loadChapters()` estão sendo chamados
2. Adicionar logs:
```javascript
// No arquivo notebook.vue, adicione console.log
onMounted(async () => {
  console.log('🚀 Notebook montado, carregando dados...')
  await loadSubjects()
  console.log('📚 Subjects após load:', subjects.value)
  await loadChapters()
  console.log('📖 Chapters após load:', chapters.value)
})
```

---

## 📊 CHECKLIST DE VALIDAÇÃO

Execute os testes na ordem e marque:

- [ ] Teste 1: auth.uid() retorna UUID válido
- [ ] Teste 2: subjects.length > 0 (sem erro)
- [ ] Teste 3: chapters.length > 0 (sem erro)
- [ ] Teste 4: pages.length > 0 (sem erro)
- [ ] Teste 5: Join retorna estrutura completa
- [ ] Dados aparecem na interface após F5

**Se TODOS passaram mas interface vazia:**
→ Problema está no código Vue (não no banco)

**Se NENHUM passou:**
→ Execute `FIX_RLS_COMPLETO.sql` e tente novamente

---

## 🆘 SE NADA FUNCIONAR

Execute este comando no console e me envie o resultado completo:

```javascript
const supabase = useSupabaseClient()
const { data: user } = await supabase.auth.getUser()

const result = {
  user_id: user?.user?.id,
  user_email: user?.user?.email,
  subjects: await supabase.from('subjects').select('*').eq('user_id', user?.user?.id),
  chapters: await supabase.from('chapters').select('*'),
  pages: await supabase.from('pages').select('*')
}

console.log('🔍 DIAGNÓSTICO COMPLETO:', JSON.stringify(result, null, 2))
result
```

Copie a saída e me envie para análise detalhada.

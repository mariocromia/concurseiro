# 🐛 DEBUG - Seções Não Carregam no Modal de IA

## Problema Reportado
Ao escolher "Gerar Mapa Mental com IA", as seções do caderno não aparecem no dropdown.

---

## 🔍 Diagnóstico Rápido

### Passo 1: Abra o Console do Navegador
1. Acesse a página `/mapa-mental`
2. Pressione **F12** para abrir DevTools
3. Vá na aba **Console**
4. Clique em "Criar com IA"
5. Selecione uma matéria
6. Observe as mensagens no console

### Passo 2: Verifique se Há Dados no Banco

Abra o Supabase e execute estas queries:

```sql
-- 1. Verificar se há matérias
SELECT id, name FROM subjects WHERE user_id = 'SEU_USER_ID';

-- 2. Verificar se há cadernos
SELECT id, name, subject_id FROM notebooks WHERE user_id = 'SEU_USER_ID';

-- 3. Verificar se há seções
SELECT ns.id, ns.name, ns.notebook_id, n.name as notebook_name
FROM notebook_sections ns
JOIN notebooks n ON ns.notebook_id = n.id
WHERE n.user_id = 'SEU_USER_ID';

-- 4. Verificar se há páginas nas seções
SELECT np.id, np.title, ns.name as section_name
FROM notebook_pages np
JOIN notebook_sections ns ON np.section_id = ns.id
JOIN notebooks n ON ns.notebook_id = n.id
WHERE n.user_id = 'SEU_USER_ID';
```

---

## ✅ Soluções Possíveis

### Solução 1: Não Há Cadernos/Seções Criados

**Problema:** Você precisa criar cadernos e seções primeiro.

**Como resolver:**
1. Acesse `/notebook`
2. Crie um caderno vinculado a uma matéria
3. Crie seções dentro do caderno
4. Adicione páginas com conteúdo nas seções
5. Volte para `/mapa-mental` e tente novamente

---

### Solução 2: Adicionar Logs de Debug

**Substitua a função `loadNotebooks()` no arquivo:**
`prapassar-app/app/pages/mapa-mental.vue` (linha ~340)

**Por esta versão com logs:**

```javascript
// Carregar cadernos/seções
const loadNotebooks = async () => {
  if (!selectedSubjectId.value) return

  sections.value = []
  selectedSectionId.value = ''

  try {
    console.log('🔍 Buscando cadernos para matéria:', selectedSubjectId.value)

    // Buscar cadernos da matéria
    const { data: notebooks, error: notebooksError } = await supabase
      .from('notebooks')
      .select('id, name')
      .eq('subject_id', selectedSubjectId.value)

    console.log('📚 Cadernos encontrados:', notebooks)

    if (notebooksError) {
      console.error('❌ Erro ao buscar cadernos:', notebooksError)
      alert('Erro ao buscar cadernos: ' + notebooksError.message)
      return
    }

    if (!notebooks || notebooks.length === 0) {
      console.warn('⚠️ Nenhum caderno encontrado para esta matéria')
      alert('Nenhum caderno encontrado para esta matéria.\n\nCrie um caderno primeiro em: /notebook')
      return
    }

    const notebookIds = notebooks.map(n => n.id)
    console.log('📦 IDs dos cadernos:', notebookIds)

    // Buscar seções dos cadernos
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('notebook_sections')
      .select('id, name, notebook_id, order_index')
      .in('notebook_id', notebookIds)
      .order('order_index')

    console.log('📑 Seções encontradas:', sectionsData)

    if (sectionsError) {
      console.error('❌ Erro ao buscar seções:', sectionsError)
      alert('Erro ao buscar seções: ' + sectionsError.message)
      return
    }

    if (!sectionsData || sectionsData.length === 0) {
      console.warn('⚠️ Nenhuma seção encontrada nos cadernos')
      alert('Nenhuma seção encontrada.\n\nCrie seções no seu caderno em: /notebook')
      return
    }

    sections.value = sectionsData
    console.log('✅ Seções carregadas com sucesso:', sections.value.length, 'seções')
  } catch (error) {
    console.error('❌ Erro geral ao carregar seções:', error)
    alert('Erro inesperado: ' + error.message)
  }
}
```

**O código completo está em:** [FIX_SECOES_LOAD.js](FIX_SECOES_LOAD.js)

---

## 🔧 Teste Após Aplicar o Fix

1. **Recarregue a página** (Ctrl+R)
2. **Abra o Console** (F12)
3. **Clique em "Criar com IA"**
4. **Selecione uma matéria**
5. **Observe os logs:**

**Cenário 1: Sucesso** ✅
```
🔍 Buscando cadernos para matéria: abc-123-def
📚 Cadernos encontrados: [{id: '...', name: 'Direito Constitucional'}]
📦 IDs dos cadernos: ['abc-123-def']
📑 Seções encontradas: [{id: '...', name: 'Princípios Fundamentais'}, ...]
✅ Seções carregadas com sucesso: 5 seções
```
→ **As seções devem aparecer no dropdown!**

**Cenário 2: Sem Cadernos** ⚠️
```
🔍 Buscando cadernos para matéria: abc-123-def
📚 Cadernos encontrados: []
⚠️ Nenhum caderno encontrado para esta matéria
```
→ **Alerta aparece dizendo para criar caderno**

**Cenário 3: Sem Seções** ⚠️
```
🔍 Buscando cadernos para matéria: abc-123-def
📚 Cadernos encontrados: [{...}]
📦 IDs dos cadernos: ['abc-123-def']
📑 Seções encontradas: []
⚠️ Nenhuma seção encontrada nos cadernos
```
→ **Alerta aparece dizendo para criar seções**

**Cenário 4: Erro de RLS** ❌
```
❌ Erro ao buscar cadernos: {code: '42501', message: 'permission denied'}
```
→ **Problema de permissão no banco (RLS)**

---

## 🚀 Criar Dados de Teste

Se não tiver dados, crie manualmente no Supabase:

```sql
-- Inserir caderno de teste (substitua os IDs)
INSERT INTO notebooks (user_id, subject_id, name, description)
VALUES (
  'SEU_USER_ID',
  'ID_DA_MATERIA',
  'Caderno de Direito Constitucional',
  'Caderno para estudos de constitucional'
)
RETURNING id;

-- Copie o ID retornado acima e use aqui:
INSERT INTO notebook_sections (notebook_id, name, order_index)
VALUES
  ('ID_DO_CADERNO', 'Princípios Fundamentais', 0),
  ('ID_DO_CADERNO', 'Direitos e Garantias', 1),
  ('ID_DO_CADERNO', 'Organização do Estado', 2);

-- Adicionar páginas com conteúdo (opcional, mas recomendado)
INSERT INTO notebook_pages (section_id, title, content, order_index)
SELECT id, 'Conteúdo de ' || name, 'Este é o conteúdo de exemplo sobre ' || name, 0
FROM notebook_sections
WHERE notebook_id = 'ID_DO_CADERNO';
```

---

## 📊 Checklist de Verificação

Antes de gerar o mapa mental com IA, certifique-se:

- [ ] Há pelo menos 1 matéria criada (`subjects`)
- [ ] Há pelo menos 1 caderno vinculado à matéria (`notebooks`)
- [ ] Há pelo menos 1 seção dentro do caderno (`notebook_sections`)
- [ ] Há pelo menos 1 página com conteúdo na seção (`notebook_pages`)
- [ ] O user_id está correto em todos os registros
- [ ] As políticas RLS estão corretas e permitem leitura

---

## 🆘 Ainda Não Funciona?

Se após aplicar o fix com logs você ainda não vê as seções:

1. **Copie as mensagens do console**
2. **Tire um screenshot do erro (se houver)**
3. **Verifique se tem dados no banco (queries acima)**
4. **Verifique se o RLS está permitindo acesso**

---

## 📝 Arquivos Relacionados

- **Correção:** [FIX_SECOES_LOAD.js](FIX_SECOES_LOAD.js)
- **Arquivo a editar:** `prapassar-app/app/pages/mapa-mental.vue`
- **Linha aproximada:** 340-372

---

**Após aplicar o fix, você terá logs detalhados para descobrir exatamente onde está o problema!**

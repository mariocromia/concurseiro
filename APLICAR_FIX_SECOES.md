# 🔧 CORREÇÃO RÁPIDA - Seções Não Carregam

## O Problema
Ao selecionar uma matéria no modal "Criar com IA", as seções do caderno não aparecem.

## A Solução (2 minutos)

### Opção 1: Substituição Manual (Recomendado)

1. **Abra o arquivo:**
   ```
   prapassar-app/app/pages/mapa-mental.vue
   ```

2. **Localize a função** (aproximadamente linha 341):
   ```javascript
   const loadNotebooks = async () => {
   ```

3. **Substitua toda a função** (linhas 341-372) **por este código:**

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

4. **Salve o arquivo** (Ctrl+S)

5. **Recarregue a página no navegador** (Ctrl+R ou F5)

---

## Testar Agora

1. **Abra o console do navegador** (F12)
2. **Acesse** `/mapa-mental`
3. **Clique em** "Criar com IA"
4. **Selecione uma matéria**
5. **Observe os logs no console:**

### Se Funcionar ✅
Você verá:
```
🔍 Buscando cadernos para matéria: abc-123
📚 Cadernos encontrados: [...]
📦 IDs dos cadernos: [...]
📑 Seções encontradas: [...]
✅ Seções carregadas com sucesso: X seções
```

E o dropdown de seções será populado!

### Se Não Tiver Dados ⚠️
Você verá um alerta dizendo:
- "Nenhum caderno encontrado..." OU
- "Nenhuma seção encontrada..."

**Neste caso:** Você precisa criar cadernos e seções primeiro em `/notebook`

### Se Houver Erro ❌
Você verá a mensagem de erro específica no console.

**Consulte:** [DEBUG_SECOES.md](DEBUG_SECOES.md) para diagnóstico completo

---

## 📋 Pré-requisitos para Gerar Mapa com IA

Para que a funcionalidade funcione, você precisa ter:

1. ✅ **Matéria criada** (tabela `subjects`)
2. ✅ **Caderno vinculado à matéria** (tabela `notebooks`)
3. ✅ **Seções dentro do caderno** (tabela `notebook_sections`)
4. ✅ **Páginas com conteúdo nas seções** (tabela `notebook_pages`)

### Como Verificar

Execute no Supabase SQL Editor:

```sql
-- Substitua 'SEU_USER_ID' pelo seu ID de usuário
SELECT
  s.name as materia,
  n.name as caderno,
  ns.name as secao,
  COUNT(np.id) as num_paginas
FROM subjects s
LEFT JOIN notebooks n ON n.subject_id = s.id
LEFT JOIN notebook_sections ns ON ns.notebook_id = n.id
LEFT JOIN notebook_pages np ON np.section_id = ns.id
WHERE s.user_id = 'SEU_USER_ID'
GROUP BY s.name, n.name, ns.name
ORDER BY s.name, n.name, ns.name;
```

---

## 🚀 Criar Dados de Teste Rapidamente

Se não tiver dados, use este script:

```sql
-- 1. Criar matéria de teste
INSERT INTO subjects (user_id, name, color, icon)
VALUES ('SEU_USER_ID', 'Direito Constitucional', '#8B5CF6', 'book')
RETURNING id;

-- 2. Criar caderno (use o ID da matéria acima)
INSERT INTO notebooks (user_id, subject_id, name, description)
VALUES ('SEU_USER_ID', 'ID_DA_MATERIA', 'Caderno de Constitucional', 'Estudos de direito constitucional')
RETURNING id;

-- 3. Criar seções (use o ID do caderno acima)
INSERT INTO notebook_sections (notebook_id, name, order_index)
VALUES
  ('ID_DO_CADERNO', 'Princípios Fundamentais', 0),
  ('ID_DO_CADERNO', 'Direitos e Garantias', 1),
  ('ID_DO_CADERNO', 'Organização do Estado', 2)
RETURNING id;

-- 4. Criar páginas com conteúdo (use IDs das seções acima)
INSERT INTO notebook_pages (section_id, title, content, order_index)
VALUES
  ('ID_DA_SECAO_1', 'República Federativa', 'A República Federativa do Brasil é formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal...', 0),
  ('ID_DA_SECAO_2', 'Direitos Fundamentais', 'São direitos e garantias fundamentais: vida, liberdade, igualdade, segurança e propriedade...', 0),
  ('ID_DA_SECAO_3', 'Poder Executivo', 'O Poder Executivo é exercido pelo Presidente da República...', 0);
```

---

## ✅ Após Aplicar a Correção

**O que mudou:**
- ✅ Logs detalhados no console
- ✅ Alertas informativos quando não há dados
- ✅ Mensagens de erro claras
- ✅ Melhor experiência de debug

**Agora você poderá:**
- Ver exatamente o que está acontecendo
- Saber se faltam dados ou se há erro
- Corrigir o problema rapidamente

---

**Aplique a correção e teste! Se ainda houver problemas, os logs vão te mostrar exatamente o que está faltando.** 🚀

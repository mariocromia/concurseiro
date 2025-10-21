# 🔧 SOLUÇÃO DEFINITIVA - Seções Não Aparecem

## 🎯 O Problema (Pelo Screenshot)

Você selecionou **"História"** como matéria, mas o dropdown **"Seção do Caderno"** fica vazio e não abre.

Além disso, vejo erros no console:
- ❌ `Failed to load resource: 500 (Server Error)` em `/api/mindmaps`
- ❌ `FetchError: [GET] "/api/mindmaps": 500 Server Error`

## 📋 Possíveis Causas

1. **Falta de dados:** Não há cadernos ou seções criados para "História"
2. **Problema de RLS:** Permissões do banco bloqueando acesso
3. **Erro na API:** Bug no endpoint `/api/mindmaps`
4. **Código não atualizado:** Função `loadNotebooks()` sem logs de debug

---

## ✅ SOLUÇÃO EM 3 PASSOS

### 📍 PASSO 1: Verificar se Você Tem Dados (5 minutos)

1. **Abra o Supabase Dashboard**
2. **Vá em SQL Editor**
3. **Execute esta query:**

```sql
-- Substitua 'SEU_EMAIL' pelo seu email de login
SELECT
  s.name as materia,
  n.name as caderno,
  ns.name as secao_capitulo,
  COUNT(np.id) as num_paginas
FROM subjects s
LEFT JOIN notebooks n ON n.subject_id = s.id AND n.user_id = s.user_id
LEFT JOIN notebook_sections ns ON ns.notebook_id = n.id
LEFT JOIN notebook_pages np ON np.section_id = ns.id
WHERE s.user_id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL')
  AND s.name = 'História'
GROUP BY s.name, n.name, ns.name
ORDER BY n.name, ns.order_index;
```

**Resultado Esperado:**
```
materia   | caderno            | secao_capitulo      | num_paginas
----------|--------------------|--------------------|------------
História  | Caderno História   | Idade Média        | 3
História  | Caderno História   | Renascimento       | 2
História  | Caderno História   | Revolução Francesa | 5
```

**❌ Se retornar VAZIO:**
→ **Você NÃO tem dados!** Vá para o **PASSO 2A** (Criar Dados)

**✅ Se retornar dados:**
→ **Você TEM dados!** Vá para o **PASSO 2B** (Aplicar Fix)

---

### 📍 PASSO 2A: Criar Dados de Teste (SE NÃO TIVER DADOS)

**Opção 1: Via Interface (Recomendado)**

1. Acesse `/notebook`
2. Clique em "Novo Caderno"
3. Preencha:
   - **Nome:** Caderno de História
   - **Matéria:** História
   - **Descrição:** Estudos de história
4. Clique em "Criar"
5. Dentro do caderno, clique em "Nova Seção"
6. Crie seções:
   - Idade Média
   - Renascimento
   - Revolução Francesa
7. Entre em cada seção e crie páginas com conteúdo
8. Volte para `/mapa-mental` e tente novamente

**Opção 2: Via SQL (Mais Rápido)**

Execute no Supabase SQL Editor:

```sql
-- 1. Pegar seu user_id
DO $$
DECLARE
  v_user_id UUID;
  v_subject_id UUID;
  v_notebook_id UUID;
  v_section1_id UUID;
  v_section2_id UUID;
  v_section3_id UUID;
BEGIN
  -- Pegar user_id (SUBSTITUA 'SEU_EMAIL')
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'SEU_EMAIL';

  -- Pegar subject_id de "História"
  SELECT id INTO v_subject_id FROM subjects WHERE user_id = v_user_id AND name = 'História';

  -- Se não existe a matéria, criar
  IF v_subject_id IS NULL THEN
    INSERT INTO subjects (user_id, name, color, icon)
    VALUES (v_user_id, 'História', '#F59E0B', 'book')
    RETURNING id INTO v_subject_id;
  END IF;

  -- Criar caderno
  INSERT INTO notebooks (user_id, subject_id, name, description)
  VALUES (v_user_id, v_subject_id, 'Caderno de História', 'Estudos de história para concursos')
  RETURNING id INTO v_notebook_id;

  -- Criar seções
  INSERT INTO notebook_sections (notebook_id, name, order_index)
  VALUES (v_notebook_id, 'Idade Média', 0)
  RETURNING id INTO v_section1_id;

  INSERT INTO notebook_sections (notebook_id, name, order_index)
  VALUES (v_notebook_id, 'Renascimento', 1)
  RETURNING id INTO v_section2_id;

  INSERT INTO notebook_sections (notebook_id, name, order_index)
  VALUES (v_notebook_id, 'Revolução Francesa', 2)
  RETURNING id INTO v_section3_id;

  -- Criar páginas com conteúdo
  INSERT INTO notebook_pages (section_id, title, content, order_index)
  VALUES
    (v_section1_id, 'Características da Idade Média',
     'A Idade Média foi um período da história europeia que se estendeu do século V ao XV. Principais características: feudalismo, poder da Igreja Católica, economia agrária, sociedade estamental dividida em clero, nobreza e servos.', 0),

    (v_section2_id, 'O Renascimento Cultural',
     'O Renascimento foi um movimento cultural que teve início na Itália no século XIV. Características: valorização da razão e da ciência, humanismo, retorno aos valores clássicos greco-romanos, grandes artistas como Leonardo da Vinci e Michelangelo.', 0),

    (v_section3_id, 'Causas da Revolução Francesa',
     'A Revolução Francesa (1789-1799) teve diversas causas: crise econômica, desigualdade social, influência do Iluminismo, gastos excessivos da monarquia, fome e miséria popular. O lema era: Liberdade, Igualdade e Fraternidade.', 0);

  RAISE NOTICE 'Dados criados com sucesso!';
END $$;
```

---

### 📍 PASSO 2B: Aplicar Fix no Código (SE JÁ TEM DADOS)

1. **Abra o arquivo:**
   ```
   prapassar-app/app/pages/mapa-mental.vue
   ```

2. **Localize a linha 341:**
   ```javascript
   const loadNotebooks = async () => {
   ```

3. **Substitua toda a função** (até a linha 372) **pelo código em:**
   ```
   FIX_COMPLETO_SECOES.vue
   ```

4. **Salve o arquivo** (Ctrl+S)

5. **Recarregue o navegador** (Ctrl+R)

---

### 📍 PASSO 3: Testar com Logs Detalhados

1. **Abra o Console** (F12)
2. **Clique em "Criar com IA"**
3. **Selecione "História"**
4. **Observe os logs no console:**

**✅ Se funcionar, você verá:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INICIANDO BUSCA DE SEÇÕES/CAPÍTULOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Matéria selecionada: abc-123-def

📚 PASSO 1: Buscando cadernos...
✅ Query de cadernos executada com sucesso
📦 Cadernos encontrados: 1

📑 PASSO 2: Buscando seções/capítulos...
✅ Query de seções executada com sucesso
📄 Seções/Capítulos encontrados: 3

✅✅✅ SUCESSO! ✅✅✅
📌 Seções carregadas: 3
📋 Seções disponíveis para seleção:
   1. Idade Média (ID: xyz)
   2. Renascimento (ID: abc)
   3. Revolução Francesa (ID: def)
```

**E o dropdown de seções será populado!**

---

## 🐛 Diagnóstico de Problemas

### Problema: "Nenhum caderno encontrado"

**Console mostra:**
```
⚠️ NENHUM CADERNO ENCONTRADO para esta matéria
```

**Solução:**
- Você não tem cadernos criados para "História"
- Siga o **PASSO 2A** acima

---

### Problema: "Nenhuma seção encontrada"

**Console mostra:**
```
⚠️ NENHUMA SEÇÃO/CAPÍTULO ENCONTRADO nos cadernos
```

**Solução:**
- Você tem caderno, mas sem seções/capítulos
- Acesse `/notebook` e crie seções no caderno de História
- Ou use o script SQL do **PASSO 2A**

---

### Problema: "Erro ao buscar cadernos: permission denied"

**Console mostra:**
```
❌ ERRO ao buscar cadernos
   Código: 42501
   Mensagem: permission denied for table notebooks
```

**Solução: Problema de RLS (Row Level Security)**

Execute no Supabase SQL Editor:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('notebooks', 'notebook_sections', 'notebook_pages');

-- Ver políticas existentes
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('notebooks', 'notebook_sections', 'notebook_pages');

-- Se não houver políticas, criar:
-- (CUIDADO: só faça isso se souber o que está fazendo!)

-- Política para notebooks
CREATE POLICY "Users can view own notebooks"
  ON notebooks FOR SELECT
  USING (auth.uid() = user_id);

-- Política para notebook_sections
CREATE POLICY "Users can view sections of own notebooks"
  ON notebook_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notebooks
      WHERE notebooks.id = notebook_sections.notebook_id
        AND notebooks.user_id = auth.uid()
    )
  );

-- Política para notebook_pages
CREATE POLICY "Users can view pages of own notebooks"
  ON notebook_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notebook_sections
      JOIN notebooks ON notebooks.id = notebook_sections.notebook_id
      WHERE notebook_sections.id = notebook_pages.section_id
        AND notebooks.user_id = auth.uid()
    )
  );
```

---

## 📊 Checklist Final

Antes de gerar mapa mental com IA:

- [ ] Matéria "História" existe na tabela `subjects`
- [ ] Há pelo menos 1 caderno vinculado a "História" em `notebooks`
- [ ] Há pelo menos 1 seção/capítulo no caderno em `notebook_sections`
- [ ] Há pelo menos 1 página com conteúdo em `notebook_pages`
- [ ] Políticas RLS permitem acesso aos dados
- [ ] Código atualizado com a versão com logs
- [ ] Console do navegador aberto (F12)
- [ ] Logs aparecem ao selecionar matéria

---

## 📁 Arquivos Criados

1. **[SOLUCAO_DEFINITIVA_SECOES.md](SOLUCAO_DEFINITIVA_SECOES.md)** ⭐ **ESTE ARQUIVO**
2. **[FIX_COMPLETO_SECOES.vue](FIX_COMPLETO_SECOES.vue)** - Código corrigido
3. **[VERIFICAR_DADOS_BANCO.sql](VERIFICAR_DADOS_BANCO.sql)** - Queries de verificação
4. **[DEBUG_SECOES.md](DEBUG_SECOES.md)** - Debug detalhado
5. **[APLICAR_FIX_SECOES.md](APLICAR_FIX_SECOES.md)** - Guia anterior

---

## 🎯 Resumo: O Que Fazer AGORA

1. ✅ **Verificar dados:** Execute a query do **PASSO 1**
2. ✅ **Criar dados (se não tiver):** Siga o **PASSO 2A**
3. ✅ **Aplicar fix no código:** Siga o **PASSO 2B**
4. ✅ **Testar:** Siga o **PASSO 3** e observe os logs

---

**Com essas correções e logs detalhados, você vai descobrir exatamente o que está faltando!** 🚀

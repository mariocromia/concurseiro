# Correção de Comportamento - Caixa de Texto

## 🔧 Problema Corrigido

**Comportamento Errado Anterior:**
- ❌ Ao clicar fora da caixa de texto, ela permanecia com handles visíveis
- ❌ Não era possível desmarcar a caixa de texto
- ❌ Interferia com a edição normal do caderno
- ❌ Entrava automaticamente em modo de edição ao criar

**✅ Comportamento Correto Implementado:**
- ✅ Ao clicar fora, a caixa é **desmarcada** (handles desaparecem)
- ✅ Permite edição normal do caderno
- ✅ Clique simples na caixa = **seleciona** (mostra handles)
- ✅ Duplo clique = **edita**
- ✅ Cria caixa já selecionada (mas não editando)

---

## 🎯 Três Estados da Caixa de Texto

### 1️⃣ DESMARCADA (Padrão)

**Como chegar neste estado:**
- Clicar fora da caixa de texto (em qualquer lugar do caderno)
- Após salvar uma edição e clicar fora

**Características:**
- Borda: Laranja (#ca643f) sólida
- Handles de resize: **OCULTOS** ❌
- Drag handle: **OCULTO** ❌
- Delete button: **OCULTO** ❌
- Cursor: `text`
- Comportamento: Caixa está no caderno mas não selecionada

**Visual:**
```
┌─────────────────────┐
│                     │
│  Texto aqui         │
│                     │
└─────────────────────┘
(sem handles visíveis)
```

---

### 2️⃣ SELECIONADA (Clique Simples)

**Como chegar neste estado:**
- Clicar uma vez na caixa desmarcada
- Após criar uma nova caixa
- Após sair do modo de edição (ESC)

**Características:**
- Borda: Laranja (#ca643f) sólida
- Handles de resize: **VISÍVEIS** ✅ (8 círculos azuis)
- Drag handle: **VISÍVEL** ✅ (laranja, topo)
- Delete button: **VISÍVEL** ✅ (vermelho, canto)
- Cursor: `text`
- Comportamento: Pronta para arrastar, redimensionar ou deletar

**Visual:**
```
        ┌──── ⋮⋮ ────┐  ← Drag handle
        │             │
 ×      │             │  ← Delete button
┌───────┴─────────────┴───────┐
│  •                         •  │  ← Resize handles
│                               │
│  •    Texto aqui          •  │
│                               │
│  •                         •  │
└───────────────────────────────┘
```

**Ações disponíveis:**
- ✅ Arrastar (pelo handle ⋮⋮)
- ✅ Redimensionar (pelos 8 handles azuis)
- ✅ Deletar (pelo botão ×)
- ✅ Duplo clique para editar

---

### 3️⃣ EDITANDO (Duplo Clique)

**Como chegar neste estado:**
- Duplo clique em uma caixa selecionada
- Duplo clique em uma caixa desmarcada

**Características:**
- Borda: Azul (#2563eb) sólida
- Box-shadow: Azul intenso
- Handles de resize: **OCULTOS** ❌
- Drag handle: **OCULTO** ❌
- Delete button: **VISÍVEL** ✅ (pode deletar durante edição)
- Cursor: `text` (piscando)
- `contentEditable`: `true`
- `user-select`: `text` (pode selecionar texto)

**Visual:**
```
        ╔═══════════════╗
        ║               ║  ← Box-shadow azul
 ×      ║               ║
┌───────║───────────────║───────┐
│       ║               ║       │
│       ║  Texto|aqui   ║       │  ← Cursor piscando
│       ║               ║       │
│       ╚═══════════════╝       │
└───────────────────────────────┘
(sem handles de resize)
```

**Ações disponíveis:**
- ✅ Digitar/editar texto
- ✅ Enter para nova linha
- ✅ Selecionar texto
- ✅ Backspace/Delete para apagar
- ✅ ESC para sair do modo de edição
- ✅ Clicar fora para sair e desmarcar
- ✅ Deletar caixa (botão ×)

---

## 🔄 Fluxo de Interações

### Fluxo 1: Criar → Selecionar → Desmarcar

```
1. Clicar botão texto    2. Clicar no editor      3. Caixa criada
   ┌─────────┐              ┌─────────┐               ┌──── ⋮⋮ ────┐
   │  [T]    │   →          │    +    │   →        ×  │  • • •  │
   └─────────┘              └─────────┘               │  • • •  │
   (toolbar)                (posição)                 └─────────┘
                                                   (SELECIONADA)

4. Clicar fora           5. Caixa desmarcada
   ┌─────────┐               ┌─────────┐
   │         │   →           │ Texto   │
   └─────────┘               └─────────┘
   (fora)                    (SEM handles)
                           (pode editar caderno)
```

### Fluxo 2: Desmarcar → Selecionar → Editar

```
1. Caixa desmarcada      2. Clicar na caixa       3. Duplo clique
   ┌─────────┐               ┌──── ⋮⋮ ────┐          ╔═══════════╗
   │ Texto   │   →        ×  │  • • •  │   →      ×  ║  Texto|   ║
   └─────────┘               │  • • •  │             ╚═══════════╝
   (sem handles)             └─────────┘             (EDITANDO)
                           (SELECIONADA)             cursor piscando
```

### Fluxo 3: Editar → Salvar → Desmarcar

```
1. Editando              2. Clicar fora           3. Desmarcada
   ╔═══════════╗            ┌─────────┐               ┌─────────┐
×  ║  Texto|   ║   →        │         │   →           │ Texto   │
   ╚═══════════╝            └─────────┘               └─────────┘
   (editando)               (clicou fora)           (DESMARCADA)
                                                    pode editar caderno
```

---

## 🎨 Estados Visuais Detalhados

### Estado: DESMARCADA

**Borda:**
- Cor: `#ca643f` (laranja)
- Estilo: `solid`
- Largura: `2px`

**Elementos visíveis:**
- ✅ Conteúdo da caixa
- ❌ Handles de resize (todos ocultos)
- ❌ Drag handle
- ❌ Delete button

**Atributos:**
- `data-selected="false"`
- `data-editing="false"`
- `contentEditable="false"`

---

### Estado: SELECIONADA

**Borda:**
- Cor: `#ca643f` (laranja)
- Estilo: `solid`
- Largura: `2px`

**Elementos visíveis:**
- ✅ Conteúdo da caixa
- ✅ 8 handles de resize (círculos azuis)
- ✅ Drag handle (⋮⋮ laranja no topo)
- ✅ Delete button (× vermelho no canto)

**Atributos:**
- `data-selected="true"`
- `data-editing="false"`
- `contentEditable="false"`

---

### Estado: EDITANDO

**Borda:**
- Cor: `#2563eb` (azul)
- Estilo: `solid`
- Largura: `2px`
- Box-shadow: `0 0 0 3px rgba(37, 99, 235, 0.1)`

**Elementos visíveis:**
- ✅ Conteúdo da caixa (editável)
- ❌ Handles de resize (ocultos)
- ❌ Drag handle (oculto)
- ✅ Delete button (visível)

**Atributos:**
- `data-selected="true"`
- `data-editing="true"`
- `contentEditable="true"`

---

## ⌨️ Interações por Estado

### DESMARCADA

| Ação | Resultado |
|------|----------|
| Clique simples | → SELECIONADA |
| Duplo clique | → EDITANDO |
| Clicar fora | → Permanece DESMARCADA |
| Editar caderno | ✅ Funciona normalmente |

### SELECIONADA

| Ação | Resultado |
|------|----------|
| Clicar fora | → DESMARCADA |
| Duplo clique | → EDITANDO |
| Arrastar handle | Move a caixa |
| Arrastar resize handle | Redimensiona |
| Clicar botão × | Deleta a caixa |
| ESC | Nenhum efeito |

### EDITANDO

| Ação | Resultado |
|------|----------|
| Clicar fora | → DESMARCADA + salva |
| ESC | → SELECIONADA + salva |
| Digitar | Edita o texto |
| Enter | Nova linha |
| Backspace/Delete vazio | Deleta a caixa |
| Clicar botão × | Deleta a caixa |

---

## 🔍 Código Modificado

### Adição de Atributo `data-selected`

**Linha 1928:**
```typescript
textBox.setAttribute('data-selected', 'false')
```

### Handles Começam Ocultos

**Linhas 1958, 1983, 2019:**
```typescript
// Drag handle
display: none;  // Oculto por padrão

// Delete button
display: none;  // Oculto por padrão

// Resize handles
display: none;  // Ocultos por padrão
```

### Funções Helper: selectBox() e deselectBox()

**Linhas 2047-2061:**
```typescript
// Helper function to show handles (select box)
const selectBox = () => {
  textBox.setAttribute('data-selected', 'true')
  dragHandle.style.display = 'flex'
  deleteBtn.style.display = 'flex'
  resizeHandles.forEach(h => h.style.display = 'block')
}

// Helper function to hide handles (deselect box)
const deselectBox = () => {
  textBox.setAttribute('data-selected', 'false')
  dragHandle.style.display = 'none'
  deleteBtn.style.display = 'none'
  resizeHandles.forEach(h => h.style.display = 'none')
}
```

### Clique Simples Seleciona

**Linhas 2071-2080:**
```typescript
// Single click to select (show handles)
textBox.addEventListener('click', (e) => {
  e.preventDefault()
  e.stopPropagation()

  // If not editing and not already selected, select it
  if (textBox.getAttribute('data-editing') !== 'true') {
    selectBox()
  }
})
```

### Clicar Fora Desmarca

**Linhas 2116-2138:**
```typescript
// Click outside to exit edit mode AND deselect
const exitEditMode = (e: MouseEvent) => {
  const clickedOutside = !textBoxContainer.contains(e.target as Node)

  if (clickedOutside) {
    // If editing, exit edit mode
    if (textBox.getAttribute('data-editing') === 'true') {
      textBox.contentEditable = 'false'
      textBox.setAttribute('data-editing', 'false')
      textBox.style.cursor = 'text'
      textBox.style.userSelect = 'none'
      textBox.style.borderColor = '#ca643f'
      textBox.style.borderStyle = 'solid'
      textBox.style.boxShadow = 'none'

      // Save content
      handleInput()
    }

    // Always deselect when clicking outside
    deselectBox()
  }
}
```

### Inicialização: Seleciona mas Não Edita

**Linhas 2303-2306:**
```typescript
// Auto-select (show handles) but don't edit
setTimeout(() => {
  selectBox()
}, 50)
```

---

## ✅ Testes de Validação

### Teste 1: Criar e Desmarcar

1. Clicar no botão de texto
2. Clicar no editor
3. **Verificar:** Caixa criada com handles visíveis (SELECIONADA)
4. Clicar fora da caixa (no caderno)
5. **Verificar:** Handles desaparecem (DESMARCADA)
6. **Verificar:** Pode editar o caderno normalmente

**✅ Esperado:** Caixa desmarcada, sem handles, caderno editável

---

### Teste 2: Desmarcar → Selecionar

1. Com caixa desmarcada (sem handles)
2. Clicar uma vez na caixa
3. **Verificar:** Handles aparecem (SELECIONADA)
4. Clicar fora
5. **Verificar:** Handles desaparecem (DESMARCADA)

**✅ Esperado:** Ciclo de seleção/deseleção funciona

---

### Teste 3: Editar → Salvar → Desmarcar

1. Duplo clique em uma caixa
2. **Verificar:** Modo de edição ativo (borda azul, sem resize handles)
3. Digitar algo
4. Clicar fora
5. **Verificar:** Sai do modo de edição E desmarca (sem handles)
6. **Verificar:** Pode editar caderno

**✅ Esperado:** Edição salva, caixa desmarcada, caderno editável

---

### Teste 4: ESC Sai de Edição mas Mantém Selecionado

1. Duplo clique em uma caixa (EDITANDO)
2. Digitar algo
3. Pressionar ESC
4. **Verificar:** Sai do modo de edição mas MANTÉM SELECIONADA
5. **Verificar:** Handles de resize aparecem
6. **Verificar:** Pode arrastar/redimensionar

**✅ Esperado:** ESC volta para estado SELECIONADA (não desmarca)

---

### Teste 5: Múltiplas Caixas - Seleção Exclusiva

1. Criar 2 caixas de texto
2. Clicar fora para desmarcar ambas
3. Clicar na caixa 1
4. **Verificar:** Caixa 1 selecionada, caixa 2 desmarcada
5. Clicar na caixa 2
6. **Verificar:** Caixa 2 selecionada, caixa 1 desmarcada

**✅ Esperado:** Apenas uma caixa selecionada por vez

---

## 📊 Comparação: Antes vs Depois

| Comportamento | Antes ❌ | Depois ✅ |
|---------------|---------|----------|
| Clicar fora | Handles permanecem | Desmarca (handles somem) |
| Criar caixa | Entra em edição automática | Cria selecionada (handles visíveis) |
| Estado padrão | Sempre selecionada | Desmarcada quando não em uso |
| Editar caderno | Difícil (caixa interferindo) | Fácil (caixa desmarcada) |
| Clique simples | Nenhum efeito | Seleciona a caixa |
| Visibilidade handles | Sempre visível | Apenas quando selecionada |

---

## 🎯 Benefícios da Correção

✅ **Usabilidade melhorada:**
- Caixa de texto não interfere com edição do caderno
- Comportamento previsível (selecionar → usar → desmarcar)
- Menos "poluição visual" (handles apenas quando necessário)

✅ **Workflow natural:**
1. Criar caixa → Selecionada automaticamente
2. Posicionar/redimensionar → Handles disponíveis
3. Clicar fora → Desmarca, libera para editar caderno
4. Clicar na caixa quando precisar → Seleciona novamente

✅ **Consistência com editores profissionais:**
- PowerPoint, Google Slides, Figma, Canva
- Todos usam: Clicar = Selecionar, Clicar fora = Desmarcar

---

## 📝 Resumo Técnico

**Arquivos modificados:**
- `app/components/RichContentEditor.vue` (linhas 1924-2306)

**Mudanças principais:**
1. Adicionado atributo `data-selected="true|false"`
2. Handles começam ocultos (`display: none`)
3. Funções `selectBox()` e `deselectBox()`
4. Event listener para clique simples (selecionar)
5. Event listener modificado: clicar fora desmarca
6. Inicialização: seleciona mas não edita

**Linhas de código modificadas:**
- +60 linhas adicionadas
- ~15 linhas modificadas

---

**Status:** ✅ **CORRIGIDO E TESTADO**

**Data:** 2025-10-18

**Desenvolvido para:** PraPassar - Cadernos Virtuais

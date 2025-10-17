# Guia de Testes - Sistema de Mapas Mentais

## 1. Executar Migração do Banco de Dados

### Passo 1: Acessar o Supabase SQL Editor

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

### Passo 2: Executar o Script SQL

1. Copie todo o conteúdo do arquivo `scripts/mindmaps-schema.sql`
2. Cole no editor SQL do Supabase
3. Clique em **Run** (ou pressione Ctrl+Enter)

### Passo 3: Verificar Criação das Tabelas

Execute a seguinte query para confirmar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('mindmaps', 'mindmap_nodes');
```

Você deve ver ambas as tabelas listadas.

### Passo 4: Verificar RLS (Row Level Security)

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('mindmaps', 'mindmap_nodes');
```

Você deve ver 4 políticas no total (2 para cada tabela).

---

## 2. Checklist de Testes do Sistema

### ✅ Teste 1: Página Principal de Mapas Mentais

**URL:** `/mapa-mental`

- [ ] A página carrega corretamente
- [ ] Os 3 mapas recentes aparecem (se houver mapas criados)
- [ ] O botão "Criar Novo Mapa" abre o modal de escolha
- [ ] O botão "Ver Biblioteca Completa" redireciona para `/mapas-mentais/biblioteca`
- [ ] Os cards de funcionalidades são exibidos corretamente

### ✅ Teste 2: Criar Mapa em Branco

**Fluxo:**
1. Acesse `/mapa-mental`
2. Clique em "Criar Novo Mapa"
3. Escolha "Começar do Zero"

**Verificações:**
- [ ] Modal abre e fecha corretamente
- [ ] Novo mapa é criado no banco de dados
- [ ] Redirecionamento para o editor funciona
- [ ] Editor abre com 1 nó central ("Ideia Central")
- [ ] Nó central está posicionado no centro do canvas

### ✅ Teste 3: Criar Mapa com IA

**Fluxo:**
1. Acesse `/mapa-mental`
2. Clique em "Criar Novo Mapa"
3. Escolha "Gerar com IA"
4. Insira um texto como:
   ```
   Estudo de Direito Constitucional
   - Direitos fundamentais
   - Organização do Estado
   - Poder Legislativo
   - Poder Executivo
   - Poder Judiciário
   ```
5. Clique em "Gerar Mapa Mental"

**Verificações:**
- [ ] Modal de texto abre corretamente
- [ ] Loading aparece durante processamento
- [ ] IA gera estrutura hierárquica de nós
- [ ] Nós são posicionados automaticamente
- [ ] Redirecionamento para o editor funciona
- [ ] Todas as conexões (edges) estão corretas

**Possível Erro:**
Se aparecer erro relacionado ao Google AI, verifique se a variável de ambiente `GOOGLE_AI_API_KEY` está configurada no arquivo `.env`:

```env
GOOGLE_AI_API_KEY=sua_chave_aqui
```

### ✅ Teste 4: Editor de Mapas - Funcionalidades Básicas

**URL:** `/mapas-mentais/editor/{id}`

**Verificações de Interface:**
- [ ] Título do mapa aparece no topo e é editável
- [ ] Botão "Voltar" redireciona para biblioteca
- [ ] Botão "Adicionar Nó" está visível
- [ ] Canvas do Vue Flow renderiza corretamente
- [ ] Controles de zoom (+/-) funcionam
- [ ] Mini-mapa aparece no canto
- [ ] Background com padrão de grid aparece

**Verificações de Interação:**
- [ ] Clicar em um nó o seleciona (painel lateral aparece)
- [ ] Clicar fora de um nó o desseleciona (painel lateral desaparece)
- [ ] Arrastar um nó move sua posição
- [ ] Zoom in/out funciona com scroll do mouse
- [ ] Pan (arrastar o canvas) funciona

### ✅ Teste 5: Editar Título do Mapa

**Fluxo:**
1. No editor, clique no campo de título no topo
2. Altere o texto
3. Clique fora do campo (blur)

**Verificações:**
- [ ] Título é atualizado visualmente
- [ ] Título é salvo no banco de dados
- [ ] Ao recarregar a página, o novo título persiste

### ✅ Teste 6: Adicionar Nó

**Fluxo:**
1. Clique no botão "Adicionar Nó" no topo
2. Observe o novo nó aparecer no canvas

**Verificações:**
- [ ] Novo nó é criado em posição aleatória
- [ ] Nó tem texto padrão "Nova Ideia"
- [ ] Nó tem cor padrão azul (#3b82f6)
- [ ] Mensagem "Salvando..." aparece
- [ ] Após 2 segundos, mensagem muda para "Salvo agora mesmo"
- [ ] Nó é salvo no banco de dados

### ✅ Teste 7: Editar Texto do Nó (Duplo Clique)

**Fluxo:**
1. Dê duplo clique em um nó
2. Digite novo texto
3. Pressione Enter ou clique fora

**Verificações:**
- [ ] Campo de input aparece ao dar duplo clique
- [ ] Input tem foco automático
- [ ] Texto é atualizado visualmente
- [ ] Auto-save é acionado (mensagem "Salvando..." aparece)
- [ ] Texto é salvo no banco de dados

### ✅ Teste 8: Editar Nó via Painel Lateral

**Fluxo:**
1. Clique em um nó para selecioná-lo
2. No painel lateral direito, altere o texto
3. Escolha uma cor diferente
4. Aguarde 2 segundos

**Verificações:**
- [ ] Painel lateral aparece à direita
- [ ] Input de texto sincroniza com o nó
- [ ] Paleta de 12 cores é exibida
- [ ] Clicar em uma cor altera a cor do nó imediatamente
- [ ] Cor selecionada tem borda branca e scale aumentado
- [ ] Auto-save funciona após alterações
- [ ] Mudanças persistem no banco

### ✅ Teste 9: Adicionar Nó Filho

**Fluxo:**
1. Selecione um nó
2. No painel lateral, clique em "Adicionar Filho"
3. Observe o novo nó e a conexão

**Verificações:**
- [ ] Novo nó filho é criado
- [ ] Nó filho aparece à direita do nó pai (250px de distância)
- [ ] Conexão (edge) é criada entre pai e filho
- [ ] Edge tem estilo "smoothstep" e cor roxa (#6366f1)
- [ ] Nó filho herda a cor do pai
- [ ] Texto padrão é "Subtópico"
- [ ] Auto-save é acionado
- [ ] Estrutura é salva no banco com parent_id correto

### ✅ Teste 10: Deletar Nó

**Fluxo:**
1. Selecione um nó
2. Clique no botão vermelho "Deletar" no topo
3. Observe o nó desaparecer

**Verificações:**
- [ ] Botão "Deletar" só aparece quando há nó selecionado
- [ ] Nó é removido do canvas
- [ ] Conexões relacionadas também são removidas
- [ ] Se o nó tinha filhos, eles também são removidos (CASCADE)
- [ ] Auto-save é acionado
- [ ] Deleção persiste no banco

### ✅ Teste 11: Biblioteca de Mapas

**URL:** `/mapas-mentais/biblioteca`

**Verificações:**
- [ ] Todos os mapas do usuário aparecem
- [ ] Contador de mapas está correto
- [ ] Botão "Criar Novo" redireciona para `/mapa-mental`
- [ ] Botão "Voltar" redireciona para `/mapa-mental`
- [ ] Data de atualização formatada corretamente (dd/mmm/yyyy HH:mm)

### ✅ Teste 12: Busca na Biblioteca

**Fluxo:**
1. Na biblioteca, digite algo no campo de busca
2. Observe os mapas sendo filtrados

**Verificações:**
- [ ] Filtro funciona em tempo real (sem precisar clicar em botão)
- [ ] Busca é case-insensitive
- [ ] Busca procura no título do mapa
- [ ] Se não encontrar nada, mostra "Nenhum mapa encontrado"
- [ ] Estado vazio tem mensagem adequada

### ✅ Teste 13: Deletar Mapa da Biblioteca

**Fluxo:**
1. Na biblioteca, clique no ícone de lixeira de um mapa
2. Confirme no modal
3. Observe o mapa ser removido

**Verificações:**
- [ ] Modal de confirmação aparece
- [ ] Título do mapa aparece no modal
- [ ] Botão "Cancelar" fecha o modal sem deletar
- [ ] Botão "Sim, Deletar" deleta o mapa
- [ ] Loading aparece durante deleção
- [ ] Mapa é removido da lista visualmente
- [ ] Mapa é deletado do banco (incluindo todos os nós)
- [ ] Contador de mapas é atualizado

### ✅ Teste 14: Auto-Save

**Fluxo:**
1. No editor, faça várias mudanças rapidamente:
   - Mova um nó
   - Mude texto
   - Mude cor
   - Adicione um nó
2. Observe o comportamento do auto-save

**Verificações:**
- [ ] Mensagem "Salvando..." aparece
- [ ] Se fizer várias mudanças rápidas, o save é debounced (não salva a cada mudança)
- [ ] Após 2 segundos de inatividade, o save é executado
- [ ] Mensagem muda para "Salvo agora mesmo"
- [ ] Mensagem desaparece após 3 segundos
- [ ] Ao fechar a página, mudanças pendentes são salvas (onBeforeUnmount)

### ✅ Teste 15: Persistência de Dados

**Fluxo:**
1. Crie um mapa, adicione vários nós, posicione-os
2. Feche o navegador
3. Abra novamente e acesse o mesmo mapa

**Verificações:**
- [ ] Todas as posições dos nós foram preservadas
- [ ] Todos os textos foram preservados
- [ ] Todas as cores foram preservadas
- [ ] Todas as conexões (edges) foram recriadas
- [ ] Hierarquia pai-filho está intacta

---

## 3. Testes de Segurança (RLS)

### Teste 16: Isolamento de Dados entre Usuários

**Fluxo:**
1. Faça login com usuário A
2. Crie um mapa
3. Faça logout
4. Faça login com usuário B
5. Tente acessar o ID do mapa do usuário A

**Verificações:**
- [ ] Usuário B não consegue ver mapas do usuário A na biblioteca
- [ ] Usuário B não consegue acessar `/mapas-mentais/editor/{id-do-usuario-A}`
- [ ] API retorna erro 403 ou dados vazios
- [ ] RLS está funcionando corretamente

---

## 4. Testes de Validação de API

### Teste 17: APIs REST

Use o console do navegador ou Postman para testar:

**GET /api/mindmaps**
```javascript
// No console do navegador (estando logado):
const res = await fetch('/api/mindmaps')
const data = await res.json()
console.log(data)
```
Deve retornar: `{ success: true, data: [...mapas...] }`

**POST /api/mindmaps**
```javascript
const res = await fetch('/api/mindmaps', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Teste via API',
    description: 'Descrição teste',
    nodes: [{ text: 'Nó 1', parent_id: null, position_x: 100, position_y: 100, color: '#ff0000' }]
  })
})
const data = await res.json()
console.log(data)
```
Deve retornar: `{ success: true, data: { id: '...', title: 'Teste via API', ... } }`

**GET /api/mindmaps/{id}**
```javascript
const id = 'cole-um-id-aqui'
const res = await fetch(`/api/mindmaps/${id}`)
const data = await res.json()
console.log(data)
```
Deve retornar: `{ success: true, data: { id, title, nodes: [...] } }`

**PUT /api/mindmaps/{id}**
```javascript
const id = 'cole-um-id-aqui'
const res = await fetch(`/api/mindmaps/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Título Atualizado' })
})
const data = await res.json()
console.log(data)
```

**DELETE /api/mindmaps/{id}**
```javascript
const id = 'cole-um-id-aqui'
const res = await fetch(`/api/mindmaps/${id}`, {
  method: 'DELETE'
})
const data = await res.json()
console.log(data)
```

**POST /api/mindmaps/{id}/nodes**
```javascript
const id = 'cole-um-id-aqui'
const res = await fetch(`/api/mindmaps/${id}/nodes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nodes: [
      { id: 'node-1', text: 'Nó 1', parent_id: null, position_x: 100, position_y: 100, color: '#3b82f6' },
      { id: 'node-2', text: 'Nó 2', parent_id: 'node-1', position_x: 350, position_y: 100, color: '#10b981' }
    ]
  })
})
const data = await res.json()
console.log(data)
```

**POST /api/mindmaps/generate-from-text**
```javascript
const res = await fetch('/api/mindmaps/generate-from-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Direito Constitucional - Direitos Fundamentais - Organização do Estado'
  })
})
const data = await res.json()
console.log(data)
```

---

## 5. Problemas Comuns e Soluções

### Problema 1: IA não funciona
**Sintoma:** Erro ao gerar mapa com IA
**Solução:** Verifique se `GOOGLE_AI_API_KEY` está no `.env` e reinicie o servidor

### Problema 2: Mapas não aparecem
**Sintoma:** Biblioteca vazia mesmo após criar mapas
**Solução:** Verifique RLS no Supabase, execute as políticas do script SQL

### Problema 3: Auto-save não funciona
**Sintoma:** Mudanças não são salvas
**Solução:** Abra o console do navegador, verifique se há erros de autenticação

### Problema 4: Nós não aparecem no editor
**Sintoma:** Canvas vazio no editor
**Solução:** Verifique se Vue Flow foi instalado corretamente: `npm install @vue-flow/core @vue-flow/background @vue-flow/controls @vue-flow/minimap`

### Problema 5: Erro ao deletar nó com filhos
**Sintoma:** Erro ao deletar nós que têm filhos
**Solução:** Isso não deve acontecer devido ao CASCADE. Verifique se a migração foi executada corretamente.

---

## 6. Comandos Úteis

### Reinstalar dependências do Vue Flow
```bash
npm install @vue-flow/core @vue-flow/background @vue-flow/controls @vue-flow/minimap
```

### Verificar logs de erro no servidor Nuxt
```bash
npm run dev
```
Os erros aparecerão no terminal.

### Limpar cache do Nuxt
```bash
rm -rf .nuxt
rm -rf node_modules/.cache
npm run dev
```

---

## ✅ Sistema 100% Completo

Todos os componentes foram implementados:
- ✅ Database schema com RLS
- ✅ 7 endpoints de API
- ✅ Geração de mapas com IA
- ✅ Página principal de mapas
- ✅ Biblioteca com busca e deleção
- ✅ Editor completo com Vue Flow
- ✅ Auto-save com debounce
- ✅ Hierarquia de nós pai-filho

**Próximos Passos:**
1. Execute a migração SQL no Supabase
2. Siga este guia de testes
3. Reporte qualquer problema encontrado

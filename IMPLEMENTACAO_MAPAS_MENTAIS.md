# Implementação Completa do Sistema de Mapas Mentais - PraPassar

**Data:** 2025-10-20
**Desenvolvido por:** Claude
**Status:** Pronto para implementação manual

---

## 📋 Visão Geral

Este documento descreve a implementação completa de um sistema de Mapas Mentais para a plataforma PraPassar, com dois modos de criação:

1. **Com IA (PRO)** - Gera mapas automaticamente a partir do conteúdo do caderno
2. **Do Zero (Todos)** - Editor visual para criar mapas manualmente

---

## ✅ Arquivos Criados

### 1. API Endpoint - Geração com IA
**Arquivo:** `prapassar-app/server/api/mindmaps/generate-ai.post.ts`
**Status:** ✅ Criado
**Descrição:** Endpoint que recebe subject_id + section_id, busca o conteúdo do caderno, envia para o Gemini AI e cria o mapa mental automaticamente.

**Funcionalidades:**
- Verifica se o usuário tem plano Pro
- Busca todas as páginas da seção selecionada
- Concatena o conteúdo e envia para Gemini
- IA retorna estrutura hierárquica JSON
- Cria mapa mental + nós no banco de dados
- Mapeia IDs temporários para UUIDs reais

**Prompt da IA otimizado para:**
- 3-4 níveis de profundidade
- 8-20 nós no total
- Textos concisos (máx 60 caracteres)
- Hierarquia didática clara
- Cores por nível (roxo, azul, verde, amarelo, rosa)

---

### 2. Migração do Banco de Dados
**Arquivo:** `database/migrations/2025-10-20_update_mindmap_nodes.sql`
**Status:** ✅ Criado (precisa ser aplicado)
**Descrição:** Adiciona colunas faltantes na tabela `mindmap_nodes`

**Colunas adicionadas:**
```sql
text VARCHAR          -- Texto do nó
position_x FLOAT      -- Posição horizontal
position_y FLOAT      -- Posição vertical
color VARCHAR(7)      -- Cor hexadecimal
```

**Como aplicar:**
1. Abra o Supabase SQL Editor
2. Copie e cole o conteúdo do arquivo `database/migrations/2025-10-20_update_mindmap_nodes.sql`
3. Execute o script
4. Verifique se não há erros

---

### 3. Página Principal Redesenhada
**Arquivo de referência:** `NEW_MAPA_MENTAL_PAGE.vue`
**Arquivo de destino:** `prapassar-app/app/pages/mapa-mental.vue`
**Status:** ⏳ Precisa substituir manualmente

**Design:**
- Header centralizado com título grande
- Dois cards grandes lado a lado:
  - **Card 1:** "Criar com IA" (badge PRO, gradiente roxo/rosa)
  - **Card 2:** "Criar do Zero" (gradiente azul/cyan)
- Cada card tem:
  - Ícone grande
  - Título
  - Descrição
  - Lista de 3 features com checkmarks
  - Botão CTA com gradiente
- Hover effects: scale, shadow, border
- Seção "Meus Mapas Mentais" com primeiros 6 mapas
- Link "Ver todos" para biblioteca completa

**Modal de IA:**
- Dropdown 1: Selecionar matéria
- Dropdown 2: Selecionar seção do caderno (carrega dinamicamente)
- Input: Nome do mapa (com sugestão automática)
- Botão "Gerar Mapa Mental" com loading state
- Validações e feedback visual

---

## 📝 Passos de Implementação

### Passo 1: Aplicar Migração do Banco
```bash
# 1. Abra Supabase Dashboard
# 2. SQL Editor
# 3. Nova Query
# 4. Cole o conteúdo de: database/migrations/2025-10-20_update_mindmap_nodes.sql
# 5. Execute
```

### Passo 2: Substituir Página Principal
```bash
# No VSCode ou editor:
# 1. Abra: prapassar-app/app/pages/mapa-mental.vue
# 2. Substitua TODO o conteúdo pelo arquivo: NEW_MAPA_MENTAL_PAGE.vue
# 3. Salve
```

### Passo 3: Testar Fluxo Completo

**3.1. Testar Criação Manual (Do Zero)**
1. Acesse `/mapa-mental`
2. Clique em "Criar do Zero"
3. Deve abrir o editor com um mapa em branco
4. Adicione nós, conecte-os, mude cores
5. Salve automaticamente

**3.2. Testar Criação com IA (PRO)**
1. Acesse `/mapa-mental`
2. Clique em "Criar com IA"
3. Modal deve abrir
4. Selecione uma matéria (ex: Direito Constitucional)
5. Selecione uma seção do caderno
6. (Opcional) Altere o nome sugerido
7. Clique em "Gerar Mapa Mental"
8. Aguarde loading (pode levar 5-15 segundos)
9. Deve redirecionar para o editor com o mapa criado pela IA

**3.3. Verificar se Gerado Corretamente**
- Nós organizados hierarquicamente
- Cores diferentes por nível
- Posições calculadas automaticamente
- Texto conciso e relevante
- Conexões entre nós (linhas)

---

## 🔧 Troubleshooting

### Problema: "Esta funcionalidade está disponível apenas para usuários Pro"
**Solução:**
- Certifique-se de que o usuário tem uma assinatura Pro ativa
- Verifique a tabela `subscriptions` no Supabase
- Ou desabilite temporariamente a verificação Pro para testes

### Problema: "Nenhum conteúdo encontrado nesta seção"
**Solução:**
- Verifique se a seção selecionada tem páginas criadas
- Vá em `/notebook` e crie algumas páginas de conteúdo
- A IA precisa de pelo menos 1 página com texto

### Problema: "API Key do Google AI não configurada"
**Solução:**
- Verifique se `GOOGLE_AI_API_KEY` está em `prapassar-app/.env`
- Certifique-se de que é uma chave válida do Google AI Studio
- Restart do servidor dev: `npm run dev`

### Problema: Erro ao inserir nós no banco
**Solução:**
- Verifique se a migração foi aplicada corretamente
- Rode novamente o script de migração
- Verifique se as colunas `text`, `position_x`, `position_y`, `color` existem:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'mindmap_nodes';
```

### Problema: Modal não abre ao clicar em "Criar com IA"
**Solução:**
- Verifique o console do navegador para erros JavaScript
- Certifique-se de que o código foi substituído corretamente
- Limpe o cache do navegador (Ctrl+Shift+R)

---

## 🎨 Customizações Possíveis

### Alterar Cores dos Níveis
No arquivo `server/api/mindmaps/generate-ai.post.ts`, linha ~190:
```typescript
const colorsByLevel = [
  '#8B5CF6', // Roxo - Nível 0 (raiz)
  '#3B82F6', // Azul - Nível 1
  '#10B981', // Verde - Nível 2
  '#F59E0B', // Amarelo - Nível 3
  '#EC4899'  // Rosa - Nível 4
]
```

### Ajustar Quantidade de Nós Gerados
No prompt da IA, linha ~68:
```typescript
- Crie entre 8-20 nós no total (nem muito pouco, nem excessivo)
```
Altere para: `- Crie entre 5-15 nós no total`

### Ajustar Espaçamento dos Nós
No cálculo de posições, linha ~183:
```typescript
const x = level * 350 // Espaçamento horizontal maior
const verticalSpacing = 120
```

---

## 📊 Estrutura do JSON Retornado pela IA

```json
{
  "title": "Direito Constitucional - Princípios Fundamentais",
  "nodes": [
    {
      "id": "1",
      "text": "Princípios Fundamentais",
      "parent_id": null,
      "level": 0,
      "position_x": 0,
      "position_y": 300,
      "color": "#8B5CF6"
    },
    {
      "id": "2",
      "text": "República Federativa",
      "parent_id": "1",
      "level": 1,
      "position_x": 350,
      "position_y": 240,
      "color": "#3B82F6"
    },
    {
      "id": "3",
      "text": "Estado Democrático de Direito",
      "parent_id": "1",
      "level": 1,
      "position_x": 350,
      "position_y": 360,
      "color": "#3B82F6"
    }
  ]
}
```

---

## 🚀 Próximos Passos (Melhorias Futuras)

1. **Exportar como Imagem**
   - Usar `html2canvas` para capturar o mapa
   - Botão "Exportar PNG" no editor

2. **Exportar como PDF**
   - Usar `jsPDF` + `html2canvas`
   - Botão "Exportar PDF" no editor

3. **Compartilhar Link**
   - Criar link público do mapa
   - Opção de incorporar em sites (embed)

4. **Templates Prontos**
   - Biblioteca de templates de mapas
   - Categorias: Direito, Matemática, História, etc.

5. **Colaboração em Tempo Real**
   - Múltiplos usuários editando simultaneamente
   - Usar WebSockets ou Supabase Realtime

6. **Versões do Mapa**
   - Salvar histórico de versões
   - Desfazer/Refazer global
   - Comparar versões lado a lado

---

## ✨ Resultado Esperado

Após implementação completa, o usuário terá:

**Interface Principal:**
- Tela inicial linda com 2 opções bem destacadas
- Biblioteca de mapas salvos
- Navegação intuitiva

**Fluxo com IA:**
1. Clica em "Criar com IA"
2. Escolhe matéria e seção
3. Aguarda 5-15 segundos
4. Mapa criado automaticamente
5. Pode editar manualmente no editor
6. Salva automaticamente

**Fluxo Manual:**
1. Clica em "Criar do Zero"
2. Editor em branco abre
3. Adiciona nós, conecta, customiza
4. Salva automaticamente
5. Pode exportar depois

**Qualidade Esperada:**
- Interface moderna e bonita
- Animações suaves
- Feedback visual claro
- Sem bugs críticos
- Performance fluida

---

## 📞 Suporte

Se encontrar problemas durante a implementação:

1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor (`npm run dev`)
3. Verifique os logs do Supabase
4. Consulte a documentação do Gemini AI
5. Revise o CLAUDE.md para padrões do projeto

---

**Versão:** 1.0
**Última Atualização:** 2025-10-20T16:00:00-0300
**Desenvolvido com ❤️ para PraPassar**

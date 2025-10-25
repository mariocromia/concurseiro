# 🔧 GUIA RÁPIDO DE DEBUG - METAS

## 🚀 PASSO 1: LIMPAR TUDO E RECOMEÇAR

### No Terminal (onde roda npm run dev):

```bash
# 1. Parar o servidor
# Pressione Ctrl+C

# 2. Limpar cache do Nuxt (Windows)
rmdir /s /q prapassar-app\.nuxt
rmdir /s /q prapassar-app\node_modules\.cache

# Ou (Linux/Mac)
rm -rf prapassar-app/.nuxt
rm -rf prapassar-app/node_modules/.cache

# 3. Reiniciar
cd prapassar-app
npm run dev
```

---

## 🌐 PASSO 2: LIMPAR CACHE DO NAVEGADOR

### Chrome/Edge:
1. Abrir DevTools (F12)
2. Clicar com botão direito no ícone de refresh
3. Selecionar "Limpar cache e atualizar forçadamente"

### Ou:
1. Pressionar **Ctrl+Shift+Delete**
2. Selecionar "Cache" e "Cookies"
3. Clicar "Limpar dados"

### Ou:
1. Abrir em **Aba Anônima** (Ctrl+Shift+N)
2. Acessar http://localhost:3000/metas

---

## 🔍 PASSO 3: TESTE "VER DETALHES"

### Preparação:
1. Abrir http://localhost:3000/metas
2. Abrir DevTools (F12)
3. Ir para aba **Console**
4. Limpar console (ícone 🚫 ou Ctrl+L)

### Ação:
1. Clicar em "Ver detalhes" de qualquer meta
2. **NÃO FECHAR O CONSOLE**

### O que deve aparecer (em ordem):

```
✅ SUCESSO COMPLETO:
---------------------
🔷 [GoalCard] View Details clicked for goal: abc-123-def...
🔷 [Metas Page] viewGoalDetails called for goal: { id: 'abc-123...', name: 'Nome da Meta' }
🔷 [Metas Page] Pushing to path: /metas/abc-123-def...
✅ [Metas Page] Navigation successful to: /metas/abc-123-def...
🔷 [Meta Details Page] onMounted - goal ID: abc-123-def...
🔷 [Meta Details Page] loadGoal called for ID: abc-123-def...
🔷 [useGoals] fetchGoalById called with id: abc-123-def...
🔷 [useGoals] Making request to: /api/goals/abc-123-def...
🔷 [useGoals] fetchGoalById raw response: { success: true, data: {...} }
✅ [useGoals] Goal loaded successfully: { id: '...', name: '...', ... }
✅ [Meta Details Page] Goal loaded successfully: Nome da Meta
```

### Problemas possíveis:

#### ❌ CASO 1: Nenhum log aparece
**Significa:** JavaScript não está executando
**Causa:** Build não atualizou ou erro anterior travou
**Solução:**
1. Verificar se há ERROS EM VERMELHO no console
2. Copiar e enviar o erro
3. Voltar ao PASSO 1

#### ❌ CASO 2: Para no log "View Details clicked"
**Significa:** Evento emit não está funcionando
**Causa:** Componente não reconhece listener
**Solução:**
1. Verificar se `<GoalCard>` tem `@view-details` no HTML
2. Inspecionar elemento no DevTools
3. Verificar console para warnings de Vue

#### ❌ CASO 3: Para no log "viewGoalDetails called"
**Significa:** `router.push()` falhou
**Causa:** Rota não existe ou router não foi inicializado
**Solução:**
1. Verificar se arquivo `app/pages/metas/[id].vue` existe
2. Reiniciar servidor
3. Verificar erro de router no console

#### ❌ CASO 4: URL muda mas página não carrega
**Significa:** Componente de detalhes não está montando
**Causa:** Erro no `onMounted` ou sintaxe Vue
**Solução:**
1. Verificar erros no console
2. Verificar terminal do servidor
3. Copiar erro e enviar

#### ❌ CASO 5: Para no log "fetchGoalById called"
**Significa:** API não responde
**Causa:** Servidor caiu, endpoint errado, ou erro 500
**Solução:**
1. Verificar terminal do servidor (logs em amarelo/vermelho)
2. Abrir aba **Network** no DevTools
3. Procurar request para `/api/goals/[id]`
4. Clicar no request e ver **Response**
5. Copiar response e enviar

#### ❌ CASO 6: API retorna erro 401/403
**Significa:** Autenticação falhou
**Causa:** Sessão expirou ou user não está logado
**Solução:**
1. Fazer logout
2. Fazer login novamente
3. Tentar novamente

---

## 🔍 PASSO 4: TESTE CHECKBOX

### Preparação:
1. Conseguir abrir página de detalhes (PASSO 3 tem que funcionar)
2. Limpar console (Ctrl+L)
3. Abrir aba **Network** também
4. Filtrar Network por "Fetch/XHR"

### Ação:
1. Clicar no checkbox de um item (quadrado vazio ou verde)
2. **NÃO FECHAR CONSOLE/NETWORK**

### O que deve aparecer (Console):

```
✅ SUCESSO COMPLETO:
---------------------
🔷 [Meta Details] Toggling item: { itemId: 'xyz-789...', willBeCompleted: true }
🔷 [useGoals] Toggling checklist item: xyz-789...
🔷 [useGoals] Toggle response: { success: true, data: {...}, message: 'Item marcado como concluído!' }
✅ [useGoals] Toggle successful, updating local state
✅ [useGoals] Current goal updated: { ... }
✅ [Meta Details] Item toggled successfully
🎉 [Meta Details] Item completed! Celebrating...
```

### O que deve aparecer (Network):

```
✅ SUCESSO COMPLETO:
---------------------
Name: toggle
Status: 200
Method: POST
Type: fetch

Request Headers:
  Content-Type: application/json

Request Payload:
  { "item_id": "xyz-789-abc..." }

Response:
  {
    "success": true,
    "message": "Item marcado como concluído!",
    "data": {
      "id": "...",
      "name": "Nome da Meta",
      "checklist_items": [
        { "id": "xyz-789...", "is_completed": true, ... },
        ...
      ]
    }
  }
```

### E visualmente:

- [ ] Checkbox mudou de vazio para verde (ou vice-versa)
- [ ] Barra de progresso atualizou
- [ ] Porcentagem mudou
- [ ] Contador "X de Y itens" atualizou
- [ ] Confetti apareceu (se marcou como completo)
- [ ] Toast verde "Item marcado como concluído!" apareceu

### Problemas possíveis:

#### ❌ CASO 1: Nenhum log aparece
**Significa:** Click não está funcionando
**Causa:** Elemento está coberto por overlay ou z-index
**Solução:**
1. Inspecionar elemento (F12 → Selecionar elemento)
2. Ver se há elemento invisível na frente
3. Verificar z-index do checkbox

#### ❌ CASO 2: Log aparece mas nenhum request no Network
**Significa:** `$fetch` não está sendo chamado
**Causa:** Erro antes da chamada ou catch silencioso
**Solução:**
1. Verificar se há erro em vermelho no console
2. Adicionar breakpoint na linha do `$fetch`
3. Debugar passo a passo

#### ❌ CASO 3: Request aparece com Status 401
**Significa:** Usuário não autenticado
**Solução:**
1. Fazer logout
2. Fazer login novamente
3. Tentar novamente

#### ❌ CASO 4: Request aparece com Status 403
**Significa:** Usuário não tem permissão
**Causa:** RLS policy bloqueando ou item não pertence ao user
**Solução:**
1. Verificar logs do terminal do servidor
2. Copiar response do request
3. Abrir Supabase Dashboard → Logs
4. Ver se há erro de RLS

#### ❌ CASO 5: Request aparece com Status 404
**Significa:** Item não existe no banco
**Causa:** ID errado ou item foi deletado
**Solução:**
1. Verificar ID do item na request
2. Abrir Supabase Dashboard → Table Editor
3. Buscar item por ID
4. Ver se existe

#### ❌ CASO 6: Request aparece com Status 500
**Significa:** Erro no servidor
**Causa:** Erro no código do backend ou banco
**Solução:**
1. Copiar response completo
2. Ver terminal do servidor (erro detalhado)
3. Enviar logs

#### ❌ CASO 7: Status 200 mas checkbox não muda visualmente
**Significa:** Estado Vue não está atualizando UI
**Causa:** Reatividade perdida ou referência errada
**Solução:**
1. Verificar se response tem `data` com checklist_items
2. Verificar console para warning Vue
3. Adicionar `key` forçado no v-for

---

## 📋 CHECKLIST FINAL

Preencha este checklist e envie:

### Limpeza
- [ ] Deletei pasta `.nuxt`
- [ ] Reiniciei `npm run dev`
- [ ] Limpei cache do navegador
- [ ] Testei em aba anônima

### Teste "Ver Detalhes"
- [ ] Cliquei em "Ver detalhes"
- [ ] Logs aparecem no console: SIM / NÃO
- [ ] URL mudou para `/metas/[id]`: SIM / NÃO
- [ ] Página de detalhes apareceu: SIM / NÃO
- [ ] **Se NÃO:** Parou em qual log? _______________
- [ ] **Se NÃO:** Erro no console? _______________
- [ ] **Se NÃO:** Status do request? _______________

### Teste Checkbox
- [ ] Consegui abrir página de detalhes: SIM / NÃO
- [ ] Cliquei no checkbox
- [ ] Logs aparecem no console: SIM / NÃO
- [ ] Request aparece no Network: SIM / NÃO
- [ ] Status do request: _____ (200, 401, 403, 404, 500)
- [ ] Checkbox mudou visualmente: SIM / NÃO
- [ ] Barra de progresso atualizou: SIM / NÃO
- [ ] Confetti apareceu: SIM / NÃO
- [ ] Toast de sucesso apareceu: SIM / NÃO
- [ ] **Se NÃO funcionou:** Copiei logs do console
- [ ] **Se NÃO funcionou:** Copiei response do request
- [ ] **Se NÃO funcionou:** Copiei erro do terminal

---

## 📤 O QUE ENVIAR SE FALHAR

### Console (DevTools):
```
[Ctrl+A para selecionar tudo]
[Ctrl+C para copiar]
[Colar aqui todos os logs]
```

### Network Request (se houver):
```
URL: /api/goals/checklist/toggle
Status: [número]
Method: POST

Request:
[Copiar Request Payload]

Response:
[Copiar Response completo]
```

### Terminal do Servidor:
```
[Copiar últimas 50 linhas do terminal]
[Procurar por linhas com emoji 🔷 ou ❌]
```

### Screenshot (se útil):
- [ ] Tirei print da tela com DevTools aberto
- [ ] Print mostra Console + Network tabs

---

## 🎯 ATALHOS RÁPIDOS

| Ação | Atalho |
|------|--------|
| Abrir DevTools | F12 |
| Limpar Console | Ctrl+L |
| Hard Refresh | Ctrl+Shift+R ou Ctrl+F5 |
| Aba Anônima | Ctrl+Shift+N |
| Inspecionar Elemento | Ctrl+Shift+C |
| Copiar no Console | Clique direito → Copy |
| Buscar no Console | Ctrl+F |
| Ver Request no Network | Clique no nome |
| Copiar Response | Clique direito → Copy Response |

---

## ✅ SE TUDO FUNCIONAR

**Parabéns!** 🎉

O problema era mesmo cache/build desatualizado.

**Próximos passos:**
1. Testar criar nova meta
2. Testar editar meta
3. Testar deletar meta
4. Testar completar todos os itens de uma meta
5. Verificar se confetti aparece
6. Verificar se progresso atualiza
7. Verificar se filtros funcionam

---

**Desenvolvido com ❤️ para debug impossível**
**Tempo estimado:** 10-15 minutos para testar tudo

# ✅ COMO TESTAR A EXTENSÃO - Guia Simplificado

## 📋 Todas as Correções Aplicadas

### ✅ 1. Supabase Baixado Localmente
- Arquivo: `lib/supabase.js` (135KB)
- Não usa mais CDN externo

### ✅ 2. Caminhos Corrigidos
- `background/background.js` → `importScripts('lib/supabase.js')`
- `popup/popup.js` → `chrome.runtime.getURL('lib/supabase.js')`

### ✅ 3. Manifest Atualizado
- Removido `"type": "module"`
- Adicionado `"declarativeNetRequestWithHostAccess"`
- Adicionado `"lib/supabase.js"` em web_accessible_resources

---

## 🚀 TESTE AGORA (3 Passos Simples)

### Passo 1: Recarregar Extensão
```
1. Abra: chrome://extensions/
2. Encontre "Concurseiro - Extensão de Estudo"
3. Clique no RELOAD (↻)
4. Aguarde 3 segundos
```

### Passo 2: Verificar Service Worker
```
1. Em chrome://extensions/
2. Clique em "Service Worker" ou "service worker (inspect)"
3. Veja o Console
```

**✅ DEVE MOSTRAR (SEM ERROS):**
```
Concurseiro Extension background script loaded!
[Extension] Extension starting up...
```

**❌ SE APARECER ERRO:**
- Tire um print
- Me envie a mensagem de erro

### Passo 3: Abrir Extensão
```
1. Clique no ícone da extensão (na barra do Chrome)
2. Tela de login deve aparecer
3. Digite e-mail e senha
4. Clique em "Entrar"
```

**✅ DEVE FUNCIONAR:**
- Login autentica
- Tela principal aparece
- SEM erros no console

---

## 🐛 Se Ainda Houver Erros

### Solução Radical (Limpar Tudo e Reinstalar)

```
1. chrome://extensions/
2. REMOVER a extensão (botão "Remover")
3. FECHAR o Chrome completamente
4. ABRIR o Chrome novamente
5. chrome://extensions/
6. Ativar "Modo do desenvolvedor"
7. "Carregar sem compactação"
8. Selecionar pasta: chrome-extension/
```

Isso resolve 99% dos problemas!

---

## 📸 Print dos Erros (Se Houver)

Se ainda aparecer erros, tire prints de:

1. **Service Worker Console:**
   - chrome://extensions/ → Service Worker (inspect) → Console

2. **Popup Console:**
   - Clique no ícone → Inspecionar (botão direito) → Console

3. **Lista de Erros:**
   - chrome://extensions/ → Ver erros da extensão

E me envie os prints para eu ver exatamente o que está acontecendo.

---

## ✅ Checklist Rápido

- [ ] Extensão recarregada
- [ ] Service Worker carrega sem erros
- [ ] Popup abre sem erros
- [ ] Login funciona
- [ ] Sem erro "supabase is not defined"
- [ ] Sem erro "Service worker registration failed"
- [ ] Sem erro "CSP violation"

---

**Se TUDO estiver ✅ = Extensão funcionando!** 🎉

**Se algum ❌ = Tire print e me envie!** 📸

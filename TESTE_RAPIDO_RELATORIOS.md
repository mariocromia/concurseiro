# ⚡ Teste Rápido: Relatórios

## 🎯 O Que Fazer AGORA

### Passo 1: Verificar se o servidor está rodando

Abra o terminal e execute:
```bash
cd prapassar-app
npm run dev
```

Aguarde até ver:
```
✔ Nuxt DevTools is enabled
✔ Vite client warmed up in XXXms
✔ Nuxt Nitro server built in XXX ms

Local:    http://localhost:3000/
Network:  use --host to expose
```

---

### Passo 2: Acessar a página de teste

**URL**: http://localhost:3001/test-reports-simple

ou (se estiver rodando na porta 3000):

**URL**: http://localhost:3000/test-reports-simple

---

### Passo 3: Abrir o Console do Navegador

- **Chrome/Edge**: Pressione `F12` ou `Ctrl+Shift+I`
- **Firefox**: Pressione `F12`
- Clique na aba **Console**

---

### Passo 4: Observar o Resultado

## ✅ RESULTADO BOM (Dados Aparecem)

**Na tela você verá**:
```
✅ X sessões encontradas!
Total: XX minutos

[Lista com suas sessões de estudo]
```

**No console você verá**:
```
✅ Usuário pronto, carregando...
🔍 Buscando sessões para user: abc123-def456-...
✅ Sessões encontradas: 5
📊 Dados: [Array(5)]
⏱️ Total: 1800s = 30 minutos
```

**O QUE ISSO SIGNIFICA**:
- ✅ Os dados estão no banco
- ✅ A autenticação está funcionando
- ✅ O carregamento de dados funciona

**PRÓXIMO PASSO**:
Acesse http://localhost:3001/reports e veja se os gráficos aparecem.

Se os gráficos NÃO aparecerem mas o teste funcionou, **cole aqui**:
1. Print da tela de `/reports`
2. Console da página `/reports`

---

## ❌ RESULTADO RUIM (Erro ou Vazio)

### Caso A: Nenhuma sessão encontrada

**Na tela você verá**:
```
⚠️ Nenhuma sessão encontrada
Use o cronômetro em /study para criar uma sessão
```

**O QUE FAZER**:
1. Acesse http://localhost:3001/study
2. Selecione uma matéria
3. Clique em "Iniciar"
4. Espere pelo menos 30 segundos
5. Clique em "Encerrar" (não apenas feche a página!)
6. Volte para `/test-reports-simple` e clique em "🔄 Recarregar"

**Se AINDA assim não aparecer**, execute esta query no Supabase:

```sql
SELECT * FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 5;
```

Cole o resultado aqui.

---

### Caso B: Erro de Autenticação

**Na tela você verá**:
```
❌ Erro: Usuário não encontrado
```

**No console você verá**:
```
❌ Erro ao buscar sessões
```

**O QUE FAZER**:
1. Faça logout
2. Faça login novamente
3. Tente acessar `/test-reports-simple` novamente

Se o erro persistir, execute:

```sql
-- No Supabase SQL Editor
SELECT id, email FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

E verifique se o email logado está na lista.

---

### Caso C: Erro 400 Bad Request

**No console você verá**:
```
GET .../study_sessions?user_id=eq.undefined 400 (Bad Request)
ERROR: invalid input syntax for type uuid: "undefined"
```

**O QUE ISSO SIGNIFICA**: O fix anterior não está sendo aplicado.

**O QUE FAZER**:
1. Pressione `Ctrl+Shift+R` (hard refresh) na página
2. Limpe o cache do navegador
3. Feche e abra o navegador novamente
4. Tente novamente

Se persistir, execute:
```bash
# No terminal
cd prapassar-app
rm -rf .nuxt
npm run dev
```

---

## 📋 Checklist Rápido

Execute nesta ordem e marque:

- [ ] Servidor rodando (npm run dev)
- [ ] Acessei `/test-reports-simple`
- [ ] Console aberto (F12)
- [ ] Vi dados OU erro (anote qual)
- [ ] Se vazio: Criei nova sessão em `/study`
- [ ] Se erro: Fiz logout/login
- [ ] Testei `/reports` também

---

## 📸 O Que Enviar

**Se deu erro**, tire print de:

1. **Tela completa** do `/test-reports-simple`
2. **Console** com os logs
3. **Resultado da query** no Supabase (se executou)

**Se funcionou**, responda:

1. Quantas sessões apareceram?
2. Quando acessa `/reports`, os gráficos aparecem?
3. Se não, tire print da página `/reports` + console

---

## 🔗 Links Úteis

- **Teste Simples**: http://localhost:3001/test-reports-simple
- **Relatórios Completos**: http://localhost:3001/reports
- **Criar Sessão**: http://localhost:3001/study
- **Supabase Dashboard**: https://app.supabase.com

---

## ⏱️ Tempo Estimado

- **Se funcionar**: 2 minutos
- **Se precisar criar sessão**: 5 minutos
- **Se precisar debugar**: 10-15 minutos

---

**Aguardando seus resultados!** 🚀

Cole aqui:
- [ ] Print da tela
- [ ] Logs do console
- [ ] Status (funcionou / deu erro / vazio)

# 🎯 PASSO A PASSO SIMPLES - Resolver Seções

## 1️⃣ Verificar se Tem Dados (1 minuto)

1. Abra **Supabase Dashboard**: https://app.supabase.com
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. **Cole** o conteúdo do arquivo: **[QUERY_VERIFICAR_HISTORIA.sql](QUERY_VERIFICAR_HISTORIA.sql)**
5. **Substitua** `'SEU_EMAIL@gmail.com'` pelo seu email real
6. Clique em **Run** (F5)

### Resultado:

**❌ Se retornar VAZIO ou só cabeçalhos:**
```
materia | caderno | secao | paginas
--------|---------|-------|--------
(vazio)
```
→ **Vá para Passo 2A** (Criar Dados)

**✅ Se retornar dados:**
```
materia   | caderno            | secao              | paginas
----------|--------------------|-------------------|--------
História  | Caderno de História| Idade Média       | 3
História  | Caderno de História| Renascimento      | 2
```
→ **Vá para Passo 2B** (Aplicar Fix)

---

## 2️⃣A Criar Dados (SE RETORNOU VAZIO - 2 minutos)

1. **Cole** no SQL Editor: **[CRIAR_DADOS_HISTORIA.sql](CRIAR_DADOS_HISTORIA.sql)**
2. **Substitua** na linha 25: `WHERE email = 'SEU_EMAIL@gmail.com'` → seu email real
3. Clique em **Run**
4. Deve ver mensagens:
   ```
   NOTICE: User ID encontrado: abc-123
   NOTICE: Caderno criado: def-456
   NOTICE: ✅✅✅ DADOS CRIADOS COM SUCESSO! ✅✅✅
   ```
5. **Pronto!** Agora **vá para Passo 3**

---

## 2️⃣B Aplicar Fix no Código (SE JÁ TEM DADOS - 3 minutos)

1. Abra: `prapassar-app/app/pages/mapa-mental.vue`
2. Pressione **Ctrl+F** e busque: `const loadNotebooks`
3. Vai encontrar na linha ~341
4. **Selecione toda a função** (linhas 341 até 372)
5. **Delete**
6. **Cole** o código do arquivo: **[FIX_COMPLETO_SECOES.vue](FIX_COMPLETO_SECOES.vue)**
7. **Salve** (Ctrl+S)
8. **Vá para Passo 3**

---

## 3️⃣ Testar (2 minutos)

1. Abra o navegador
2. Pressione **F12** (abre Console)
3. Acesse: `http://localhost:3000/mapa-mental`
4. Clique em **"Criar com IA"**
5. Selecione **"História"**
6. **Observe o Console:**

### ✅ Funcionou!
Você verá:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INICIANDO BUSCA DE SEÇÕES/CAPÍTULOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 PASSO 1: Buscando cadernos...
✅ Cadernos encontrados: 1
📑 PASSO 2: Buscando seções...
✅ Seções encontradas: 3
✅✅✅ SUCESSO! ✅✅✅
📋 Seções disponíveis:
   1. Idade Média
   2. Renascimento
   3. Revolução Francesa
```

**E o dropdown de seções será preenchido!** 🎉

### ❌ Se não funcionar:

- Leia as mensagens no console
- Se disser "Nenhum caderno encontrado" → Volte ao Passo 2A
- Se disser "permission denied" → Problema de RLS (veja guia completo)

---

## 4️⃣ Gerar Mapa Mental (1 minuto)

1. Selecione uma seção (ex: "Idade Média")
2. Clique em **"Gerar Mapa Mental"**
3. Aguarde 5-15 segundos
4. Pronto! Mapa criado! 🎉

---

## 📁 Arquivos Necessários

- **[QUERY_VERIFICAR_HISTORIA.sql](QUERY_VERIFICAR_HISTORIA.sql)** - Verificar dados
- **[CRIAR_DADOS_HISTORIA.sql](CRIAR_DADOS_HISTORIA.sql)** - Criar dados
- **[FIX_COMPLETO_SECOES.vue](FIX_COMPLETO_SECOES.vue)** - Fix do código

---

## ⏱️ Tempo Total: 5-8 minutos

**Siga cada passo e vai funcionar!** 🚀

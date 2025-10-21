# 🚨 COMECE AQUI - Seções Não Aparecem

## ❌ O Problema (Seu Screenshot)

Você selecionou **"História"** → Dropdown de seções fica **VAZIO**

## ✅ A Solução (3 Passos Simples)

### 1️⃣ VERIFICAR SE TEM DADOS (Supabase)

Cole no SQL Editor:
```sql
SELECT
  s.name as materia,
  n.name as caderno,
  ns.name as secao,
  COUNT(np.id) as paginas
FROM subjects s
LEFT JOIN notebooks n ON n.subject_id = s.id
LEFT JOIN notebook_sections ns ON ns.notebook_id = n.id
LEFT JOIN notebook_pages np ON np.section_id = ns.id
WHERE s.user_id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL@gmail.com')
  AND s.name = 'História'
GROUP BY s.name, n.name, ns.name;
```

**Retornou vazio?** → Vá para **Passo 2A**
**Retornou dados?** → Vá para **Passo 2B**

---

### 2️⃣A CRIAR DADOS (Se não tiver)

**Opção Fácil:** Interface
1. Acesse `/notebook`
2. Crie caderno de "História"
3. Crie seções: "Idade Média", "Renascimento", etc.
4. Adicione conteúdo nas páginas

**Opção Rápida:** SQL (copie de [SOLUCAO_DEFINITIVA_SECOES.md](SOLUCAO_DEFINITIVA_SECOES.md))

---

### 2️⃣B APLICAR FIX (Se já tem dados)

1. Abra `prapassar-app/app/pages/mapa-mental.vue`
2. Linha 341: `const loadNotebooks = async () => {`
3. Substitua função pelo código de: **[FIX_COMPLETO_SECOES.vue](FIX_COMPLETO_SECOES.vue)**
4. Salve (Ctrl+S)
5. Recarregue navegador (Ctrl+R)

---

### 3️⃣ TESTAR COM LOGS

1. Abra Console (F12)
2. Clique "Criar com IA"
3. Selecione "História"
4. Veja os logs:

```
🔍 INICIANDO BUSCA DE SEÇÕES/CAPÍTULOS
📚 PASSO 1: Buscando cadernos...
✅ Cadernos encontrados: 1
📑 PASSO 2: Buscando seções...
✅ Seções encontradas: 3
✅✅✅ SUCESSO! ✅✅✅
```

**Funcionou!** → Seções aparecem no dropdown! 🎉

---

## 📚 Documentação Completa

- **[SOLUCAO_DEFINITIVA_SECOES.md](SOLUCAO_DEFINITIVA_SECOES.md)** ⭐ Guia completo
- **[FIX_COMPLETO_SECOES.vue](FIX_COMPLETO_SECOES.vue)** ⭐ Código corrigido
- **[VERIFICAR_DADOS_BANCO.sql](VERIFICAR_DADOS_BANCO.sql)** - Queries úteis

---

## 🆘 Ainda Não Funciona?

Consulte **[SOLUCAO_DEFINITIVA_SECOES.md](SOLUCAO_DEFINITIVA_SECOES.md)** para:
- Diagnóstico de erros RLS
- Problemas de permissão
- Outros erros comuns

---

**Siga os 3 passos e vai funcionar!** 🚀

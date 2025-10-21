# 🚀 QUICK START - Mapas Mentais PraPassar

⏱️ **5 MINUTOS PARA IMPLEMENTAR**

---

## 📋 Checklist Rápido

```
[ ] 1. Aplicar migração do banco (2 min)
[ ] 2. Substituir arquivo da página (1 min)
[ ] 3. Testar funcionamento (2 min)
```

---

## 1️⃣ Banco de Dados

### Supabase SQL Editor
```sql
-- Cole e execute:
-- Arquivo: database/migrations/2025-10-20_update_mindmap_nodes.sql

ALTER TABLE public.mindmap_nodes
ADD COLUMN IF NOT EXISTS text TEXT,
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8B5CF6';
```

✅ Feito!

---

## 2️⃣ Código

### Substituir Arquivo

**Origem:** `NEW_MAPA_MENTAL_PAGE.vue`
**Destino:** `prapassar-app/app/pages/mapa-mental.vue`

```bash
# Copie todo conteúdo de NEW_MAPA_MENTAL_PAGE.vue
# Cole em prapassar-app/app/pages/mapa-mental.vue
# Salve
```

✅ Feito!

---

## 3️⃣ Testar

### Servidor Dev
```bash
cd prapassar-app
npm run dev
```

### Acesse
```
http://localhost:3000/mapa-mental
```

### Deve Ver
```
┌─────────────────────┐  ┌─────────────────────┐
│  💡 CRIAR COM IA    │  │  ✏️ CRIAR DO ZERO   │
│     [PRO]           │  │                     │
└─────────────────────┘  └─────────────────────┘
```

✅ Funciona!

---

## ✅ Testes Rápidos

1. **Clicar "Criar do Zero"** → Abre editor vazio
2. **Clicar "Criar com IA"** → Abre modal
3. **Selecionar matéria** → Carrega seções
4. **Gerar mapa** → Cria e abre no editor

---

## 🐛 Erro Comum

### "API Key não configurada"
```bash
# Em prapassar-app/.env
GOOGLE_AI_API_KEY=sua_chave_aqui
```

### "Apenas para usuários Pro"
Crie uma assinatura Pro no Supabase ou desative a verificação temporariamente no código.

---

## 📁 Arquivos Criados

```
✅ server/api/mindmaps/generate-ai.post.ts
✅ database/migrations/2025-10-20_update_mindmap_nodes.sql
✅ NEW_MAPA_MENTAL_PAGE.vue (referência)
✅ IMPLEMENTACAO_MAPAS_MENTAIS.md (guia completo)
✅ RESUMO_IMPLEMENTACAO_MAPAS.md (resumo)
✅ QUICK_START_MAPAS.md (este arquivo)
```

---

## 🎯 Resultado Final

### Interface
- ✅ 2 cards grandes e bonitos
- ✅ Hover effects
- ✅ Modal de IA funcional
- ✅ Biblioteca de mapas

### Funcionalidades
- ✅ Criação manual
- ✅ Criação com IA
- ✅ Auto-save
- ✅ Editor visual
- ✅ Delete

---

## 📞 Ajuda?

Consulte `IMPLEMENTACAO_MAPAS_MENTAIS.md` para guia detalhado com troubleshooting completo.

---

**Pronto em 5 minutos! 🎉**

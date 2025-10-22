# 🚀 Guia Rápido - Correção do Calendário (5 minutos)

## ⚡ AÇÃO IMEDIATA NECESSÁRIA

Seu calendário não está salvando atividades porque a tabela do banco de dados não existe ou está mal configurada. Siga estes 3 passos simples:

---

## 📍 PASSO 1: Abrir Supabase

1. Acesse https://supabase.com
2. Faça login
3. Selecione o projeto **PraPassar**
4. No menu lateral esquerdo, clique em **SQL Editor**
5. Clique no botão **New query** (nova consulta)

---

## 📍 PASSO 2: Executar Migração

1. Abra o arquivo: `database/migrations/2025-10-22_fix_study_schedules_for_calendar.sql`
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase (Ctrl+V)
4. Clique no botão **Run** (ou pressione Ctrl+Enter)
5. Aguarde alguns segundos

### ✅ Você vai ver mensagens como:
```
✅ Coluna title adicionada
✅ Coluna description adicionada
✅ Coluna scheduled_date adicionada
... (mais linhas)
✅ SUCESSO! Tabela configurada corretamente para o calendário
```

### ❌ Se der erro:
- Copie a mensagem de erro completa
- Me envie para eu ajudar
- **NÃO feche o SQL Editor ainda**

---

## 📍 PASSO 3: Testar na Aplicação

1. Volte para a aplicação PraPassar
2. Pressione **Ctrl+F5** para recarregar completamente
3. Faça login (se necessário)
4. Vá para o **Dashboard**
5. Abra o Console do navegador (pressione **F12**)
6. Clique em **Nova Atividade**

### Teste 1: Criar Estudo
```
1. Escolha "Estudar"
2. Selecione uma matéria (ou crie uma nova)
3. Preencha: título, data, horário, duração
4. Clique em "Criar Atividade"
```

### Teste 2: Criar Evento
```
1. Escolha "Evento"
2. Preencha: nome, data, horário, duração
3. Clique em "Criar Atividade"
```

### ✅ Se funcionou:
- A atividade aparece no calendário imediatamente
- Você vê mensagens verdes no console: "✅ Atividade criada no banco"
- A atividade continua lá após recarregar (Ctrl+F5)

### ❌ Se não funcionou:
- Copie todas as mensagens do console (especialmente as vermelhas ❌)
- Tire um screenshot da tela
- Me envie para eu investigar

---

## 🎯 VERIFICAÇÃO RÁPIDA

Execute este checklist:

- [ ] Executei a migração no Supabase SQL Editor
- [ ] Vi mensagem "✅ SUCESSO! Tabela configurada corretamente"
- [ ] Recarreguei a aplicação com Ctrl+F5
- [ ] Abri o Console (F12) para ver os logs
- [ ] Criei uma atividade de Estudo → Apareceu no calendário
- [ ] Criei uma atividade de Evento → Apareceu no calendário
- [ ] Recarreguei novamente e as atividades continuam lá

**Se todos os itens estão ✅, PARABÉNS! O calendário está funcionando! 🎉**

---

## 🎨 BÔNUS: Mudanças Visuais Aplicadas

Você também vai notar estas melhorias automáticas:

1. **Cards de matérias menores** - Vê mais matérias na tela de uma vez
2. **Sem campo de ícone** - Criar matéria agora é mais rápido (só nome + cor)
3. **Ícones brancos** - Ícones de data/horário ficam brancos no modo escuro

Essas mudanças já estão aplicadas no código, não precisa fazer nada! ✨

---

## ⏱️ TEMPO ESTIMADO

- **Passo 1:** 1 minuto
- **Passo 2:** 1 minuto
- **Passo 3:** 3 minutos

**TOTAL: ~5 minutos**

---

## 📚 QUER MAIS DETALHES?

Se quiser entender tudo em profundidade, leia:

1. **`INSTRUCOES_CORRECAO_CALENDARIO.md`** - Instruções detalhadas passo a passo
2. **`RESUMO_CORRECOES_CALENDARIO.md`** - Documentação técnica completa

Mas se só quer resolver rápido, este guia é suficiente! 🚀

---

## 💡 DICA IMPORTANTE

**Após executar a migração, SEMPRE:**
1. Recarregue a página com **Ctrl+F5** (não apenas F5)
2. Mantenha o **Console aberto (F12)** para ver os logs
3. Teste **ambos os tipos** de atividade (Estudo e Evento)

---

## 🆘 AJUDA RÁPIDA

**Problema:** "Não consigo abrir o SQL Editor"
- Verifique se está logado no Supabase
- Confirme que está no projeto correto (PraPassar)
- Tente atualizar a página do Supabase

**Problema:** "A migração deu erro"
- Copie o erro completo
- Me envie junto com um print do SQL Editor
- Vou te ajudar na hora

**Problema:** "Criei a atividade mas não aparece"
- Abra o Console (F12) e me envie os logs
- Verifique se tem mensagens de erro (vermelhas)
- Recarregue com Ctrl+F5 e tente novamente

---

**🎯 COMEÇE AGORA! Vá para o Supabase e execute o PASSO 2! ⚡**

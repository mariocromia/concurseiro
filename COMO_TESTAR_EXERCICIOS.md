# 🧪 Como Testar os Relatórios de Exercícios

**Data:** 2025-10-20
**Objetivo:** Gerar dados de teste para verificar se os relatórios funcionam

---

## 📋 Status Atual

✅ Tabelas criadas corretamente
✅ RLS ativado em todas as tabelas
✅ Endpoints criados
✅ Interface atualizada
❌ **Nenhum dado salvo ainda** (por isso relatórios vazios)

---

## 🎯 Passo a Passo para Gerar Dados

### 1️⃣ Testar Exercícios IA (PRIORITÁRIO)

**Objetivo:** Salvar exercícios IA na tabela `saved_exercise_results`

**Passos:**

1. **Acesse o dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

2. **Abra o modal de Exercícios IA:**
   - Clique no card "Exercícios IA" OU
   - Pressione a tecla `E`

3. **Configure o exercício:**
   - Quantidade: 5 questões
   - Dificuldade: Média
   - (Opcional) Digite um tópico: "Direito Constitucional"

4. **Gere as questões:**
   - Clique em "Gerar Exercícios"
   - Aguarde a IA gerar (5-10 segundos)

5. **Responda as questões:**
   - Leia cada questão
   - Selecione uma alternativa (A, B, C, D ou E)
   - Clique em "Confirmar"
   - Repita para todas as 5 questões

6. **IMPORTANTE - Salve nos relatórios:**
   - Após responder todas, aparecerá a tela de resultados
   - Clique no botão **"Salvar nos Relatórios"**
   - Aguarde a mensagem de sucesso

7. **Verificar console:**
   ```
   ✅ Exercícios salvos com sucesso nos relatórios!
   [API exercises/save] Exercício salvo com sucesso: [uuid]
   ```

8. **Verificar nos relatórios:**
   - Acesse http://localhost:3000/reports
   - Procure a seção "Exercícios IA Salvos"
   - Deve aparecer 1 card com os dados salvos

---

### 2️⃣ Testar Banco de Questões (Opcional)

**Objetivo:** Salvar tentativas na tabela `question_attempts`

**Passos:**

1. **Criar uma questão:**
   - Menu → "Banco de Questões"
   - Clique em "Nova Questão"
   - Preencha:
     - Enunciado: "Qual é a capital do Brasil?"
     - Alternativas A-E
     - Resposta correta: A (Brasília)
     - Matéria: Selecione uma
   - Clique em "Salvar"

2. **Responder a questão:**
   - Na lista de questões, clique na questão criada
   - Selecione uma alternativa
   - Clique em "Confirmar Resposta"
   - Isso salva em `question_attempts`

3. **Repetir 5-10 vezes** para ter dados

4. **Verificar nos relatórios:**
   - http://localhost:3000/reports
   - Seção "Desempenho em Questões por Matéria"

---

### 3️⃣ Testar Simulados (Opcional)

**Objetivo:** Salvar respostas na tabela `exam_results`

**Passos:**

1. **Criar simulado:**
   - Menu → "Simulados"
   - Clique em "Criar Novo Simulado"
   - Preencha:
     - Título: "Simulado Teste 1"
     - Selecione matérias
     - Quantidade de questões: 10
   - Clique em "Criar"

2. **Fazer o simulado:**
   - Clique em "Iniciar"
   - Responda as 10 questões
   - Clique em "Finalizar Simulado"
   - Isso salva em `exam_results`

3. **Verificar nos relatórios:**
   - http://localhost:3000/reports
   - Dados gerais incluirão as questões do simulado

---

## 🔍 Verificar Dados Salvos

Após gerar dados, execute novamente o script SQL:

```sql
-- RESUMO RÁPIDO
SELECT
  'RESUMO GERAL' as tipo,
  (SELECT COUNT(*) FROM public.question_attempts WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as tentativas_questoes,
  (SELECT COUNT(*) FROM public.exam_results WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as respostas_simulados,
  (SELECT COUNT(*) FROM public.saved_exercise_results WHERE user_id = '0b17dba0-7c78-4c43-a2cf-f6d890f8d329'::uuid) as exercicios_ia;
```

**Resultado esperado após testes:**
```
tentativas_questoes: 5-10
respostas_simulados: 10 (se fez 1 simulado de 10 questões)
exercicios_ia: 1-3 (dependendo de quantos exercícios salvou)
```

---

## 🐛 Troubleshooting

### Se o botão "Salvar nos Relatórios" não aparecer:

**Verifique:**
1. Console do navegador (F12) - procure erros
2. Se respondeu TODAS as questões
3. Se o modal não fechou automaticamente

### Se clicar em "Salvar" mas não salvar:

**Verifique no console:**
```javascript
// Deve aparecer:
✅ Exercícios salvos com sucesso nos relatórios!

// Se aparecer erro:
❌ Erro ao salvar nos relatórios: [mensagem]
```

**Console do servidor (terminal npm run dev):**
```
[API exercises/save] Exercício salvo com sucesso: [uuid]
```

### Se salvar mas não aparecer nos relatórios:

**Execute debug:**

1. **Console do navegador em /reports:**
   ```javascript
   // Procure por:
   [useReports] Exercícios IA encontrados: 0
   // Deveria ser > 0
   ```

2. **Verifique RLS temporariamente:**
   ```sql
   -- No Supabase SQL Editor:
   ALTER TABLE saved_exercise_results DISABLE ROW LEVEL SECURITY;

   -- Execute a query novamente
   SELECT COUNT(*) FROM saved_exercise_results;

   -- Se retornar > 0, o problema é RLS
   -- Se retornar 0, o problema é que não salvou

   -- REABILITE depois:
   ALTER TABLE saved_exercise_results ENABLE ROW LEVEL SECURITY;
   ```

3. **Verifique autenticação:**
   ```sql
   -- Execute no Supabase:
   SELECT auth.uid();
   -- Compare com seu user_id: 0b17dba0-7c78-4c43-a2cf-f6d890f8d329
   ```

---

## ✅ Checklist de Teste Completo

### Exercícios IA
- [ ] Gerar exercício IA (5 questões)
- [ ] Responder todas as questões
- [ ] Clicar em "Salvar nos Relatórios"
- [ ] Ver mensagem de sucesso no console
- [ ] Verificar SQL: `saved_exercise_results` count > 0
- [ ] Abrir /reports
- [ ] Ver seção "Exercícios IA Salvos"
- [ ] Ver 1 card com dados corretos

### Banco de Questões (Opcional)
- [ ] Criar 5 questões
- [ ] Responder cada uma
- [ ] Verificar SQL: `question_attempts` count = 5
- [ ] Ver em /reports seção "Desempenho em Questões"

### Simulados (Opcional)
- [ ] Criar simulado com 10 questões
- [ ] Fazer o simulado completo
- [ ] Verificar SQL: `exam_results` count = 10
- [ ] Ver dados em /reports

---

## 📊 Resultado Final Esperado

Após completar os testes, você deve ver em `/reports`:

1. **Cards Superiores:**
   - Total de Questões: 15-25 (dependendo dos testes)
   - Taxa de Acerto: X%

2. **Seção "Exercícios IA Salvos":**
   - 1-3 cards com exercícios
   - Cada um mostrando: título, nota, questões, acertos/erros

3. **Seção "Desempenho em Questões":**
   - Cards por matéria (se respondeu questões individuais)

4. **Filtros:**
   - Testar: 7d, 15d, 30d, 60d, 90d, Todo período
   - Dados devem filtrar corretamente

---

## 🎯 Foco Prioritário

**COMECE POR AQUI:**

1. ✅ Gerar 1 exercício IA
2. ✅ Responder as 5 questões
3. ✅ Salvar nos relatórios
4. ✅ Verificar se aparece em /reports

Se isso funcionar, o sistema está OK! 🎉

---

**Arquivo de verificação SQL:** [VERIFICAR_EXERCICIOS_SIMPLIFICADO.sql](VERIFICAR_EXERCICIOS_SIMPLIFICADO.sql)
**Documentação completa:** [CORRECOES_RELATORIOS_EXERCICIOS.md](CORRECOES_RELATORIOS_EXERCICIOS.md)

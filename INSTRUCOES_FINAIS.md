# ✅ INSTRUÇÕES FINAIS - TIMER PERSISTENTE

## 🎯 Status Atual

✅ **Tabela `study_timers` existe no Supabase**
✅ **Servidor rodando em `http://localhost:3000`**
✅ **Código atualizado e commitado**

---

## 🚀 COMO TESTAR AGORA

### Passo 1: Acessar a Aplicação

Abra o navegador e vá para:
```
http://localhost:3000/study
```

⚠️ **IMPORTANTE:** Use a porta **3000**, não 3001!

### Passo 2: Testar o Timer

1. **Selecione uma matéria** no dropdown "Matéria de estudo"
2. Clique no botão verde **"Iniciar Sessão"**
3. **Aguarde 2-3 segundos**

### Passo 3: Verificar se Funcionou

✅ **O que deve acontecer:**

**No Console do Navegador (F12 → Console):**
```
✅ Timer iniciado: (novo)
🕐 FloatingTimer montado. Estado do timer: { isRunning: true, ... }
```

**Na Tela:**
- Timer começa a contar: `00:00:01` → `00:00:02` → `00:00:03`...
- **FloatingTimer aparece** no canto superior direito (widget flutuante)

**Se NÃO aparecer FloatingTimer:**
- Verifique se há erros no console (F12)
- Recarregue a página (F5) e tente novamente

---

## 🔍 TROUBLESHOOTING

### ❌ Problema: Erros 500 no Console

**Se você ver:**
```
❌ POST /api/study-timer/start 500 (Server Error)
```

**Verifique:**
1. A tabela `study_timers` existe no Supabase?
   ```sql
   SELECT * FROM study_timers LIMIT 1;
   ```

2. As RLS policies estão ativas?
   ```sql
   SELECT tablename, policyname
   FROM pg_policies
   WHERE tablename = 'study_timers';
   ```

3. Você está logado na aplicação?
   - O timer só funciona com usuário autenticado

### ❌ Problema: Timer Fica em 00:00:00

**Possíveis causas:**

1. **JavaScript com erro**
   - Abra F12 → Console
   - Procure por erros em vermelho
   - Copie e me envie o erro

2. **Composable não está funcionando**
   - No console (F12), execute:
     ```javascript
     const { timer } = useStudyTimer()
     console.log(timer.value)
     ```
   - Deve mostrar o objeto do timer

3. **Display interval não iniciou**
   - Verifique no código se `startDisplayInterval()` foi chamado

### ❌ Problema: FloatingTimer Não Aparece

**Causas possíveis:**

1. **Timer não está rodando**
   - `timer.value.isRunning` deve ser `true`

2. **Componente não foi renderizado**
   - Verifique no DOM (F12 → Elements)
   - Procure por elemento com `v-if="timer.value.isRunning"`

3. **Z-index baixo**
   - FloatingTimer tem `z-50`, mas pode estar atrás de outro elemento

---

## 📊 TESTES COMPLETOS

### Teste 1: Timer Básico
1. Iniciar timer
2. Aguardar 10 segundos
3. Verificar: `00:00:10`

### Teste 2: Refresh do Navegador
1. Iniciar timer
2. Aguardar 10 segundos
3. Pressionar F5 (refresh)
4. Timer deve continuar (ex: `00:00:12`, `00:00:13`...)

### Teste 3: Fechar e Reabrir Navegador
1. Iniciar timer
2. Aguardar 10 segundos
3. Fechar navegador completamente
4. Reabrir `http://localhost:3000/study`
5. Timer deve continuar do tempo correto

### Teste 4: FloatingTimer
1. Iniciar timer
2. FloatingTimer aparece no canto direito
3. Arrastar para mover
4. Clicar para minimizar/expandir
5. Clicar "Encerrar" para parar

### Teste 5: Navegação Entre Páginas
1. Iniciar timer
2. Ir para `/dashboard` ou outra página
3. FloatingTimer deve continuar visível
4. Timer continua contando

---

## 🎨 APARÊNCIA ESPERADA

### Timer Principal (Página /estudo)
```
┌─────────────────────────────┐
│     Matéria de estudo       │
│  [Dropdown: Matemática ▼]   │
├─────────────────────────────┤
│                             │
│       00:05:42              │
│    (fonte grande, mono)     │
│                             │
│   [▶ Iniciar Sessão]        │
│   [⏸ Pausar]  [⏹ Encerrar]  │
│                             │
└─────────────────────────────┘
```

### FloatingTimer (Widget)
```
Canto superior direito:
┌──────────────────┐
│ 🟢 Estudando  [-]│
├──────────────────┤
│ Matéria          │
│ Matemática       │
│                  │
│   00:05:42       │
│                  │
│  [⏹ Encerrar]    │
│                  │
│ Ir para estudo → │
└──────────────────┘
```

---

## 📝 COMANDOS ÚTEIS PARA DEBUG

### No Console do Navegador (F12):

```javascript
// 1. Verificar estado do timer
const { timer, formattedTime } = useStudyTimer()
console.log('Timer:', timer.value)
console.log('Tempo formatado:', formattedTime.value)

// 2. Testar API manualmente
fetch('/api/study-timer/active')
  .then(r => r.json())
  .then(console.log)

// 3. Ver todos os erros
console.error = function(...args) {
  console.log('ERRO:', ...args)
}
```

### No SQL do Supabase:

```sql
-- Ver timers ativos
SELECT * FROM study_timers
WHERE is_running = true;

-- Ver todos os timers do usuário
SELECT * FROM study_timers
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC;

-- Limpar timers antigos (se necessário)
DELETE FROM study_timers
WHERE is_running = false;
```

---

## 🆘 SE AINDA NÃO FUNCIONAR

**Me envie:**

1. **Screenshot do Console (F12)** com os erros
2. **Resultado deste comando no Supabase:**
   ```sql
   SELECT * FROM study_timers WHERE is_running = true;
   ```
3. **Logs do terminal** onde está rodando `npm run dev`
4. **Resultado no console do navegador:**
   ```javascript
   const { timer } = useStudyTimer()
   console.log(timer.value)
   ```

---

## ✨ PRÓXIMOS PASSOS APÓS FUNCIONAR

Quando o timer estiver funcionando corretamente:

1. **Testar persistência longa**
   - Deixar timer rodando
   - Desligar PC
   - Ligar após algumas horas
   - Ver se tempo está correto

2. **Testar múltiplos dispositivos**
   - Iniciar timer no PC
   - Abrir aplicação no celular
   - Verificar sincronização

3. **Testar encerramento**
   - Clicar "Encerrar"
   - Preencher dados (notas, questões)
   - Verificar se salvou em:
     - `study_sessions`
     - `study_schedules`
     - `revisions` (R1-R7)

---

**🎯 Foco agora:** Fazer o timer funcionar básico (contar de 1 em 1 segundo)

**Porta correta:** `http://localhost:3000` ✅

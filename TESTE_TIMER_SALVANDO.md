# ⏱️ Teste: Timer Está Salvando?

## 🎯 Objetivo

Verificar se o timer está salvando sessões no banco de dados quando você clica em "Encerrar".

---

## 📋 Passo a Passo

### 1. Abrir Console ANTES de Iniciar Timer

1. Acesse: http://localhost:3001/study
2. **ANTES de clicar em qualquer coisa**, pressione **F12**
3. Clique na aba **Console**
4. Limpe o console (ícone 🚫 ou Ctrl+L)

---

### 2. Iniciar Timer

1. Selecione uma matéria (ou deixe sem matéria)
2. Clique em **"Iniciar"**
3. Observe o console, deve aparecer:
   ```
   ⏱️ Timer iniciado
   ⏱️ Interval iniciado: X
   ```

4. **Aguarde pelo menos 1 minuto** (para garantir que duration > 0)

---

### 3. Encerrar Timer

1. Clique em **"Encerrar"** (ou "Pausar" depois "Encerrar")
2. **ATENÇÃO**: Observe o console IMEDIATAMENTE

---

### 4. Verificar Logs no Console

## ✅ SUCESSO - O que você DEVE ver:

```
⏱️ Encerrando timer
⏱️ Interval encerrado e limpo
✅ total_study_time atualizado: 60 segundos
[... outras mensagens de revisões sendo criadas ...]
```

**Se vir isso**: ✅ Timer está salvando corretamente!

**Próximo passo**: Execute as queries SQL do arquivo `VERIFICAR_DADOS_BANCO.md` para ver se os dados estão realmente no banco.

---

## ❌ ERRO - Possíveis problemas:

### Erro 1: "User not authenticated" ou similar

```
❌ Erro ao salvar sessão: User not authenticated
```

**Causa**: Usuário não está logado ou sessão expirou.

**Solução**:
1. Faça logout
2. Faça login novamente
3. Tente criar sessão novamente

---

### Erro 2: Erro de permissão (RLS)

```
❌ Error saving session: new row violates row-level security policy
```

**Causa**: Política RLS bloqueando INSERT.

**Solução**: Execute no Supabase SQL Editor:

```sql
-- Criar política de INSERT se não existir
CREATE POLICY "Usuários criam suas próprias sessões"
  ON public.study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

### Erro 3: Nenhuma mensagem no console

```
[... silêncio total ...]
```

**Causa**: O código não está sendo executado OU erro silencioso.

**Solução**:
1. Pressione **Ctrl+Shift+R** (hard refresh)
2. Tente novamente
3. Se persistir, verifique a aba **Network** (F12 → Network)
   - Procure por chamada POST para `/rest/v1/study_sessions`
   - Veja se retorna 201 (sucesso) ou erro

---

### Erro 4: Erro de foreign key (subject_id)

```
❌ Error: insert or update on table "study_sessions" violates foreign key constraint
```

**Causa**: Matéria selecionada não existe na tabela `subjects`.

**Solução**:
1. Tente criar sessão **SEM selecionar matéria**
2. Se funcionar, o problema está na matéria selecionada
3. Crie matérias em `/subjects` primeiro

---

## 🧪 Teste Alternativo: Verificar Chamada HTTP

Se não aparecer logs no console, verifique a chamada HTTP:

1. Com console aberto (F12), vá na aba **Network**
2. Inicie e encerre o timer
3. Procure por uma chamada para: `study_sessions`
4. Clique nela e veja:

**Headers**: Deve ser POST
**Status**:
- ✅ **201 Created** = Sucesso!
- ❌ **400 Bad Request** = Dados inválidos
- ❌ **401 Unauthorized** = Não autenticado
- ❌ **403 Forbidden** = RLS bloqueando

**Response**:
- Se 201: Mostra os dados salvos (id, user_id, duration, etc.)
- Se erro: Mostra mensagem de erro

---

## 🔄 Fluxo Completo de Teste

Execute e marque:

- [ ] 1. Abri `/study` com console aberto
- [ ] 2. Iniciei timer
- [ ] 3. Aguardei 1+ minuto
- [ ] 4. Encerrei timer
- [ ] 5. Vi logs no console? (Sim/Não)
- [ ] 6. Verificado aba Network? (201/Erro)
- [ ] 7. Executei queries SQL para confirmar dados no banco? (Sim/Não)

---

## 📤 Me Envie

### Console ao encerrar timer:
```
[Cole aqui TODOS os logs que aparecem quando você clica em Encerrar]
```

### Network Request (se houver):
```
Status: ___
Response: [Cole o JSON de resposta]
```

### Query SQL após criar sessão:
```sql
SELECT * FROM public.study_sessions
ORDER BY created_at DESC
LIMIT 1;
```

Resultado:
```
[Cole aqui]
```

---

## 🎯 Resumo

**O que estamos testando**:
1. ✅ Timer inicia e conta tempo
2. ✅ Timer salva sessão no banco quando encerra
3. ✅ Dados são inseridos com user_id correto
4. ✅ RLS permite INSERT e SELECT

**Se tudo funcionar**: Os dados estarão no banco e aparecerão em `/reports`!

---

Faça o teste e me envie os resultados! 🚀

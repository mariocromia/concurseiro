# 🧪 TESTE DIRETO DE INSERÇÃO

## O Que É Este Teste

Criei um endpoint que tenta inserir um registro **diretamente no servidor**, sem passar pelo composable. Isso vai nos dizer se o problema é:

- ❓ No código do composable (client-side)
- ❓ Nas políticas RLS do banco
- ❓ Na estrutura da tabela

---

## Como Executar o Teste

### Opção 1: Via Console do Navegador

1. Abra o console (F12)
2. Cole e execute este código:

```javascript
fetch('/api/test-insert-schedule', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
})
.then(res => res.json())
.then(data => {
  console.log('🧪 RESULTADO DO TESTE:', data)
  if (data.success) {
    console.log('✅✅✅ SUCESSO! O problema NÃO é no banco/RLS')
    console.log('📊 Dados inseridos:', data.data)
    console.log('🔍 Conclusão: O problema está no composable/client-side')
  } else {
    console.log('❌❌❌ FALHOU! O problema É no banco/RLS')
    console.log('📊 Erro:', data.error)
    console.log('🔍 Conclusão: Precisa corrigir políticas RLS ou estrutura da tabela')
  }
})
.catch(err => {
  console.error('❌ ERRO na requisição:', err)
})
```

### Opção 2: Via Postman/Insomnia

```
POST http://localhost:3000/api/test-insert-schedule
Content-Type: application/json
Body: {}
```

---

## Resultados Possíveis

### ✅ CENÁRIO A: Teste Retorna SUCCESS

**Significado:**
- Políticas RLS estão OK
- Estrutura da tabela está OK
- Inserção funciona no servidor

**Conclusão:**
O problema está no código client-side (composable/componente)

**Próximo passo:**
Verificar por que o composable não está conseguindo salvar

---

### ❌ CENÁRIO B: Teste Retorna ERROR

**Significado:**
- Problema nas políticas RLS, OU
- Problema na estrutura da tabela, OU
- Campos obrigatórios faltando

**Conclusão:**
O problema está no banco de dados

**Próximo passo:**
Corrigir políticas RLS ou migration

---

### Campos Que o Teste Tenta Inserir:

```javascript
{
  user_id: '[seu_user_id]',
  title: 'TESTE - Inserção Direta',
  scheduled_date: '2025-10-22',
  scheduled_time: '14:00',
  planned_duration: 60,
  study_type: 'conteudo',
  status: 'pending'
}
```

**Nota:** Está usando APENAS campos antigos (scheduled_time, planned_duration, study_type, status) para testar a estrutura original da tabela.

---

## Após Executar o Teste

Por favor, me envie:

1. ✅ Resultado completo do console
2. ✅ Se deu success ou error
3. ✅ Se deu error, qual foi a mensagem

E depois execute no Supabase:

```sql
SELECT * FROM study_schedules
WHERE title LIKE 'TESTE%'
ORDER BY created_at DESC
LIMIT 5;
```

Me envie o resultado também!

---

**🎯 Com este teste, saberemos EXATAMENTE onde está o problema!**

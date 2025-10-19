# Scripts de Desenvolvimento

⚠️ **IMPORTANTE: APENAS PARA DESENVOLVIMENTO**

Este diretório contém scripts de teste e debug que **NÃO** devem ser usados em produção.

## Scripts Disponíveis

### test-create-mindmap.js
- **Propósito:** Testar criação de mapas mentais diretamente no Supabase
- **Uso:** Desenvolvimento/Debug apenas
- **Nota:** Usa dados mockados para testes

### debug-mindmap-api.js
- **Propósito:** Debug da API de mapas mentais
- **Uso:** Desenvolvimento/Debug apenas
- **Nota:** Usa dados mockados para testes

## Observações

1. **Estes scripts NÃO são executados em produção**
2. **NÃO inclua estes scripts no build final**
3. Os dados mockados aqui são apenas para testes locais
4. Em produção, TODA integração é feita via Supabase real

## Como Usar (Desenvolvimento)

```bash
# Execute a partir do diretório prapassar-app/
cd prapassar-app
node scripts/test-create-mindmap.js
```

## Em Produção

✅ Toda a aplicação usa **Supabase real**
✅ Zero flags de simulação
✅ Zero localStorage como banco primário
✅ 100% CRUD via Supabase
✅ Auth via Supabase
✅ Error handling completo

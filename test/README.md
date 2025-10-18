# PraPassar Test Suite

Testes para as funcionalidades implementadas na aplicação PraPassar.

## Estrutura dos Testes

### `instance-lock.test.ts`
Testes para o sistema de prevenção de múltiplas instâncias.

**Cobertura:**
- ✅ Detecção de instâncias existentes via localStorage
- ✅ Sistema de heartbeat para manter instância ativa
- ✅ Limpeza adequada de recursos (cleanup)
- ✅ Comunicação via BroadcastChannel API
- ✅ Casos extremos (localStorage ausente, valores corrompidos, inicialização concorrente)

**Comandos:**
```bash
npm run test instance-lock.test.ts
```

### `logo-component.test.ts`
Testes para o componente Logo corrigido.

**Cobertura:**
- ✅ Aspect ratio correto (12:1) para todos os tamanhos
- ✅ Skeleton loading durante carregamento
- ✅ Lazy loading com atributo `loading="lazy"`
- ✅ Tratamento de erros de carregamento
- ✅ Alternância de tema (dark/light)
- ✅ Otimizações de performance
- ✅ Manipulação de props

**Comandos:**
```bash
npm run test logo-component.test.ts
```

### `landing-header.test.ts`
Testes para o cabeçalho refatorado da landing page.

**Cobertura:**
- ✅ Estrutura de layout (fixed, backdrop-blur, z-index)
- ✅ Elementos de conteúdo (apenas logo e botão "Entrar")
- ✅ Seção do logo (link, hover effects)
- ✅ Botão de login (gradiente, hover, shadow, ícone)
- ✅ Design responsivo (breakpoints, padding, tamanhos)
- ✅ Layout flexbox
- ✅ Acessibilidade (semantic HTML, links)
- ✅ Performance (transições, transforms)
- ✅ Integração com landing page

**Comandos:**
```bash
npm run test landing-header.test.ts
```

## Executando Testes

### Todos os testes
```bash
npm run test
```

### Testes específicos
```bash
# Um arquivo específico
npm run test instance-lock.test.ts

# Com watch mode
npm run test:watch instance-lock.test.ts

# Com coverage
npm run test:coverage
```

### Watch mode (desenvolvimento)
```bash
npm run test:watch
```

### Coverage report
```bash
npm run test:coverage
```

## Requisitos

- Node.js 18+
- Vitest (test runner)
- @vue/test-utils (para testes de componentes Vue)

## Estrutura de Arquivos

```
/test
├── instance-lock.test.ts       # Testes do sistema de instância única
├── logo-component.test.ts      # Testes do componente Logo
├── landing-header.test.ts      # Testes do cabeçalho da landing page
└── README.md                   # Este arquivo
```

## Configuração

Os testes utilizam Vitest como test runner. Configuração em `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

## Convenções

### Naming
- Arquivos de teste: `*.test.ts`
- Describe blocks: Nome do componente/funcionalidade
- It blocks: Comportamento esperado em terceira pessoa

### Estrutura
```typescript
describe('ComponentName', () => {
  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = doSomething(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

## Problemas Resolvidos

### PROBLEMA 0 - Sistema de Múltiplas Instâncias
✅ Implementado composable `useInstanceLock`
✅ Modal de bloqueio `InstanceBlockedModal`
✅ Integração com `app.vue`
✅ Testes completos

### PROBLEMA 1A - Logo Distorcido
✅ Aspect ratio correto (12:1)
✅ Skeleton placeholder
✅ Lazy loading
✅ Object-fit: contain
✅ Error handling
✅ Testes completos

### PROBLEMA 1B - Cabeçalho Landing Page
✅ Componente `LandingHeader` limpo
✅ Apenas logo e botão "Entrar"
✅ Design responsivo
✅ Integração com landing page
✅ Testes completos

## Métricas de Qualidade

- **Cobertura de código:** Alvo 80%+
- **Testes unitários:** 50+ assertions
- **Testes de integração:** 10+ scenarios
- **Edge cases:** 5+ scenarios

## Próximos Passos

1. Adicionar testes E2E com Playwright
2. Aumentar cobertura para 90%+
3. Adicionar testes de performance
4. Implementar visual regression tests

## Contribuindo

Ao adicionar novos recursos:
1. Escreva testes PRIMEIRO (TDD)
2. Mantenha cobertura acima de 80%
3. Teste casos extremos
4. Documente comportamentos esperados

---

**Última Atualização:** 2025-10-18
**Mantido por:** Claude Code

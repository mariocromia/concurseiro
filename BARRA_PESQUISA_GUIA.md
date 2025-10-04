# 🔍 Guia da Barra de Pesquisa Global

## ✨ Características

- ✅ **Barra fixa** abaixo do menu em todas as páginas
- ✅ **Personalizável** por página (placeholder, filtros, resultados)
- ✅ **Responsiva** - adapta para mobile
- ✅ **Busca em tempo real** com debounce
- ✅ **Filtros avançados** (opcional)
- ✅ **Resultados rápidos** dropdown (opcional)
- ✅ **Animações suaves**

---

## 📍 Onde Aparece

A barra aparece em **todas as páginas exceto**:
- `/login`
- `/register`
- `/forgot-password`
- `/confirm`
- `/study` (página de estudo fica sem para não distrair)

---

## 🎨 Configuração por Página

A barra muda automaticamente baseada na rota:

### Dashboard (`/dashboard`)
```
Placeholder: "Buscar matérias, estatísticas..."
Filtros avançados: Não
Resultados rápidos: Não
```

### Matérias (`/materias`)
```
Placeholder: "Buscar matérias..."
Filtros avançados: Sim
Resultados rápidos: Sim
```

### Flashcards (`/flashcards`)
```
Placeholder: "Buscar flashcards..."
Filtros avançados: Sim
Resultados rápidos: Sim
```

### Caderno (`/caderno`)
```
Placeholder: "Buscar anotações..."
Filtros avançados: Não
Resultados rápidos: Sim
```

### Calendário (`/calendar`)
```
Placeholder: "Buscar agendamentos..."
Filtros avançados: Sim
Resultados rápidos: Não
```

---

## 💻 Como Usar em uma Página

### Opção 1: Usar o Composable (Recomendado)

```vue
<script setup>
const { searchQuery, searchResults, isSearching } = useGlobalSearch()

// Os resultados aparecem automaticamente quando usuário buscar
watch(searchResults, (results) => {
  console.log('Resultados da busca:', results)
  // Fazer algo com os resultados
})
</script>
```

### Opção 2: Escutar Eventos

```vue
<script setup>
onMounted(() => {
  window.addEventListener('global-search', (event) => {
    const query = event.detail.query
    console.log('Busca:', query)
    // Implementar lógica de busca
  })

  window.addEventListener('global-search-input', (event) => {
    const query = event.detail.query
    console.log('Input em tempo real:', query)
    // Busca com debounce automático
  })
})
</script>
```

---

## 🎯 Personalizar Busca por Página

### 1. Adicionar Filtros Customizados

Edite `app.vue` e adicione filtros no slot:

```vue
<template #search-filters v-if="route.path === '/materias'">
  <select class="text-sm border-0 bg-transparent">
    <option>Todas</option>
    <option>Favoritas</option>
    <option>Recentes</option>
  </select>
</template>
```

### 2. Adicionar Opções Avançadas

```vue
<template #search-advanced v-if="route.path === '/flashcards'">
  <div class="grid grid-cols-3 gap-4">
    <label class="flex items-center gap-2">
      <input type="checkbox" />
      <span>Apenas revisões</span>
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" />
      <span>Somente difíceis</span>
    </label>
  </div>
</template>
```

### 3. Customizar Resultados Rápidos

```vue
<template #search-results="{ query }" v-if="route.path === '/caderno'">
  <div class="divide-y divide-gray-200">
    <div v-for="note in filteredNotes" :key="note.id"
         class="p-3 hover:bg-gray-50 cursor-pointer">
      <h4 class="font-medium">{{ note.title }}</h4>
      <p class="text-sm text-gray-600">{{ note.preview }}</p>
    </div>
  </div>
</template>
```

---

## 🔧 Configuração Global

Para mudar a configuração de uma página, edite `app.vue`:

```typescript
const configs: Record<string, any> = {
  '/sua-pagina': {
    placeholder: 'Seu placeholder...',
    showAdvanced: true,  // Mostrar botão de filtros
    showQuickResults: true  // Mostrar dropdown de resultados
  }
}
```

---

## 📱 Responsividade

**Desktop:**
- Barra completa com todos os recursos
- Filtros visíveis

**Mobile:**
- Filtros ocultos automaticamente
- Apenas ícone de filtros avançados
- Input ocupa toda largura

---

## 🎨 Estilização

A barra usa classes Tailwind e pode ser customizada em:
```
app/components/GlobalSearchBar.vue
```

### Classes principais:
- `.global-search-bar` - Container principal
- `.search-container` - Input wrapper
- `.search-input` - Campo de texto
- `.quick-results` - Dropdown de resultados

---

## 🚀 Exemplo Completo

### Página de Matérias com Busca

```vue
<template>
  <div>
    <h1>Minhas Matérias</h1>

    <!-- Lista de matérias (filtra automaticamente) -->
    <div v-for="subject in filteredSubjects" :key="subject.id">
      {{ subject.name }}
    </div>
  </div>
</template>

<script setup>
const { searchQuery, performSearch } = useGlobalSearch()
const supabase = useSupabaseClient()
const subjects = ref([])

// Carregar matérias
const loadSubjects = async () => {
  const { data } = await supabase.from('subjects').select('*')
  subjects.value = data || []
}

// Filtrar baseado na busca
const filteredSubjects = computed(() => {
  if (!searchQuery.value) return subjects.value

  return subjects.value.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(loadSubjects)
</script>
```

---

## ⌨️ Atalhos de Teclado (Futuro)

- `Ctrl + K` ou `Cmd + K` - Focar na busca
- `Esc` - Limpar busca e fechar resultados
- `↑` `↓` - Navegar resultados
- `Enter` - Selecionar resultado

---

## 🎯 Próximos Passos

1. **Implementar busca real** em cada página
2. **Adicionar histórico** de buscas recentes
3. **Sugestões** baseadas em IA
4. **Busca global** que procura em todas as seções
5. **Comandos rápidos** (ex: "adicionar matéria")

---

## 📝 Notas Importantes

- A barra é **sticky** (top-16) e fica visível ao rolar
- **Não interfere** com o timer flutuante
- **Persistente** - não some ao mudar de página
- **Personalizável** - cada página define seu comportamento
- **Acessível** - suporte a leitores de tela

---

## 🐛 Debug

Se a barra não aparecer:
1. Verificar se está em página permitida (não login/register)
2. Verificar console para erros do componente
3. Verificar se `showSearchBar` está `true` no `app.vue`

Para ver eventos de busca:
```javascript
window.addEventListener('global-search', (e) => console.log('Busca:', e.detail))
```

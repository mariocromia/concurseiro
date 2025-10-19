<template>
  <div ref="containerRef" class="draggable-container">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import Sortable from 'sortablejs'

interface Props {
  modelValue: any[]
  itemKey: string
  handle?: string
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  animation?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  handle: undefined,
  ghostClass: '',
  chosenClass: '',
  dragClass: '',
  animation: 200,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  'start': [event: any]
  'end': [event: any]
  'change': [event: any]
}>()

const containerRef = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

onMounted(async () => {
  await nextTick()

  if (!containerRef.value) return

  console.log('🎯 Inicializando Sortable...')

  sortableInstance = new Sortable(containerRef.value, {
    handle: props.handle,
    animation: props.animation,
    ghostClass: props.ghostClass || 'sortable-ghost',
    chosenClass: props.chosenClass || 'sortable-chosen',
    dragClass: props.dragClass || 'sortable-drag',
    disabled: props.disabled,

    onStart: (evt) => {
      console.log('🎯 Drag Start')
      emit('start', evt)
    },

    onEnd: (evt) => {
      console.log('✅ Drag End', { from: evt.oldIndex, to: evt.newIndex })

      // Atualizar ordem do array
      const newList = [...props.modelValue]
      const item = newList.splice(evt.oldIndex!, 1)[0]
      newList.splice(evt.newIndex!, 0, item)

      emit('update:modelValue', newList)
      emit('end', evt)
    },

    onChange: (evt) => {
      emit('change', evt)
    }
  })

  console.log('✅ Sortable inicializado!')
})

// Watch para atualizar configurações
watch(() => props.disabled, (newVal) => {
  if (sortableInstance) {
    sortableInstance.option('disabled', newVal)
  }
})

// Cleanup
onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>

<style>
.sortable-ghost {
  opacity: 0.5;
}

.sortable-chosen {
  transform: scale(1.05);
}

.sortable-drag {
  opacity: 0;
}
</style>

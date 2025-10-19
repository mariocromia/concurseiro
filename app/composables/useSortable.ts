import { ref, onMounted, onBeforeUnmount, watch, readonly, type Ref } from 'vue'
import Sortable from 'sortablejs'

export interface UseSortableOptions {
  handle?: string
  animation?: number
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  disabled?: boolean
  onStart?: (evt: any) => void
  onEnd?: (evt: any) => void
  onChange?: (evt: any) => void
}

export function useSortable(
  elementRef: Ref<HTMLElement | null>,
  list: Ref<any[]>,
  options: UseSortableOptions = {}
) {
  let sortableInstance: Sortable | null = null

  const initSortable = () => {
    if (!elementRef.value) return

    console.log('🎯 Inicializando Sortable...')

    sortableInstance = new Sortable(elementRef.value, {
      handle: options.handle,
      animation: options.animation || 200,
      ghostClass: options.ghostClass || 'sortable-ghost',
      chosenClass: options.chosenClass || 'sortable-chosen',
      dragClass: options.dragClass || 'sortable-drag',
      disabled: options.disabled || false,

      onStart: (evt) => {
        console.log('🎯 Drag Start')
        options.onStart?.(evt)
      },

      onEnd: (evt) => {
        console.log('✅ Drag End', { from: evt.oldIndex, to: evt.newIndex })

        // Atualizar ordem do array
        const newList = [...list.value]
        const item = newList.splice(evt.oldIndex!, 1)[0]
        newList.splice(evt.newIndex!, 0, item)
        list.value = newList

        options.onEnd?.(evt)
      },

      onChange: (evt) => {
        options.onChange?.(evt)
      }
    })

    console.log('✅ Sortable inicializado!')
  }

  onMounted(() => {
    initSortable()
  })

  // Watch para atualizar configurações
  watch(() => options.disabled, (newVal) => {
    if (sortableInstance) {
      sortableInstance.option('disabled', newVal || false)
    }
  })

  onBeforeUnmount(() => {
    if (sortableInstance) {
      sortableInstance.destroy()
    }
  })

  return {
    sortableInstance: readonly(ref(sortableInstance))
  }
}

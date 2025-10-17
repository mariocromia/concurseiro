<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-claude-lg shadow-2xl w-full max-w-md">
        <div class="p-4">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">Calculadora</h3>
            <div class="flex items-center gap-2">
              <button
                @click="mode = mode === 'normal' ? 'scientific' : 'normal'"
                class="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-claude-md hover:bg-primary-200 font-medium"
              >
                {{ mode === 'normal' ? '🔬 Científica' : '🔢 Normal' }}
              </button>
              <button
                @click="$emit('close')"
                class="text-gray-500 hover:text-gray-700"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Display -->
          <div class="mb-4 p-4 bg-gray-900 rounded-claude-md">
            <div class="text-right text-gray-400 text-sm min-h-[20px]">{{ expression || '0' }}</div>
            <div class="text-right text-white text-3xl font-mono">{{ display }}</div>
          </div>

          <!-- Normal Calculator Buttons -->
          <div v-if="mode === 'normal'" class="grid grid-cols-4 gap-2">
            <button @click="clear" class="btn-calc bg-red-500 hover:bg-red-600 text-white col-span-2">C</button>
            <button @click="deleteChar" class="btn-calc bg-yellow-500 hover:bg-yellow-600 text-white">⌫</button>
            <button @click="appendOperator('/')" class="btn-calc bg-primary-500 hover:bg-primary-600 text-white">÷</button>

            <button @click="appendNumber('7')" class="btn-calc">7</button>
            <button @click="appendNumber('8')" class="btn-calc">8</button>
            <button @click="appendNumber('9')" class="btn-calc">9</button>
            <button @click="appendOperator('*')" class="btn-calc bg-primary-500 hover:bg-primary-600 text-white">×</button>

            <button @click="appendNumber('4')" class="btn-calc">4</button>
            <button @click="appendNumber('5')" class="btn-calc">5</button>
            <button @click="appendNumber('6')" class="btn-calc">6</button>
            <button @click="appendOperator('-')" class="btn-calc bg-primary-500 hover:bg-primary-600 text-white">−</button>

            <button @click="appendNumber('1')" class="btn-calc">1</button>
            <button @click="appendNumber('2')" class="btn-calc">2</button>
            <button @click="appendNumber('3')" class="btn-calc">3</button>
            <button @click="appendOperator('+')" class="btn-calc bg-primary-500 hover:bg-primary-600 text-white">+</button>

            <button @click="appendNumber('0')" class="btn-calc col-span-2">0</button>
            <button @click="appendNumber('.')" class="btn-calc">.</button>
            <button @click="calculate" class="btn-calc bg-green-500 hover:bg-green-600 text-white">=</button>
          </div>

          <!-- Scientific Calculator Buttons -->
          <div v-else class="grid grid-cols-5 gap-2 text-sm">
            <button @click="clear" class="btn-calc-sci bg-red-500 hover:bg-red-600 text-white col-span-2">C</button>
            <button @click="deleteChar" class="btn-calc-sci bg-yellow-500 hover:bg-yellow-600 text-white">⌫</button>
            <button @click="appendOperator('/')" class="btn-calc-sci bg-primary-500 hover:bg-primary-600 text-white">÷</button>
            <button @click="appendFunction('Math.sqrt(')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">√</button>

            <button @click="appendFunction('Math.sin(')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">sin</button>
            <button @click="appendFunction('Math.cos(')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">cos</button>
            <button @click="appendFunction('Math.tan(')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">tan</button>
            <button @click="appendNumber('7')" class="btn-calc-sci">7</button>
            <button @click="appendNumber('8')" class="btn-calc-sci">8</button>

            <button @click="appendFunction('Math.log(')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">ln</button>
            <button @click="appendFunction('Math.log10(')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">log</button>
            <button @click="appendOperator('**')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">x^y</button>
            <button @click="appendNumber('9')" class="btn-calc-sci">9</button>
            <button @click="appendOperator('*')" class="btn-calc-sci bg-primary-500 hover:bg-primary-600 text-white">×</button>

            <button @click="appendNumber('(')" class="btn-calc-sci bg-gray-600 hover:bg-gray-700 text-white">(</button>
            <button @click="appendNumber(')')" class="btn-calc-sci bg-gray-600 hover:bg-gray-700 text-white">)</button>
            <button @click="appendConstant(Math.PI)" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">π</button>
            <button @click="appendNumber('4')" class="btn-calc-sci">4</button>
            <button @click="appendNumber('5')" class="btn-calc-sci">5</button>

            <button @click="appendConstant(Math.E)" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">e</button>
            <button @click="appendFunction('Math.abs(')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">|x|</button>
            <button @click="appendNumber('!')" class="btn-calc-sci bg-purple-500 hover:bg-purple-600 text-white">n!</button>
            <button @click="appendNumber('6')" class="btn-calc-sci">6</button>
            <button @click="appendOperator('-')" class="btn-calc-sci bg-primary-500 hover:bg-primary-600 text-white">−</button>

            <button @click="appendNumber('1')" class="btn-calc-sci">1</button>
            <button @click="appendNumber('2')" class="btn-calc-sci">2</button>
            <button @click="appendNumber('3')" class="btn-calc-sci">3</button>
            <button @click="appendOperator('+')" class="btn-calc-sci bg-primary-500 hover:bg-primary-600 text-white">+</button>
            <button @click="calculate" class="btn-calc-sci bg-green-500 hover:bg-green-600 text-white row-span-2">=</button>

            <button @click="appendNumber('0')" class="btn-calc-sci col-span-2">0</button>
            <button @click="appendNumber('.')" class="btn-calc-sci">.</button>
            <button @click="toggleSign" class="btn-calc-sci">±</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

interface Emits {
  close: []
}

defineProps<Props>()
defineEmits<Emits>()

const mode = ref<'normal' | 'scientific'>('normal')
const display = ref('0')
const expression = ref('')
const lastResult = ref<number | null>(null)

const appendNumber = (num: string) => {
  if (display.value === '0' && num !== '.') {
    display.value = num
  } else {
    display.value += num
  }
  expression.value += num
}

const appendOperator = (op: string) => {
  if (expression.value && !isNaN(Number(display.value.slice(-1)))) {
    expression.value += op
    display.value += op
  }
}

const appendFunction = (func: string) => {
  expression.value += func
  display.value = func.replace('Math.', '')
}

const appendConstant = (value: number) => {
  const valueStr = value.toString()
  expression.value += valueStr
  display.value = valueStr
}

const toggleSign = () => {
  if (display.value.startsWith('-')) {
    display.value = display.value.slice(1)
    expression.value = expression.value.slice(1)
  } else {
    display.value = '-' + display.value
    expression.value = '-' + expression.value
  }
}

const deleteChar = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
    expression.value = expression.value.slice(0, -1)
  } else {
    clear()
  }
}

const clear = () => {
  display.value = '0'
  expression.value = ''
  lastResult.value = null
}

const factorial = (n: number): number => {
  if (n === 0 || n === 1) return 1
  return n * factorial(n - 1)
}

const calculate = () => {
  try {
    // Handle factorial
    let expr = expression.value.replace(/(\d+)!/g, (match, num) => {
      return factorial(parseInt(num)).toString()
    })

    // Evaluate expression
    const result = eval(expr)
    display.value = result.toString()
    expression.value = ''
    lastResult.value = result
  } catch (error) {
    display.value = 'Erro'
    expression.value = ''
  }
}
</script>

<style scoped>
.btn-calc {
  @apply px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold text-lg transition-colors;
}

.btn-calc-sci {
  @apply px-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors;
}
</style>

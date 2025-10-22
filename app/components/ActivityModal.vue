<script setup lang="ts">
import type { ScheduleActivity, ScheduleType, CreateActivityPayload } from '~/composables/useStudySchedule'

interface Subject {
  id: string
  name: string
  color: string
  icon: string
}

const props = defineProps<{
  show: boolean
  activity?: ScheduleActivity | null
  initialDate?: string
  initialTime?: string
}>()

const emit = defineEmits<{
  'close': []
  'save': [payload: CreateActivityPayload]
  'update': [id: string, updates: Partial<CreateActivityPayload>]
  'delete': [id: string]
  'toggle-completion': [id: string]
}>()

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { colorPalette, calculateEndTime, formatDuration, checkTimeConflicts } = useStudySchedule()

// Estado do formulário
const formData = ref({
  type: 'study' as ScheduleType,
  subject_id: null as string | null,
  title: '',
  description: '',
  scheduled_date: '',
  start_time: '',
  duration: 60,
  color: ''
})

const subjects = ref<Subject[]>([])
const loadingSubjects = ref(false)
const savingActivity = ref(false)
const showNewSubjectForm = ref(false)
const conflicts = ref<ScheduleActivity[]>([])
const currentStep = ref(1) // 1: tipo, 2: detalhes, 3: confirmação

// Novo formulário de matéria
const newSubject = ref({
  name: '',
  color: '#8B5CF6'
})

// Ícone padrão para todas as matérias (sempre o mesmo)
const defaultIcon = '📚'

// Durações pré-definidas (em minutos)
const quickDurations = [
  { label: '30min', value: 30 },
  { label: '1h', value: 60 },
  { label: '1h 30min', value: 90 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
  { label: '4h', value: 240 }
]

// Carrega matérias do usuário
const loadSubjects = async () => {
  loadingSubjects.value = true
  try {
    // Garante que temos o usuário autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user?.id) {
      console.error('❌ Usuário não autenticado ao carregar matérias')
      return
    }

    console.log('🔍 Carregando matérias do usuário:', session.user.id)

    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, color, icon')
      .eq('user_id', session.user.id)
      .order('name')

    if (error) throw error

    subjects.value = data || []
    console.log(`✅ ${subjects.value.length} matérias carregadas com sucesso`)
  } catch (err) {
    console.error('❌ Erro ao carregar matérias:', err)
    subjects.value = []
  } finally {
    loadingSubjects.value = false
  }
}

// Cria nova matéria
const createNewSubject = async () => {
  if (!newSubject.value.name.trim()) {
    alert('Por favor, preencha o nome da matéria')
    return
  }

  try {
    // Garante que temos o usuário autenticado
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user?.id) {
      alert('Você precisa estar autenticado para criar uma matéria')
      return
    }

    console.log('➕ Criando nova matéria:', newSubject.value.name)

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: session.user.id,
        name: newSubject.value.name.trim(),
        color: newSubject.value.color,
        icon: defaultIcon // Sempre usa o ícone padrão
      })
      .select('id, name, color, icon')
      .single()

    if (error) throw error

    console.log('✅ Matéria criada com sucesso:', data)

    // Adiciona à lista e seleciona automaticamente
    subjects.value.push(data)
    formData.value.subject_id = data.id
    formData.value.color = data.color

    // Limpa o formulário de nova matéria
    newSubject.value = { name: '', color: '#8B5CF6' }
    showNewSubjectForm.value = false

    console.log('✨ Matéria selecionada automaticamente')
  } catch (err: any) {
    console.error('❌ Erro ao criar matéria:', err)
    alert(`Erro ao criar matéria: ${err.message || 'Tente novamente'}`)
  }
}

// Calcula horário de término
const endTime = computed(() => {
  if (!formData.value.start_time || !formData.value.duration) return ''
  return calculateEndTime(formData.value.start_time, formData.value.duration)
})

// Duração formatada
const durationText = computed(() => formatDuration(formData.value.duration))

// Verifica conflitos
const checkConflicts = () => {
  if (!formData.value.scheduled_date || !formData.value.start_time || !formData.value.duration) {
    conflicts.value = []
    return
  }

  conflicts.value = checkTimeConflicts(
    formData.value.scheduled_date,
    formData.value.start_time,
    formData.value.duration,
    props.activity?.id
  )
}

// Atualiza cor quando muda tipo ou matéria
watch(() => formData.value.type, (newType) => {
  if (newType === 'event') {
    formData.value.subject_id = null
    if (!formData.value.color) {
      formData.value.color = '#8B5CF6'
    }
  }
})

watch(() => formData.value.subject_id, (subjectId) => {
  if (subjectId && formData.value.type === 'study') {
    const subject = subjects.value.find(s => s.id === subjectId)
    if (subject) {
      formData.value.color = subject.color
      if (!formData.value.title) {
        formData.value.title = subject.name
      }
    }
  }
})

// Observa mudanças para verificar conflitos
watch(
  () => [formData.value.scheduled_date, formData.value.start_time, formData.value.duration],
  checkConflicts,
  { deep: true }
)

// Inicializa formulário quando abre
watch(() => props.show, (show) => {
  if (show) {
    loadSubjects()
    currentStep.value = 1

    if (props.activity) {
      // Modo edição
      formData.value = {
        type: props.activity.type || 'study',
        subject_id: props.activity.subject_id || null,
        title: props.activity.title,
        description: props.activity.description || '',
        scheduled_date: props.activity.scheduled_date,
        start_time: props.activity.start_time,
        duration: props.activity.duration,
        color: props.activity.color || ''
      }
      currentStep.value = 2
    } else {
      // Modo criação
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, '0')

      formData.value = {
        type: 'study',
        subject_id: null,
        title: '',
        description: '',
        scheduled_date: props.initialDate || now.toISOString().split('T')[0],
        start_time: props.initialTime || `${hours}:${minutes}`,
        duration: 60,
        color: ''
      }
    }

    checkConflicts()
  }
})

// Salva ou atualiza atividade
const handleSave = async () => {
  console.log('🎬🎬🎬 === INÍCIO: handleSave (ActivityModal) === 🎬🎬🎬')
  console.log('📋 Estado do formulário:', JSON.stringify(formData.value, null, 2))

  // VALIDAÇÃO 1: Título
  console.log('✔️ VALIDAÇÃO 1: Verificando título...')
  if (!formData.value.title.trim()) {
    console.warn('❌ Validação falhou: título vazio')
    alert('Por favor, preencha o título da atividade')
    return
  }
  console.log('✅ Título OK:', formData.value.title)

  // VALIDAÇÃO 2: Matéria (apenas para estudos)
  console.log('✔️ VALIDAÇÃO 2: Verificando matéria...')
  if (formData.value.type === 'study' && !formData.value.subject_id) {
    console.warn('❌ Validação falhou: estudo sem matéria')
    alert('Por favor, selecione uma matéria para atividades de estudo')
    return
  }
  console.log('✅ Matéria OK:', formData.value.subject_id || 'N/A (evento)')

  // VALIDAÇÃO 3: Data e horário
  console.log('✔️ VALIDAÇÃO 3: Verificando data e horário...')
  if (!formData.value.scheduled_date || !formData.value.start_time) {
    console.warn('❌ Validação falhou: data ou horário vazio')
    alert('Por favor, preencha data e horário')
    return
  }
  console.log('✅ Data OK:', formData.value.scheduled_date)
  console.log('✅ Horário OK:', formData.value.start_time)

  // VALIDAÇÃO 4: Duração
  console.log('✔️ VALIDAÇÃO 4: Verificando duração...')
  if (formData.value.duration <= 0) {
    console.warn('❌ Validação falhou: duração inválida')
    alert('A duração deve ser maior que zero')
    return
  }
  console.log('✅ Duração OK:', formData.value.duration, 'minutos')

  // Prepara o payload
  console.log('📦 Preparando payload...')
  const payload: CreateActivityPayload = {
    type: formData.value.type,
    subject_id: formData.value.type === 'study' ? formData.value.subject_id : null,
    title: formData.value.title.trim(),
    description: formData.value.description.trim() || null,
    scheduled_date: formData.value.scheduled_date,
    start_time: formData.value.start_time,
    duration: formData.value.duration,
    color: formData.value.color || null
  }

  console.log('✅✅✅ Payload final preparado:', JSON.stringify(payload, null, 2))

  // Ativa loading
  console.log('⏳ Ativando loading...')
  savingActivity.value = true

  try {
    if (props.activity?.id) {
      console.log('📝 Modo: ATUALIZAÇÃO (update)')
      console.log('🆔 ID da atividade:', props.activity.id)
      console.log('🚀 Emitindo evento "update"...')
      emit('update', props.activity.id, payload)
      console.log('✅ Evento "update" emitido')
    } else {
      console.log('➕ Modo: CRIAÇÃO (save)')
      console.log('🚀 Emitindo evento "save"...')
      emit('save', payload)
      console.log('✅ Evento "save" emitido')
      console.log('⏳ Aguardando componente pai processar...')
    }

    console.log('🏁 === FIM: handleSave (ActivityModal) ===')
  } catch (err: any) {
    console.error('❌❌❌ ERRO CAPTURADO em handleSave ❌❌❌')
    console.error('Mensagem:', err.message)
    console.error('Stack:', err.stack)
    alert(`Erro ao salvar: ${err.message || 'Erro desconhecido'}`)
  } finally {
    // O loading será desativado pelo componente pai após a operação
    console.log('⏰ Agendando desativação do loading em 500ms...')
    setTimeout(() => {
      savingActivity.value = false
      console.log('🔓 Loading desativado')
    }, 500)
  }
}

const handleDelete = () => {
  if (!props.activity?.id) return
  if (confirm('Tem certeza que deseja excluir esta atividade?')) {
    emit('delete', props.activity.id)
  }
}

const handleToggleCompletion = () => {
  if (!props.activity?.id) return
  emit('toggle-completion', props.activity.id)
}

const closeModal = () => {
  showNewSubjectForm.value = false
  currentStep.value = 1
  emit('close')
}

const nextStep = () => {
  if (currentStep.value === 1) {
    if (formData.value.type === 'study' && !formData.value.subject_id && !showNewSubjectForm.value) {
      alert('Por favor, selecione uma matéria ou crie uma nova')
      return
    }
  }
  currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <Transition name="modal-slide">
          <div
            v-if="show"
            class="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            @click.stop
          >
            <!-- Header com gradiente -->
            <div class="relative bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600 p-6">
              <div class="flex items-center justify-between text-white">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-2xl font-bold">
                      {{ activity ? 'Editar Atividade' : 'Nova Atividade' }}
                    </h2>
                    <p class="text-primary-100 text-sm">Organize seu tempo de estudo</p>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Progress steps (apenas em modo criação) -->
              <div v-if="!activity" class="mt-6 flex items-center justify-center gap-2">
                <div
                  v-for="step in 2"
                  :key="step"
                  class="flex items-center"
                >
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                      currentStep >= step
                        ? 'bg-white text-primary-600 scale-110'
                        : 'bg-white/20 text-white/60'
                    ]"
                  >
                    {{ step }}
                  </div>
                  <div
                    v-if="step < 2"
                    :class="[
                      'w-16 h-1 mx-2 rounded transition-all',
                      currentStep > step ? 'bg-white' : 'bg-white/20'
                    ]"
                  />
                </div>
              </div>
            </div>

            <!-- Body com scroll -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- STEP 1: Tipo e Matéria -->
              <div v-show="currentStep === 1 && !activity" class="space-y-6 animate-fade-in">
                <!-- Tipo de Atividade -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    O que você vai fazer?
                  </label>
                  <div class="grid grid-cols-2 gap-4">
                    <button
                      @click="formData.type = 'study'"
                      :class="[
                        'group relative p-6 rounded-xl border-2 transition-all duration-200',
                        formData.type === 'study'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
                      ]"
                    >
                      <div class="mb-3">
                        <svg class="w-12 h-12 mx-auto text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div class="font-bold text-gray-900 dark:text-white mb-1">Estudar</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">Vincular a uma matéria</div>
                      <div
                        v-if="formData.type === 'study'"
                        class="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                      >
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </button>

                    <button
                      @click="formData.type = 'event'"
                      :class="[
                        'group relative p-6 rounded-xl border-2 transition-all duration-200',
                        formData.type === 'event'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg scale-105'
                          : 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
                      ]"
                    >
                      <div class="mb-3">
                        <svg class="w-12 h-12 mx-auto text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="font-bold text-gray-900 dark:text-white mb-1">Evento</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">Prova, compromisso, etc</div>
                      <div
                        v-if="formData.type === 'event'"
                        class="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                      >
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Matéria (se tipo = study) -->
                <div v-if="formData.type === 'study'" class="space-y-4">
                  <div v-if="!showNewSubjectForm">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Selecione a matéria
                    </label>

                    <!-- Loading state -->
                    <div v-if="loadingSubjects" class="flex items-center justify-center py-12">
                      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>

                    <!-- Empty state -->
                    <div v-else-if="subjects.length === 0" class="text-center py-8 px-4 bg-gray-50 dark:bg-dark-900/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-dark-600">
                      <svg class="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p class="text-gray-700 dark:text-gray-300 font-medium mb-1">Nenhuma matéria cadastrada</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Crie sua primeira matéria para começar</p>
                    </div>

                    <!-- Subjects list - COMPACTO -->
                    <div v-else class="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2">
                      <button
                        v-for="subject in subjects"
                        :key="subject.id"
                        @click="formData.subject_id = subject.id"
                        :class="[
                          'relative p-2.5 rounded-lg border-2 transition-all text-left',
                          formData.subject_id === subject.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                            : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 hover:shadow-sm'
                        ]"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="w-7 h-7 rounded-md flex items-center justify-center text-base flex-shrink-0"
                            :style="{ backgroundColor: subject.color + '20' }"
                          >
                            {{ subject.icon }}
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {{ subject.name }}
                            </div>
                          </div>
                        </div>
                        <div
                          v-if="formData.subject_id === subject.id"
                          class="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center"
                        >
                          <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </div>
                      </button>
                    </div>

                    <button
                      @click="showNewSubjectForm = true"
                      :disabled="loadingSubjects"
                      class="mt-4 w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Criar Nova Matéria
                    </button>
                  </div>

                  <!-- Form de nova matéria - SIMPLIFICADO -->
                  <div v-else class="bg-gray-50 dark:bg-dark-900/50 rounded-xl p-5 space-y-3 border-2 border-primary-200 dark:border-primary-800">
                    <div class="flex items-center justify-between">
                      <h4 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="text-xl">{{ defaultIcon }}</span>
                        <span>Nova Matéria</span>
                      </h4>
                      <button
                        @click="showNewSubjectForm = false"
                        class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nome da matéria
                      </label>
                      <input
                        v-model="newSubject.name"
                        type="text"
                        placeholder="Ex: Direito Constitucional"
                        class="w-full px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Escolha uma cor
                      </label>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="color in colorPalette"
                          :key="color"
                          @click="newSubject.color = color"
                          class="w-9 h-9 rounded-lg transition-all flex items-center justify-center"
                          :class="newSubject.color === color ? 'ring-3 ring-primary-500 scale-105' : 'hover:scale-105 opacity-80 hover:opacity-100'"
                          :style="{ backgroundColor: color }"
                        >
                          <svg v-if="newSubject.color === color" class="w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button
                      @click="createNewSubject"
                      :disabled="!newSubject.name.trim()"
                      class="w-full px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Criar Matéria
                    </button>
                  </div>
                </div>

                <!-- Título (se tipo = event) -->
                <div v-if="formData.type === 'event'">
                  <label class="block text-sm font-bold text-gray-700 dark:text-white mb-3">
                    Nome do evento
                  </label>
                  <input
                    v-model="formData.title"
                    type="text"
                    placeholder="Ex: Prova de Matemática, Entrega de trabalho..."
                    class="w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>

              <!-- STEP 2: Detalhes -->
              <div v-show="currentStep === 2 || activity" class="space-y-6 animate-fade-in">
                <!-- Título (se tipo = study) -->
                <div v-if="formData.type === 'study' || activity">
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Título do estudo
                  </label>
                  <input
                    v-model="formData.title"
                    type="text"
                    placeholder="Ex: Revisão de Princípios Fundamentais"
                    class="w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-lg text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Data e Horário -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <svg class="w-5 h-5 text-gray-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Data
                    </label>
                    <input
                      v-model="formData.scheduled_date"
                      type="date"
                      class="w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <svg class="w-5 h-5 text-gray-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Horário
                    </label>
                    <input
                      v-model="formData.start_time"
                      type="time"
                      class="w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:invert"
                    />
                  </div>
                </div>

                <!-- Duração com botões rápidos -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Duração
                  </label>

                  <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    <button
                      v-for="quick in quickDurations"
                      :key="quick.value"
                      @click="formData.duration = quick.value"
                      :class="[
                        'px-3 py-2 rounded-lg font-medium transition-all',
                        formData.duration === quick.value
                          ? 'bg-primary-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/20'
                      ]"
                    >
                      {{ quick.label }}
                    </button>
                  </div>

                  <div class="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {{ durationText }}
                      </span>
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        Término: <span class="font-bold text-primary-600 dark:text-primary-400">{{ endTime }}</span>
                      </span>
                    </div>
                    <input
                      v-model.number="formData.duration"
                      type="range"
                      min="15"
                      max="480"
                      step="15"
                      class="w-full h-2 bg-gray-200 dark:bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>15min</span>
                      <span>8h</span>
                    </div>
                  </div>
                </div>

                <!-- Alerta de conflitos -->
                <div v-if="conflicts.length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4">
                  <div class="flex items-start gap-3">
                    <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div class="flex-1">
                      <p class="font-bold text-yellow-800 dark:text-yellow-400 mb-1">
                        ⚠️ Conflito de horário
                      </p>
                      <p class="text-sm text-yellow-700 dark:text-yellow-500">
                        Já existem {{ conflicts.length }} atividade(s) neste horário
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Descrição -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descrição (opcional)
                  </label>
                  <textarea
                    v-model="formData.description"
                    rows="3"
                    placeholder="Adicione detalhes sobre o que será estudado..."
                    class="w-full px-4 py-3 bg-white dark:bg-dark-700 border-2 border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none text-gray-900 dark:text-white"
                  />
                </div>

                <!-- Cor personalizada -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Cor do agendamento
                  </label>
                  <div class="flex flex-wrap gap-3">
                    <button
                      v-for="color in colorPalette"
                      :key="color"
                      @click="formData.color = color"
                      class="group relative w-12 h-12 rounded-xl transition-all hover:scale-110"
                      :class="formData.color === color ? 'ring-4 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : ''"
                      :style="{ backgroundColor: color }"
                    >
                      <svg
                        v-if="formData.color === color"
                        class="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-lg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer com ações -->
            <div class="border-t border-gray-200 dark:border-dark-700 p-6 bg-gray-50 dark:bg-dark-900/50">
              <div class="flex items-center justify-between gap-4">
                <!-- Ações da esquerda -->
                <div class="flex gap-2">
                  <button
                    v-if="activity"
                    @click="handleToggleCompletion"
                    :class="[
                      'px-4 py-2.5 rounded-lg transition font-medium shadow-md flex items-center gap-2',
                      activity.is_completed
                        ? 'bg-green-600 text-white hover:bg-green-700 ring-2 ring-green-400 ring-offset-2 dark:ring-offset-dark-900'
                        : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
                    ]"
                  >
                    <svg v-if="activity.is_completed" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ activity.is_completed ? '✓ Concluída' : 'Marcar como Concluída' }}
                  </button>

                  <button
                    v-if="activity"
                    @click="handleDelete"
                    class="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md flex items-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Excluir
                  </button>
                </div>

                <!-- Ações da direita -->
                <div class="flex gap-3">
                  <button
                    v-if="currentStep > 1 && !activity"
                    @click="prevStep"
                    class="px-6 py-2.5 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition font-medium"
                  >
                    Voltar
                  </button>

                  <button
                    v-if="currentStep === 1 && !activity"
                    @click="nextStep"
                    class="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition font-bold shadow-lg flex items-center gap-2"
                  >
                    Continuar
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  <button
                    v-else
                    @click="handleSave"
                    :disabled="savingActivity"
                    class="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 transition font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="!savingActivity" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ savingActivity ? 'Salvando...' : (activity ? 'Salvar Alterações' : 'Criar Atividade') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Animações de modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-enter-from {
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
}

.modal-slide-leave-to {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* Animação de fade in para steps */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

/* Scrollbar customizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4a5568;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>

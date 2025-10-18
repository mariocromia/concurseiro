/**
 * useInstanceLock - Composable para prevenir múltiplas instâncias da aplicação
 *
 * Utiliza localStorage e BroadcastChannel API para detectar e bloquear
 * múltiplas janelas/abas abertas simultaneamente.
 *
 * @returns {Object} Estado e métodos de controle de instância
 */

export const useInstanceLock = () => {
  const INSTANCE_KEY = 'prapassar_instance_id'
  const HEARTBEAT_KEY = 'prapassar_heartbeat'
  const HEARTBEAT_INTERVAL = 2000 // 2 segundos
  const HEARTBEAT_TIMEOUT = 5000 // 5 segundos

  const isBlocked = ref(false)
  const instanceId = ref<string | null>(null)
  const channel = ref<BroadcastChannel | null>(null)
  const heartbeatTimer = ref<NodeJS.Timeout | null>(null)

  /**
   * Gera um ID único para esta instância
   */
  const generateInstanceId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }

  /**
   * Verifica se existe outra instância ativa
   */
  const checkExistingInstance = (): boolean => {
    const existingId = localStorage.getItem(INSTANCE_KEY)
    const lastHeartbeat = localStorage.getItem(HEARTBEAT_KEY)

    if (!existingId || !lastHeartbeat) {
      return false
    }

    const timeSinceHeartbeat = Date.now() - parseInt(lastHeartbeat)
    return timeSinceHeartbeat < HEARTBEAT_TIMEOUT
  }

  /**
   * Atualiza o heartbeat no localStorage
   */
  const updateHeartbeat = () => {
    if (!isBlocked.value && instanceId.value) {
      localStorage.setItem(HEARTBEAT_KEY, Date.now().toString())
    }
  }

  /**
   * Inicia o heartbeat periódico
   */
  const startHeartbeat = () => {
    updateHeartbeat()
    heartbeatTimer.value = setInterval(updateHeartbeat, HEARTBEAT_INTERVAL)
  }

  /**
   * Para o heartbeat
   */
  const stopHeartbeat = () => {
    if (heartbeatTimer.value) {
      clearInterval(heartbeatTimer.value)
      heartbeatTimer.value = null
    }
  }

  /**
   * Inicializa o sistema de bloqueio de instância
   */
  const initialize = () => {
    // Verifica se já existe uma instância ativa
    if (checkExistingInstance()) {
      isBlocked.value = true
      return
    }

    // Cria ID para esta instância
    instanceId.value = generateInstanceId()
    localStorage.setItem(INSTANCE_KEY, instanceId.value)

    // Inicia heartbeat
    startHeartbeat()

    // Cria canal de broadcast para comunicação entre abas
    try {
      channel.value = new BroadcastChannel('prapassar_instance_channel')

      // Escuta mensagens de outras instâncias
      channel.value.onmessage = (event) => {
        if (event.data.type === 'instance_check') {
          // Responde que esta instância está ativa
          channel.value?.postMessage({
            type: 'instance_alive',
            instanceId: instanceId.value
          })
        } else if (event.data.type === 'instance_alive' && event.data.instanceId !== instanceId.value) {
          // Outra instância está ativa e é mais antiga
          const currentId = localStorage.getItem(INSTANCE_KEY)
          if (currentId !== instanceId.value) {
            isBlocked.value = true
            cleanup()
          }
        }
      }

      // Envia mensagem para verificar outras instâncias
      channel.value.postMessage({ type: 'instance_check' })
    } catch (error) {
      console.warn('BroadcastChannel não suportado, usando apenas localStorage')
    }

    // Monitora mudanças no localStorage (fallback para navegadores sem BroadcastChannel)
    window.addEventListener('storage', handleStorageChange)

    // Limpa ao fechar a janela
    window.addEventListener('beforeunload', cleanup)
  }

  /**
   * Manipula mudanças no localStorage
   */
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === INSTANCE_KEY) {
      const currentId = localStorage.getItem(INSTANCE_KEY)
      if (currentId !== instanceId.value) {
        isBlocked.value = true
        cleanup()
      }
    }
  }

  /**
   * Limpa recursos e libera a instância
   */
  const cleanup = () => {
    stopHeartbeat()

    // Remove apenas se for a instância atual
    const currentId = localStorage.getItem(INSTANCE_KEY)
    if (currentId === instanceId.value) {
      localStorage.removeItem(INSTANCE_KEY)
      localStorage.removeItem(HEARTBEAT_KEY)
    }

    if (channel.value) {
      channel.value.close()
      channel.value = null
    }

    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('beforeunload', cleanup)
  }

  /**
   * Força a liberação da instância (para debug)
   */
  const forceRelease = () => {
    localStorage.removeItem(INSTANCE_KEY)
    localStorage.removeItem(HEARTBEAT_KEY)
    isBlocked.value = false
  }

  // Auto-inicializa no cliente
  if (process.client) {
    onMounted(() => {
      initialize()
    })

    onUnmounted(() => {
      cleanup()
    })
  }

  return {
    isBlocked: readonly(isBlocked),
    instanceId: readonly(instanceId),
    initialize,
    cleanup,
    forceRelease // Apenas para debug/desenvolvimento
  }
}

// Serviço de integração com Asaas API
// Documentação: https://docs.asaas.com

interface AsaasConfig {
  apiKey: string
  baseUrl: string
}

interface AsaasCustomer {
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
  mobilePhone?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  postalCode?: string
  externalReference?: string
  notificationDisabled?: boolean
}

interface AsaasSubscription {
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED' | 'PIX'
  value: number
  nextDueDate: string
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  description?: string
  externalReference?: string
  maxPayments?: number
  split?: any[]
}

interface AsaasPayment {
  customer: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED' | 'PIX'
  value: number
  dueDate: string
  description?: string
  externalReference?: string
  installmentCount?: number
  installmentValue?: number
  discount?: {
    value?: number
    dueDateLimitDays?: number
    type?: 'FIXED' | 'PERCENTAGE'
  }
  interest?: {
    value: number
  }
  fine?: {
    value: number
  }
  postalService?: boolean
  split?: any[]
  callback?: {
    successUrl?: string
    autoRedirect?: boolean
  }
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode: string
    addressNumber: string
    addressComplement?: string
    phone: string
    mobilePhone?: string
  }
  remoteIp?: string
}

class AsaasService {
  private config: AsaasConfig

  constructor() {
    const runtimeConfig = useRuntimeConfig()
    this.config = {
      apiKey: runtimeConfig.asaasApiKey || '',
      baseUrl: runtimeConfig.asaasBaseUrl || 'https://api.asaas.com/v3'
    }
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      params?: Record<string, any>
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options

    let url = `${this.config.baseUrl}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'access_token': this.config.apiKey
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Asaas API Error: ${response.status} - ${JSON.stringify(errorData)}`
      )
    }

    return response.json()
  }

  // Clientes
  async createCustomer(data: AsaasCustomer): Promise<any> {
    return this.request('/customers', {
      method: 'POST',
      body: data
    })
  }

  async getCustomer(customerId: string): Promise<any> {
    return this.request(`/customers/${customerId}`)
  }

  async updateCustomer(customerId: string, data: Partial<AsaasCustomer>): Promise<any> {
    return this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: data
    })
  }

  async listCustomers(params?: { offset?: number; limit?: number; email?: string; cpfCnpj?: string }): Promise<any> {
    return this.request('/customers', { params })
  }

  // Assinaturas
  async createSubscription(data: AsaasSubscription): Promise<any> {
    return this.request('/subscriptions', {
      method: 'POST',
      body: data
    })
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    return this.request(`/subscriptions/${subscriptionId}`)
  }

  async updateSubscription(subscriptionId: string, data: Partial<AsaasSubscription>): Promise<any> {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteSubscription(subscriptionId: string): Promise<any> {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE'
    })
  }

  async listSubscriptions(params?: {
    offset?: number
    limit?: number
    customer?: string
    status?: string
  }): Promise<any> {
    return this.request('/subscriptions', { params })
  }

  async getSubscriptionPayments(subscriptionId: string): Promise<any> {
    return this.request(`/subscriptions/${subscriptionId}/payments`)
  }

  // Pagamentos
  async createPayment(data: AsaasPayment): Promise<any> {
    return this.request('/payments', {
      method: 'POST',
      body: data
    })
  }

  async getPayment(paymentId: string): Promise<any> {
    return this.request(`/payments/${paymentId}`)
  }

  async updatePayment(paymentId: string, data: Partial<AsaasPayment>): Promise<any> {
    return this.request(`/payments/${paymentId}`, {
      method: 'PUT',
      body: data
    })
  }

  async deletePayment(paymentId: string): Promise<any> {
    return this.request(`/payments/${paymentId}`, {
      method: 'DELETE'
    })
  }

  async listPayments(params?: {
    offset?: number
    limit?: number
    customer?: string
    subscription?: string
    status?: string
    dateCreatedGe?: string
    dateCreatedLe?: string
  }): Promise<any> {
    return this.request('/payments', { params })
  }

  async refundPayment(paymentId: string, value?: number, description?: string): Promise<any> {
    return this.request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: { value, description }
    })
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    return this.request(`/payments/${paymentId}/status`)
  }

  async getPixQrCode(paymentId: string): Promise<any> {
    return this.request(`/payments/${paymentId}/pixQrCode`)
  }

  async confirmPaymentInCash(paymentId: string, paymentDate?: string, value?: number): Promise<any> {
    return this.request(`/payments/${paymentId}/receiveInCash`, {
      method: 'POST',
      body: { paymentDate, value }
    })
  }

  async restorePayment(paymentId: string): Promise<any> {
    return this.request(`/payments/${paymentId}/restore`, {
      method: 'POST'
    })
  }

  // Webhooks
  async listWebhooks(): Promise<any> {
    return this.request('/webhooks')
  }

  async createWebhook(data: {
    name: string
    url: string
    email: string
    events: string[]
    enabled?: boolean
  }): Promise<any> {
    return this.request('/webhooks', {
      method: 'POST',
      body: data
    })
  }

  async updateWebhook(webhookId: string, data: {
    name?: string
    url?: string
    email?: string
    events?: string[]
    enabled?: boolean
  }): Promise<any> {
    return this.request(`/webhooks/${webhookId}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteWebhook(webhookId: string): Promise<any> {
    return this.request(`/webhooks/${webhookId}`, {
      method: 'DELETE'
    })
  }

  // Notificações
  async getNotificationHistory(paymentId: string): Promise<any> {
    return this.request(`/payments/${paymentId}/notifications`)
  }

  // Utilities
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementar verificação de assinatura do webhook
    // Usar crypto para validar HMAC
    return true // Placeholder
  }
}

export const useAsaas = () => new AsaasService()
export default AsaasService

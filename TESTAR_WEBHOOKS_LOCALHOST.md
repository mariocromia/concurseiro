# 🔧 Como Testar Webhooks do Asaas Localmente

## ❌ Por que não posso usar IP local?

O Asaas precisa enviar dados para sua aplicação via internet, mas:
- `http://localhost:3000` só existe no seu computador
- `http://192.168.x.x` é rede privada (não acessível pela internet)
- Seu roteador bloqueia conexões externas

## ✅ 3 Soluções para Testar Localmente

---

## 🎯 Opção 1: ngrok (MAIS FÁCIL) ⭐

**O que é:** Cria um túnel seguro entre internet e seu localhost

### Passo a Passo:

#### 1. Baixar o ngrok
- Acesse: https://ngrok.com/download
- Baixe para Windows
- Ou use: `npm install -g ngrok`

#### 2. Criar conta (grátis)
- Crie conta em: https://dashboard.ngrok.com/signup
- Copie seu auth token

#### 3. Autenticar
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

#### 4. Iniciar sua aplicação
```bash
npm run dev
# Aplicação rodando em http://localhost:3000
```

#### 5. Expor para internet
Em outro terminal:
```bash
ngrok http 3000
```

#### 6. Copiar URL pública
Você verá algo assim:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

#### 7. Configurar no Asaas
- Webhook URL: `https://abc123.ngrok-free.app/api/webhooks/asaas`
- Eventos: Todos PAYMENT_*
- Salvar

#### 8. Testar!
- Crie um pagamento de teste no Asaas
- O webhook chegará no seu localhost
- Veja os logs no terminal do ngrok

### ✅ Prós:
- Muito fácil
- Não precisa configurar nada
- HTTPS grátis
- Ver todos os requests

### ❌ Contras:
- URL muda toda vez que reinicia (plano grátis)
- Limite de requests (plano grátis)

---

## 🎯 Opção 2: Cloudflare Tunnel (GRÁTIS PERMANENTE)

**O que é:** Túnel permanente da Cloudflare

### Passo a Passo:

#### 1. Instalar cloudflared
Windows:
- Baixe: https://github.com/cloudflare/cloudflared/releases
- Ou use: `winget install cloudflare.cloudflared`

#### 2. Login
```bash
cloudflared tunnel login
```

#### 3. Criar túnel
```bash
cloudflared tunnel create concurseiro
```

#### 4. Configurar túnel
Crie arquivo `config.yml`:
```yaml
tunnel: concurseiro
credentials-file: C:\Users\SEU_USUARIO\.cloudflared\UUID.json

ingress:
  - hostname: concurseiro.seu-dominio.com
    service: http://localhost:3000
  - service: http_status:404
```

#### 5. Iniciar túnel
```bash
cloudflared tunnel run concurseiro
```

#### 6. Configurar DNS
- Adicione registro CNAME no seu domínio
- Ou use subdomínio gratuito da Cloudflare

### ✅ Prós:
- Grátis e ilimitado
- URL fixa (não muda)
- Muito rápido
- Produção-ready

### ❌ Contras:
- Um pouco mais complexo
- Precisa de domínio (ou usar temporário)

---

## 🎯 Opção 3: Simular Webhooks Manualmente (MAIS SIMPLES)

**Não precisa de túnel!** Apenas simule os webhooks localmente.

### Passo a Passo:

#### 1. Criar arquivo de teste
Crie: `scripts/test-webhook.js`

```javascript
// Script para simular webhook do Asaas
async function testWebhook() {
  const webhookPayload = {
    event: 'PAYMENT_CONFIRMED',
    payment: {
      id: 'pay_test_123',
      customer: 'cus_test_123',
      subscription: 'sub_test_123',
      billingType: 'CREDIT_CARD',
      value: 44.90,
      netValue: 42.50,
      status: 'CONFIRMED',
      dueDate: '2025-10-15',
      paymentDate: '2025-10-04',
      invoiceUrl: 'https://sandbox.asaas.com/i/abc123',
      description: 'Plano Pro'
    }
  }

  const response = await fetch('http://localhost:3000/api/webhooks/asaas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(webhookPayload)
  })

  const result = await response.json()
  console.log('✅ Webhook processado:', result)
}

testWebhook()
```

#### 2. Executar teste
```bash
# Terminal 1: Inicie a aplicação
npm run dev

# Terminal 2: Execute o teste
node scripts/test-webhook.js
```

#### 3. Verificar logs
Veja se o webhook foi processado nos logs da aplicação

### ✅ Prós:
- Muito simples
- Não precisa de ferramenta externa
- Controle total do payload
- Rápido para testar

### ❌ Contras:
- Não testa integração real
- Não valida assinatura do Asaas
- Só para desenvolvimento

---

## 🎯 Opção 4: localhost.run (SUPER RÁPIDO)

**Sem instalação!** Apenas um comando SSH.

### Passo a Passo:

#### 1. Executar comando
```bash
ssh -R 80:localhost:3000 nokey@localhost.run
```

#### 2. Copiar URL
Você verá:
```
Connect to https://abc123.localhost.run
```

#### 3. Usar no Asaas
- URL: `https://abc123.localhost.run/api/webhooks/asaas`

### ✅ Prós:
- Zero instalação
- Um comando apenas
- HTTPS automático

### ❌ Contras:
- URL aleatória
- Limite de requests
- Menos estável

---

## 📝 Comparação Rápida

| Ferramenta | Facilidade | Grátis | URL Fixa | Limite |
|------------|------------|--------|----------|--------|
| **ngrok** | ⭐⭐⭐⭐⭐ | Sim* | Não** | 40 req/min |
| **Cloudflare** | ⭐⭐⭐ | Sim | Sim | Ilimitado |
| **Simular** | ⭐⭐⭐⭐⭐ | Sim | N/A | Ilimitado |
| **localhost.run** | ⭐⭐⭐⭐ | Sim | Não | Baixo |

*ngrok: Plano grátis disponível
**ngrok pago tem URL fixa

---

## 🎯 RECOMENDAÇÃO

### Para Testes Rápidos:
Use **Opção 3 (Simular Webhooks)** 👈 **MAIS FÁCIL**

### Para Testar Integração Real:
Use **Opção 1 (ngrok)** 👈 **MAIS POPULAR**

### Para Desenvolvimento Contínuo:
Use **Opção 2 (Cloudflare)** 👈 **MELHOR A LONGO PRAZO**

---

## 🚀 Guia Rápido - Começar AGORA

### Escolheu ngrok?

```bash
# 1. Instalar
npm install -g ngrok

# 2. Iniciar app
npm run dev

# 3. Expor (outro terminal)
ngrok http 3000

# 4. Copiar URL e configurar no Asaas
# URL: https://XXXX.ngrok-free.app/api/webhooks/asaas
```

### Escolheu Simular?

```bash
# 1. Criar scripts/test-webhook.js (código acima)

# 2. Iniciar app
npm run dev

# 3. Testar (outro terminal)
node scripts/test-webhook.js
```

---

## 🧪 Vou criar os scripts de teste para você!

Continue lendo abaixo... 👇

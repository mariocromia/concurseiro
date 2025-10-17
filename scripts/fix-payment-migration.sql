-- Script de Correção para Migração de Pagamentos
-- Execute este script se tiver erros de colunas já existentes

-- PASSO 1: Remover tabelas antigas de pagamento (se existirem)
DROP TABLE IF EXISTS asaas_webhooks CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscription_changes CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS asaas_customers CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- PASSO 2: Verificar se a função update_updated_at_column existe
-- Se não existir, criar
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 3: Agora execute o payment-schema.sql completo
-- Copie e cole TODO o conteúdo do arquivo payment-schema.sql aqui abaixo:

-- Sistema de Pagamento e Assinaturas com Asaas

-- Tabela de planos
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'plus', 'pro'
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
  trial_days INTEGER DEFAULT 0,
  features JSONB NOT NULL, -- Lista de recursos do plano
  ai_enabled BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes Asaas
CREATE TABLE IF NOT EXISTS asaas_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  asaas_customer_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18),
  phone VARCHAR(20),
  address JSONB, -- Dados de endereço
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  asaas_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'trial', 'past_due', 'canceled', 'expired'
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asaas_payment_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'received', 'overdue', 'refunded', 'canceled'
  payment_method VARCHAR(50), -- 'credit_card', 'boleto', 'pix'
  due_date DATE NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE,
  invoice_url TEXT,
  bank_slip_url TEXT,
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  error_message TEXT,
  metadata JSONB, -- Dados adicionais do pagamento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de webhooks do Asaas
CREATE TABLE IF NOT EXISTS asaas_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  asaas_event_id VARCHAR(255) UNIQUE,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de mudanças de plano
CREATE TABLE IF NOT EXISTS subscription_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  from_plan_id UUID REFERENCES subscription_plans(id),
  to_plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- 'upgrade', 'downgrade', 'cancel', 'reactivate'
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_asaas_customers_user_id ON asaas_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_asaas_customers_asaas_id ON asaas_customers(asaas_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas_id ON subscriptions(asaas_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_asaas_id ON payments(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_event_type ON asaas_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON asaas_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_user_id ON subscription_changes(user_id);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE asaas_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asaas_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas se existirem
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view their own Asaas customer data" ON asaas_customers;
DROP POLICY IF EXISTS "Users can update their own Asaas customer data" ON asaas_customers;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can view their own subscription changes" ON subscription_changes;

-- Policies para subscription_plans (todos podem ler)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (active = true);

-- Policies para asaas_customers
CREATE POLICY "Users can view their own Asaas customer data" ON asaas_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own Asaas customer data" ON asaas_customers
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Policies para payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Policies para subscription_changes
CREATE POLICY "Users can view their own subscription changes" ON subscription_changes
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_asaas_customers_updated_at ON asaas_customers;
CREATE TRIGGER update_asaas_customers_updated_at BEFORE UPDATE ON asaas_customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir planos padrão
INSERT INTO subscription_plans (name, display_name, description, price, trial_days, features, ai_enabled)
VALUES
  (
    'plus',
    'Plano Plus',
    'Acesso completo ao sistema sem ferramentas de IA',
    24.90,
    0,
    '["Acesso completo à plataforma", "Caderno de estudos", "Timer Pomodoro", "Calendário de estudos", "Flashcards", "Relatórios de desempenho", "Suporte por email", "Atualizações automáticas"]'::jsonb,
    false
  ),
  (
    'pro',
    'Plano Pro',
    'Acesso completo ao sistema com todas as ferramentas de IA',
    44.90,
    14,
    '["Acesso completo à plataforma", "Caderno de estudos", "Timer Pomodoro", "Calendário de estudos", "Flashcards", "Relatórios de desempenho", "Suporte por email", "Atualizações automáticas", "Assistente de IA", "Gerador de resumos com IA", "Gerador de exercícios com IA", "Gerador de flashcards com IA", "Chat com IA", "Análises preditivas com IA"]'::jsonb,
    true
  )
ON CONFLICT (name) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  ai_enabled = EXCLUDED.ai_enabled,
  updated_at = NOW();

-- Função para verificar se usuário tem acesso a recursos de IA
CREATE OR REPLACE FUNCTION user_has_ai_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = p_user_id
      AND s.status IN ('active', 'trial')
      AND sp.ai_enabled = true
      AND (
        s.current_period_end IS NULL
        OR s.current_period_end > NOW()
      )
  ) INTO v_has_access;

  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem assinatura ativa
CREATE OR REPLACE FUNCTION user_has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_subscription BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions s
    WHERE s.user_id = p_user_id
      AND s.status IN ('active', 'trial')
      AND (
        s.current_period_end IS NULL
        OR s.current_period_end > NOW()
      )
  ) INTO v_has_subscription;

  RETURN COALESCE(v_has_subscription, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter plano atual do usuário
CREATE OR REPLACE FUNCTION get_user_current_plan(p_user_id UUID)
RETURNS TABLE (
  plan_name VARCHAR,
  plan_display_name VARCHAR,
  status VARCHAR,
  ai_enabled BOOLEAN,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.name,
    sp.display_name,
    s.status,
    sp.ai_enabled,
    s.trial_end,
    s.current_period_end
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trial')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

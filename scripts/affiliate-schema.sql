-- Sistema de Afiliados

-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  coupon_code VARCHAR(50) NOT NULL UNIQUE,
  tracking_link VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'canceled'
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  available_balance DECIMAL(10, 2) DEFAULT 0,
  withdrawn_balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes referidos
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  coupon_code VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'trial', -- 'trial', 'active', 'canceled', 'expired'
  first_payment_at TIMESTAMP WITH TIME ZONE,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  total_paid DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 20.00,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'available', 'withdrawn'
  available_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de solicitações de saque
CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
  pix_key VARCHAR(255),
  rejection_reason TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cupons (para rastreamento e validação)
CREATE TABLE IF NOT EXISTS affiliate_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage DECIMAL(5, 2) DEFAULT 20.00,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cliques/visitas nos links de afiliado
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  converted BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_coupon_code ON affiliates(coupon_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_user_id ON affiliate_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_affiliate_id ON affiliate_withdrawals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_withdrawals_status ON affiliate_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);

-- RLS Policies
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Policies para affiliates
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate data" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para affiliate_referrals
CREATE POLICY "Affiliates can view their referrals" ON affiliate_referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Policies para affiliate_commissions
CREATE POLICY "Affiliates can view their commissions" ON affiliate_commissions
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Policies para affiliate_withdrawals
CREATE POLICY "Affiliates can view their withdrawals" ON affiliate_withdrawals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

CREATE POLICY "Affiliates can create withdrawal requests" ON affiliate_withdrawals
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Policies para affiliate_coupons
CREATE POLICY "Affiliates can view their coupons" ON affiliate_coupons
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Policies para affiliate_clicks
CREATE POLICY "Affiliates can view their clicks" ON affiliate_clicks
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_affiliates_updated_at ON affiliates;
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_referrals_updated_at ON affiliate_referrals;
CREATE TRIGGER update_affiliate_referrals_updated_at BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_withdrawals_updated_at ON affiliate_withdrawals;
CREATE TRIGGER update_affiliate_withdrawals_updated_at BEFORE UPDATE ON affiliate_withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar link de rastreamento único
CREATE OR REPLACE FUNCTION generate_tracking_link(p_coupon_code VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN 'https://seuapp.com/register?ref=' || p_coupon_code;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular comissão
CREATE OR REPLACE FUNCTION calculate_commission(p_payment_amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  -- Desconto de 20% para o cliente, comissão de 20% sobre o valor pago
  -- Exemplo: R$ 100 -> Cliente paga R$ 80 -> Comissão = R$ 16 (20% de 80)
  RETURN (p_payment_amount * 0.20);
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se cupom está disponível
CREATE OR REPLACE FUNCTION is_coupon_available(p_coupon_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM affiliates WHERE LOWER(coupon_code) = LOWER(p_coupon_code)
  ) INTO v_exists;

  RETURN NOT v_exists;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas do afiliado
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_affiliate_id UUID)
RETURNS TABLE (
  total_clicks BIGINT,
  total_referrals BIGINT,
  trial_referrals BIGINT,
  active_referrals BIGINT,
  canceled_referrals BIGINT,
  total_earnings DECIMAL,
  available_balance DECIMAL,
  withdrawn_balance DECIMAL,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM affiliate_clicks WHERE affiliate_id = p_affiliate_id),
    (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = p_affiliate_id),
    (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = p_affiliate_id AND status = 'trial'),
    (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = p_affiliate_id AND status = 'active'),
    (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = p_affiliate_id AND status IN ('canceled', 'expired')),
    a.total_earnings,
    a.available_balance,
    a.withdrawn_balance,
    CASE
      WHEN (SELECT COUNT(*) FROM affiliate_clicks WHERE affiliate_id = p_affiliate_id) > 0
      THEN (SELECT COUNT(*) FROM affiliate_referrals WHERE affiliate_id = p_affiliate_id)::DECIMAL /
           (SELECT COUNT(*) FROM affiliate_clicks WHERE affiliate_id = p_affiliate_id)::DECIMAL * 100
      ELSE 0
    END
  FROM affiliates a
  WHERE a.id = p_affiliate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar saldo do afiliado quando comissão é criada
CREATE OR REPLACE FUNCTION update_affiliate_balance_on_commission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'available' THEN
    UPDATE affiliates
    SET
      total_earnings = total_earnings + NEW.amount,
      available_balance = available_balance + NEW.amount
    WHERE id = NEW.affiliate_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_balance_on_commission ON affiliate_commissions;
CREATE TRIGGER trigger_update_balance_on_commission
  AFTER INSERT OR UPDATE ON affiliate_commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_balance_on_commission();

-- Trigger para atualizar saldo quando saque é aprovado
CREATE OR REPLACE FUNCTION update_affiliate_balance_on_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE affiliates
    SET
      available_balance = available_balance - NEW.amount,
      withdrawn_balance = withdrawn_balance + NEW.amount
    WHERE id = NEW.affiliate_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_balance_on_withdrawal ON affiliate_withdrawals;
CREATE TRIGGER trigger_update_balance_on_withdrawal
  AFTER UPDATE ON affiliate_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_balance_on_withdrawal();

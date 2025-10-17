<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-8">🔧 Setup do Banco de Dados</h1>

      <div class="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 class="text-xl font-bold mb-4">Instruções:</h2>
        <ol class="list-decimal list-inside space-y-2 text-gray-300">
          <li>Acesse o Supabase Dashboard</li>
          <li>Vá em SQL Editor</li>
          <li>Copie e cole o SQL abaixo</li>
          <li>Execute no banco de dados</li>
        </ol>
      </div>

      <div class="bg-gray-800 p-6 rounded-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">SQL para executar:</h2>
          <button
            @click="copySQL"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            {{ copied ? '✓ Copiado!' : 'Copiar SQL' }}
          </button>
        </div>

        <pre class="bg-gray-900 p-4 rounded overflow-x-auto text-sm"><code>{{ sqlScript }}</code></pre>
      </div>

      <div class="mt-6 text-center">
        <a
          href="https://supabase.com/dashboard/project/ubeivchkuoptmhkcglny/editor"
          target="_blank"
          class="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"
        >
          Abrir Supabase Dashboard →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const copied = ref(false)

const sqlScript = `-- Tabela de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  coupon_code VARCHAR(50) NOT NULL UNIQUE,
  tracking_link VARCHAR(255) NOT NULL UNIQUE,
  cpf VARCHAR(14) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  available_balance DECIMAL(10, 2) DEFAULT 0,
  withdrawn_balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demais tabelas...
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  coupon_code VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'trial',
  first_payment_at TIMESTAMP WITH TIME ZONE,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  total_paid DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) DEFAULT 20.00,
  status VARCHAR(20) DEFAULT 'pending',
  available_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  pix_key VARCHAR(255),
  rejection_reason TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percentage DECIMAL(5, 2) DEFAULT 20.00,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Habilitar RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can register as affiliate" ON affiliates;
CREATE POLICY "Users can register as affiliate" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view active affiliates" ON affiliates;
CREATE POLICY "Anyone can view active affiliates" ON affiliates
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users can update their own affiliate data" ON affiliates;
CREATE POLICY "Users can update their own affiliate data" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

-- Outras policies...
DROP POLICY IF EXISTS "Affiliates can view their referrals" ON affiliate_referrals;
CREATE POLICY "Affiliates can view their referrals" ON affiliate_referrals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Affiliates can view their commissions" ON affiliate_commissions;
CREATE POLICY "Affiliates can view their commissions" ON affiliate_commissions
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Affiliates can view their withdrawals" ON affiliate_withdrawals;
CREATE POLICY "Affiliates can view their withdrawals" ON affiliate_withdrawals
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Affiliates can create withdrawal requests" ON affiliate_withdrawals;
CREATE POLICY "Affiliates can create withdrawal requests" ON affiliate_withdrawals
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Affiliates can view their coupons" ON affiliate_coupons;
CREATE POLICY "Affiliates can view their coupons" ON affiliate_coupons
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create their own coupons" ON affiliate_coupons;
CREATE POLICY "Users can create their own coupons" ON affiliate_coupons
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Affiliates can view their clicks" ON affiliate_clicks;
CREATE POLICY "Affiliates can view their clicks" ON affiliate_clicks
  FOR SELECT USING (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can register clicks" ON affiliate_clicks;
CREATE POLICY "Anyone can register clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);`

const copySQL = () => {
  navigator.clipboard.writeText(sqlScript)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

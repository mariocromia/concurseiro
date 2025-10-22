-- ============================================
-- ADICIONAR CAMPO subscription_type NA TABELA users
-- ============================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar o campo subscription_type se não existir
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'freemium';

-- 2. Adicionar constraint para validar valores
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_subscription_type_check;

ALTER TABLE users
ADD CONSTRAINT users_subscription_type_check
CHECK (subscription_type IN ('freemium', 'plus', 'pro'));

-- 3. Adicionar o campo trial_ends_at se não existir
ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- 4. Atualizar seu usuário para PRO (SUBSTITUA O EMAIL)
UPDATE users
SET subscription_type = 'pro',
    trial_ends_at = NOW() + INTERVAL '14 days'
WHERE email = 'SEU_EMAIL_AQUI';  -- <-- SUBSTITUA AQUI

-- 5. Verificar se funcionou
SELECT id, email, subscription_type, trial_ends_at
FROM users
WHERE email = 'SEU_EMAIL_AQUI';  -- <-- SUBSTITUA AQUI

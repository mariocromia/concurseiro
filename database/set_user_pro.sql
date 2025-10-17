-- ============================================
-- Atualizar usuário para plano PRO
-- ============================================

-- Atualizar o usuário netsacolas@gmail.com para PRO
UPDATE public.users
SET
  subscription_type = 'pro',
  updated_at = NOW()
WHERE email = 'netsacolas@gmail.com';

-- Verificar a atualização
SELECT
  id,
  email,
  full_name,
  subscription_type,
  trial_ends_at,
  created_at,
  updated_at
FROM public.users
WHERE email = 'netsacolas@gmail.com';

-- Execute este SQL no Supabase SQL Editor para verificar sua assinatura
-- Substitua 'SEU_EMAIL_AQUI' pelo seu email de login

SELECT
  id,
  email,
  subscription_type,
  trial_ends_at,
  CASE
    WHEN subscription_type = 'pro' THEN '✅ Pro (lowercase)'
    WHEN subscription_type = 'Pro' THEN '⚠️ Pro (maiúsculo - PROBLEMA!)'
    WHEN subscription_type = 'PRO' THEN '⚠️ PRO (maiúsculo - PROBLEMA!)'
    WHEN subscription_type = 'plus' THEN '✅ Plus (lowercase)'
    WHEN subscription_type = 'freemium' THEN '❌ Freemium'
    WHEN subscription_type IS NULL THEN '❌ NULL (campo vazio)'
    ELSE CONCAT('❌ Valor inesperado: "', subscription_type, '"')
  END AS status_subscription,
  CASE
    WHEN trial_ends_at IS NULL THEN '❌ Sem trial'
    WHEN trial_ends_at > NOW() THEN CONCAT('✅ Trial ativo até ', trial_ends_at::date)
    ELSE CONCAT('❌ Trial expirado em ', trial_ends_at::date)
  END AS status_trial
FROM users
WHERE email = 'SEU_EMAIL_AQUI';  -- <-- SUBSTITUA AQUI PELO SEU EMAIL

-- Se você não sabe seu email, pode ver todos os usuários assim:
-- SELECT id, email, subscription_type, trial_ends_at FROM users ORDER BY created_at DESC LIMIT 10;

-- Atualizar usuário netsacolas@gmail.com para premium
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"subscription_type": "pro"}'::jsonb
WHERE email = 'netsacolas@gmail.com';

-- Verificar se existe na tabela users e atualizar
UPDATE users
SET subscription_type = 'pro'
WHERE id = (SELECT id FROM auth.users WHERE email = 'netsacolas@gmail.com');

-- Se não existe, inserir
INSERT INTO users (id, subscription_type)
SELECT id, 'pro'
FROM auth.users
WHERE email = 'netsacolas@gmail.com'
AND NOT EXISTS (SELECT 1 FROM users WHERE users.id = auth.users.id);

-- Verificar resultado
SELECT u.email, us.subscription_type
FROM auth.users u
LEFT JOIN users us ON u.id = us.id
WHERE u.email = 'netsacolas@gmail.com';

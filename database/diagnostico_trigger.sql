-- DIAGNÓSTICO DO TRIGGER handle_new_user

-- 1. Verificar se o trigger existe
SELECT
    tgname AS trigger_name,
    tgenabled AS enabled,
    proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- 2. Verificar se a função existe
SELECT
    proname AS function_name,
    pronamespace::regnamespace AS schema,
    prosecdef AS security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. Ver o que existe em auth.users
SELECT
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 4. Ver o que existe em public.users
SELECT
    id,
    email,
    full_name,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 5. Verificar usuários que estão em auth.users mas não em public.users
SELECT
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' AS full_name,
    au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

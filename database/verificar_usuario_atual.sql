-- VERIFICAR SE O USUÁRIO ATUAL EXISTE NA TABELA public.users

-- 1. Ver o ID do usuário autenticado atual
SELECT auth.uid() AS meu_user_id;

-- 2. Verificar se este usuário existe em public.users
SELECT
  id,
  email,
  full_name,
  created_at
FROM public.users
WHERE id = auth.uid();

-- 3. Se não existir, inserir manualmente
INSERT INTO public.users (id, email, full_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO NOTHING;

-- 4. Confirmar que foi inserido
SELECT
  'Usuário sincronizado!' AS status,
  id,
  email,
  full_name
FROM public.users
WHERE id = auth.uid();

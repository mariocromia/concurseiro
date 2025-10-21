-- ============================================
-- CRIAR DADOS DE TESTE - História
-- ============================================
-- Este script cria automaticamente:
-- 1. Caderno de História
-- 2. 3 Seções (Idade Média, Renascimento, Rev. Francesa)
-- 3. 1 Página com conteúdo em cada seção
-- ============================================
-- IMPORTANTE: Substitua 'SEU_EMAIL@gmail.com' pelo seu email!
-- ============================================

DO $$
DECLARE
  v_user_id UUID;
  v_subject_id UUID;
  v_notebook_id UUID;
  v_section1_id UUID;
  v_section2_id UUID;
  v_section3_id UUID;
BEGIN
  -- ============================================
  -- PASSO 1: Pegar seu user_id
  -- ============================================
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'SEU_EMAIL@gmail.com'; -- ← MUDE AQUI!

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado! Verifique o email.';
  END IF;

  RAISE NOTICE 'User ID encontrado: %', v_user_id;

  -- ============================================
  -- PASSO 2: Pegar ou criar matéria "História"
  -- ============================================
  SELECT id INTO v_subject_id
  FROM subjects
  WHERE user_id = v_user_id
    AND name = 'História';

  IF v_subject_id IS NULL THEN
    RAISE NOTICE 'Matéria "História" não encontrada. Criando...';

    INSERT INTO subjects (user_id, name, color, icon)
    VALUES (v_user_id, 'História', '#F59E0B', 'book')
    RETURNING id INTO v_subject_id;

    RAISE NOTICE 'Matéria "História" criada: %', v_subject_id;
  ELSE
    RAISE NOTICE 'Matéria "História" já existe: %', v_subject_id;
  END IF;

  -- ============================================
  -- PASSO 3: Criar caderno
  -- ============================================
  INSERT INTO notebooks (user_id, subject_id, name, description)
  VALUES (
    v_user_id,
    v_subject_id,
    'Caderno de História',
    'Estudos de história para concursos públicos'
  )
  RETURNING id INTO v_notebook_id;

  RAISE NOTICE 'Caderno criado: %', v_notebook_id;

  -- ============================================
  -- PASSO 4: Criar seções/capítulos
  -- ============================================

  -- Seção 1: Idade Média
  INSERT INTO notebook_sections (notebook_id, name, order_index)
  VALUES (v_notebook_id, 'Idade Média', 0)
  RETURNING id INTO v_section1_id;

  -- Seção 2: Renascimento
  INSERT INTO notebook_sections (notebook_id, name, order_index)
  VALUES (v_notebook_id, 'Renascimento', 1)
  RETURNING id INTO v_section2_id;

  -- Seção 3: Revolução Francesa
  INSERT INTO notebook_sections (notebook_id, name, order_index)
  VALUES (v_notebook_id, 'Revolução Francesa', 2)
  RETURNING id INTO v_section3_id;

  RAISE NOTICE 'Seções criadas: %, %, %', v_section1_id, v_section2_id, v_section3_id;

  -- ============================================
  -- PASSO 5: Criar páginas com conteúdo
  -- ============================================

  -- Página 1: Idade Média
  INSERT INTO notebook_pages (section_id, title, content, order_index)
  VALUES (
    v_section1_id,
    'Características da Idade Média',
    'A Idade Média foi um período da história europeia que se estendeu do século V ao XV. Principais características:

1. FEUDALISMO: Sistema político, econômico e social baseado na posse de terras. O senhor feudal cedia terras aos vassalos em troca de fidelidade e serviços militares.

2. PODER DA IGREJA CATÓLICA: A Igreja era a instituição mais poderosa da época, controlando educação, cultura e moral.

3. ECONOMIA AGRÁRIA: A economia era baseada na agricultura de subsistência. Pouco comércio e uso de moeda.

4. SOCIEDADE ESTAMENTAL: Dividida em três ordens:
   - Clero (religiosos)
   - Nobreza (senhores feudais e cavaleiros)
   - Servos (trabalhadores presos à terra)

5. CRUZADAS: Expedições militares cristãs para reconquistar Jerusalém dos muçulmanos (séculos XI-XIII).

6. CULTURA TEOCÊNTRICA: Deus como centro de todas as explicações. Arte e pensamento voltados para o divino.',
    0
  );

  -- Página 2: Renascimento
  INSERT INTO notebook_pages (section_id, title, content, order_index)
  VALUES (
    v_section2_id,
    'O Renascimento Cultural',
    'O Renascimento foi um movimento cultural, científico e artístico que teve início na Itália no século XIV e se espalhou pela Europa.

CARACTERÍSTICAS PRINCIPAIS:

1. HUMANISMO: Valorização do ser humano, da razão e da ciência. Busca pelo conhecimento através da observação e experimentação.

2. ANTROPOCENTRISMO: O homem como centro do universo (oposto ao teocentrismo medieval).

3. CLASSICISMO: Retorno aos valores da cultura greco-romana antiga. Estudo de autores clássicos como Platão, Aristóteles, Virgílio.

4. RACIONALISMO: Uso da razão para explicar o mundo, não apenas a fé.

5. GRANDES ARTISTAS:
   - Leonardo da Vinci (Mona Lisa, A Última Ceia)
   - Michelangelo (Davi, Capela Sistina)
   - Rafael Sanzio (Escola de Atenas)
   - Donatello (esculturas)

6. MECENATO: Proteção e financiamento de artistas por famílias ricas (como os Médici em Florença).

7. INVENÇÕES: Imprensa de Gutenberg (1450), grandes navegações, bússola, pólvora.

O Renascimento marcou a transição da Idade Média para a Idade Moderna.',
    0
  );

  -- Página 3: Revolução Francesa
  INSERT INTO notebook_pages (section_id, title, content, order_index)
  VALUES (
    v_section3_id,
    'Causas e Fases da Revolução Francesa',
    'A Revolução Francesa (1789-1799) foi um marco histórico que transformou a França e influenciou o mundo todo.

CAUSAS DA REVOLUÇÃO:

1. CRISE ECONÔMICA: Dívidas da França por guerras e gastos excessivos da monarquia.

2. DESIGUALDADE SOCIAL: Sociedade dividida em três estados:
   - Primeiro Estado: Clero (privilegiado, não pagava impostos)
   - Segundo Estado: Nobreza (privilegiada, não pagava impostos)
   - Terceiro Estado: 98% da população (burguesia, camponeses, trabalhadores urbanos - pagavam todos os impostos)

3. INFLUÊNCIA DO ILUMINISMO: Ideias de liberdade, igualdade, divisão de poderes (Montesquieu, Rousseau, Voltaire).

4. FOME E MISÉRIA: Más colheitas, alta nos preços dos alimentos, desemprego.

5. GASTOS DA CORTE: Luxo excessivo de Luís XVI e Maria Antonieta.

FASES DA REVOLUÇÃO:

1. ASSEMBLEIA NACIONAL (1789-1792):
   - Queda da Bastilha (14/07/1789)
   - Declaração dos Direitos do Homem e do Cidadão
   - Abolição dos privilégios feudais

2. CONVENÇÃO NACIONAL (1792-1795):
   - Proclamação da República
   - Execução de Luís XVI e Maria Antonieta
   - Terror (liderado por Robespierre)

3. DIRETÓRIO (1795-1799):
   - Governo de cinco diretores
   - Instabilidade política
   - Ascensão de Napoleão Bonaparte

LEMA: Liberdade, Igualdade e Fraternidade',
    0
  );

  -- ============================================
  -- SUCESSO!
  -- ============================================
  RAISE NOTICE '✅✅✅ DADOS CRIADOS COM SUCESSO! ✅✅✅';
  RAISE NOTICE 'Caderno: Caderno de História';
  RAISE NOTICE 'Seções: 3 (Idade Média, Renascimento, Revolução Francesa)';
  RAISE NOTICE 'Páginas: 3 (1 por seção, com conteúdo completo)';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora volte para /mapa-mental e tente gerar o mapa com IA!';

END $$;

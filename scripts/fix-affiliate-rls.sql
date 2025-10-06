-- Políticas adicionais para permitir validação pública de cupons

-- Permitir que qualquer pessoa (autenticada) veja cupons ativos
DROP POLICY IF EXISTS "Anyone can view active coupons" ON affiliate_coupons;
CREATE POLICY "Anyone can view active coupons" ON affiliate_coupons
  FOR SELECT USING (active = true);

-- Permitir que qualquer pessoa (autenticada) veja afiliados ativos (apenas para validação)
DROP POLICY IF EXISTS "Anyone can view active affiliates" ON affiliates;
CREATE POLICY "Anyone can view active affiliates" ON affiliates
  FOR SELECT USING (status = 'active');

-- Manter política de visualização própria para afiliados
DROP POLICY IF EXISTS "Users can view their own affiliate data" ON affiliates;
CREATE POLICY "Users can view their own affiliate data" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

-- Permitir inserção de afiliados (para cadastro)
DROP POLICY IF EXISTS "Users can register as affiliate" ON affiliates;
CREATE POLICY "Users can register as affiliate" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir inserção de cupons durante cadastro de afiliado
DROP POLICY IF EXISTS "Users can create their own coupons" ON affiliate_coupons;
CREATE POLICY "Users can create their own coupons" ON affiliate_coupons
  FOR INSERT WITH CHECK (
    affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
  );

-- Permitir registro de cliques sem autenticação (para rastreamento)
DROP POLICY IF EXISTS "Anyone can register clicks" ON affiliate_clicks;
CREATE POLICY "Anyone can register clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

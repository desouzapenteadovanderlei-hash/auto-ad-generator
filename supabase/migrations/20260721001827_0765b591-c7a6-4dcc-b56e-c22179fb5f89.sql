
-- 1) sell_leads table
CREATE TABLE IF NOT EXISTS public.sell_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  marca text NOT NULL,
  modelo text NOT NULL,
  ano int NOT NULL,
  km int NOT NULL DEFAULT 0,
  preco_desejado numeric,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.sell_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.sell_leads TO authenticated;
GRANT ALL ON public.sell_leads TO service_role;
ALTER TABLE public.sell_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone submits sell lead" ON public.sell_leads;
CREATE POLICY "Anyone submits sell lead" ON public.sell_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(nome) BETWEEN 2 AND 120
             AND char_length(email) BETWEEN 5 AND 255
             AND char_length(telefone) BETWEEN 8 AND 30
             AND ano BETWEEN 1950 AND 2100
             AND km >= 0);

DROP POLICY IF EXISTS "Admins read sell leads" ON public.sell_leads;
CREATE POLICY "Admins read sell leads" ON public.sell_leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update sell leads" ON public.sell_leads;
CREATE POLICY "Admins update sell leads" ON public.sell_leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete sell leads" ON public.sell_leads;
CREATE POLICY "Admins delete sell leads" ON public.sell_leads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) financing_leads: allow admins to read/update/delete
DROP POLICY IF EXISTS "Admins read financing leads" ON public.financing_leads;
CREATE POLICY "Admins read financing leads" ON public.financing_leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update financing leads" ON public.financing_leads;
CREATE POLICY "Admins update financing leads" ON public.financing_leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete financing leads" ON public.financing_leads;
CREATE POLICY "Admins delete financing leads" ON public.financing_leads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3) profiles: allow insert self (needed for ensure-profile fallback)
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4) user_roles: admins manage
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

-- 5) alert_preferences: ensure self insert works
DROP POLICY IF EXISTS "Users insert own prefs" ON public.alert_preferences;
CREATE POLICY "Users insert own prefs" ON public.alert_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 6) offer_notifications: users delete own; allow delete
DROP POLICY IF EXISTS "Users delete own notifications" ON public.offer_notifications;
CREATE POLICY "Users delete own notifications" ON public.offer_notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7) attach vehicle change trigger
DROP TRIGGER IF EXISTS trg_vehicles_change ON public.vehicles;
CREATE TRIGGER trg_vehicles_change
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.handle_vehicle_change();

-- 8) updated_at trigger on vehicles
DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9) ensure_user_setup: idempotent bootstrap called from client after sign-in
CREATE OR REPLACE FUNCTION public.ensure_user_setup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
  v_name text;
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  SELECT email, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name')
    INTO v_email, v_name
    FROM auth.users WHERE id = v_uid;
  INSERT INTO public.profiles (id, email, full_name) VALUES (v_uid, v_email, v_name)
    ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.alert_preferences (user_id) VALUES (v_uid) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'user') ON CONFLICT DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_user_setup() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_setup() TO authenticated;

-- 10) claim_first_admin: promotes the caller to admin ONLY if no admin exists yet
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role='admin') INTO v_exists;
  IF v_exists THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
    ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- 11) grant execute on has_role
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- 12) sample vehicles seed (add more if fewer than 12)
INSERT INTO public.vehicles (marca, modelo, ano, km, cor, combustivel, cambio, preco, preco_anterior, promocao, oferta_semana, ultima_unidade, fotos, descricao)
SELECT * FROM (VALUES
  ('Fiat','Pulse Impetus',2023,18500,'Prata','Flex','Automático',99900,109900,true,false,false,ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200'],'SUV compacto turbo, único dono, revisões em dia.'),
  ('Renault','Kwid Zen',2022,32000,'Branco','Flex','Manual',52900,NULL,false,false,true,ARRAY['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200'],'Econômico, ideal para cidade. Última unidade disponível.'),
  ('Nissan','Kicks Advance',2021,45800,'Preto','Flex','Automático',94900,NULL,false,false,false,ARRAY['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200'],'SUV completo, central multimídia, câmera de ré.'),
  ('Ford','Ka SE',2020,58000,'Vermelho','Flex','Manual',48900,54900,true,false,false,ARRAY['https://images.unsplash.com/photo-1493238792000-8113da705763?w=1200'],'Hatch econômico, ar-condicionado, direção elétrica.'),
  ('Volkswagen','T-Cross Comfortline',2023,22000,'Cinza','Flex','Automático',134900,NULL,false,true,false,ARRAY['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200'],'SUV VW turbo TSI, teto solar, IPVA pago.'),
  ('Toyota','Yaris XL',2021,39000,'Prata','Flex','Automático',82900,NULL,false,false,false,ARRAY['https://images.unsplash.com/photo-1549924231-f129b911e442?w=1200'],'Sedan compacto, baixo consumo, garantia de fábrica.')
) AS v(marca,modelo,ano,km,cor,combustivel,cambio,preco,preco_anterior,promocao,oferta_semana,ultima_unidade,fotos,descricao)
WHERE (SELECT count(*) FROM public.vehicles) < 12;

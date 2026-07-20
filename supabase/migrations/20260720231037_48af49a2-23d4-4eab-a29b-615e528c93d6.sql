
-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.vehicle_status AS ENUM ('disponivel', 'reservado', 'vendido');
CREATE TYPE public.offer_type AS ENUM ('queda_preco', 'promocao', 'oferta_semana', 'ultima_unidade');

-- =====================================================
-- UTILITY: updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- USER ROLES
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- =====================================================
-- VEHICLES
-- =====================================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  km INTEGER NOT NULL DEFAULT 0,
  cor TEXT,
  combustivel TEXT,
  cambio TEXT,
  preco NUMERIC(12,2) NOT NULL,
  preco_anterior NUMERIC(12,2),
  status public.vehicle_status NOT NULL DEFAULT 'disponivel',
  promocao BOOLEAN NOT NULL DEFAULT FALSE,
  oferta_semana BOOLEAN NOT NULL DEFAULT FALSE,
  ultima_unidade BOOLEAN NOT NULL DEFAULT FALSE,
  fotos TEXT[] NOT NULL DEFAULT '{}',
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads vehicles" ON public.vehicles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete vehicles" ON public.vehicles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PRICE HISTORY
-- =====================================================
CREATE TABLE public.vehicle_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  preco_antigo NUMERIC(12,2) NOT NULL,
  preco_novo NUMERIC(12,2) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicle_price_history TO anon, authenticated;
GRANT ALL ON public.vehicle_price_history TO service_role;
ALTER TABLE public.vehicle_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads price history" ON public.vehicle_price_history FOR SELECT TO anon, authenticated USING (true);

-- =====================================================
-- FAVORITES
-- =====================================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, vehicle_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ALERT PREFERENCES
-- =====================================================
CREATE TABLE public.alert_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notif_queda_preco BOOLEAN NOT NULL DEFAULT TRUE,
  notif_promocao BOOLEAN NOT NULL DEFAULT TRUE,
  notif_oferta_semana BOOLEAN NOT NULL DEFAULT TRUE,
  notif_ultima_unidade BOOLEAN NOT NULL DEFAULT TRUE,
  canal_email BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.alert_preferences TO authenticated;
GRANT ALL ON public.alert_preferences TO service_role;
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prefs" ON public.alert_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_prefs_updated BEFORE UPDATE ON public.alert_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- OFFER NOTIFICATIONS
-- =====================================================
CREATE TABLE public.offer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  tipo public.offer_type NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  preco_antigo NUMERIC(12,2),
  preco_novo NUMERIC(12,2),
  lida BOOLEAN NOT NULL DEFAULT FALSE,
  enviada_email BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.offer_notifications(user_id, lida);
CREATE INDEX ON public.offer_notifications(enviada_email) WHERE enviada_email = FALSE;
GRANT SELECT, UPDATE ON public.offer_notifications TO authenticated;
GRANT ALL ON public.offer_notifications TO service_role;
ALTER TABLE public.offer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.offer_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.offer_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SIGNUP TRIGGER: create profile + preferences
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.alert_preferences (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VEHICLE CHANGE TRIGGER: price history + notifications
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_vehicle_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_label TEXT := NEW.marca || ' ' || NEW.modelo || ' ' || NEW.ano;
BEGIN
  -- Price drop
  IF NEW.preco < OLD.preco THEN
    INSERT INTO public.vehicle_price_history (vehicle_id, preco_antigo, preco_novo)
    VALUES (NEW.id, OLD.preco, NEW.preco);
    NEW.preco_anterior := OLD.preco;

    INSERT INTO public.offer_notifications (user_id, vehicle_id, tipo, titulo, mensagem, preco_antigo, preco_novo)
    SELECT f.user_id, NEW.id, 'queda_preco',
      'Preço caiu: ' || v_label,
      'O ' || v_label || ' que você favoritou baixou de R$ ' || to_char(OLD.preco, 'FM999G999G990D00') || ' para R$ ' || to_char(NEW.preco, 'FM999G999G990D00') || '.',
      OLD.preco, NEW.preco
    FROM public.favorites f
    JOIN public.alert_preferences p ON p.user_id = f.user_id
    WHERE f.vehicle_id = NEW.id AND p.notif_queda_preco = TRUE;
  END IF;

  -- Promocao turned on
  IF NEW.promocao = TRUE AND OLD.promocao = FALSE THEN
    INSERT INTO public.offer_notifications (user_id, vehicle_id, tipo, titulo, mensagem, preco_novo)
    SELECT f.user_id, NEW.id, 'promocao',
      'Promoção: ' || v_label,
      'O ' || v_label || ' entrou em promoção por R$ ' || to_char(NEW.preco, 'FM999G999G990D00') || '.',
      NEW.preco
    FROM public.favorites f
    JOIN public.alert_preferences p ON p.user_id = f.user_id
    WHERE f.vehicle_id = NEW.id AND p.notif_promocao = TRUE;
  END IF;

  -- Oferta da semana turned on
  IF NEW.oferta_semana = TRUE AND OLD.oferta_semana = FALSE THEN
    INSERT INTO public.offer_notifications (user_id, vehicle_id, tipo, titulo, mensagem, preco_novo)
    SELECT f.user_id, NEW.id, 'oferta_semana',
      'Oferta da semana: ' || v_label,
      'O ' || v_label || ' é a oferta da semana na VSP!',
      NEW.preco
    FROM public.favorites f
    JOIN public.alert_preferences p ON p.user_id = f.user_id
    WHERE f.vehicle_id = NEW.id AND p.notif_oferta_semana = TRUE;
  END IF;

  -- Ultima unidade turned on
  IF NEW.ultima_unidade = TRUE AND OLD.ultima_unidade = FALSE THEN
    INSERT INTO public.offer_notifications (user_id, vehicle_id, tipo, titulo, mensagem, preco_novo)
    SELECT f.user_id, NEW.id, 'ultima_unidade',
      'Última unidade: ' || v_label,
      'Corre! O ' || v_label || ' está na última unidade.',
      NEW.preco
    FROM public.favorites f
    JOIN public.alert_preferences p ON p.user_id = f.user_id
    WHERE f.vehicle_id = NEW.id AND p.notif_ultima_unidade = TRUE;
  END IF;

  RETURN NEW;
END; $$;
CREATE TRIGGER trg_vehicles_change BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.handle_vehicle_change();

-- =====================================================
-- SEED DATA
-- =====================================================
INSERT INTO public.vehicles (marca, modelo, ano, km, cor, combustivel, cambio, preco, descricao, fotos, oferta_semana) VALUES
('Volkswagen', 'Golf GTI', 2021, 32000, 'Branco', 'Gasolina', 'Automático', 149900, 'GTI TSI, único dono, revisões em dia.', ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200'], TRUE),
('Toyota', 'Corolla XEi', 2022, 41000, 'Prata', 'Flex', 'Automático', 132900, 'Corolla XEi 2.0, impecável.', ARRAY['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200'], FALSE),
('Honda', 'Civic Touring', 2020, 55000, 'Preto', 'Gasolina', 'CVT', 129900, 'Civic Touring turbo, top de linha.', ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200'], FALSE),
('Jeep', 'Compass Longitude', 2023, 18000, 'Cinza', 'Diesel', 'Automático', 189900, 'Compass Longitude diesel 4x4.', ARRAY['https://images.unsplash.com/photo-1519752594763-2633d6c1cf82?w=1200'], FALSE),
('Hyundai', 'HB20 Comfort', 2022, 28000, 'Vermelho', 'Flex', 'Manual', 74900, 'HB20 Comfort econômico.', ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200'], FALSE),
('Chevrolet', 'Onix LTZ', 2021, 46000, 'Branco', 'Flex', 'Automático', 79900, 'Onix LTZ completo.', ARRAY['https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=1200'], FALSE);

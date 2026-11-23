-- Схема базы галереи Юлии Просецкой. Выполнить первым в SQL Editor нового проекта.
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

CREATE TABLE public.projects (
  id text PRIMARY KEY, title_ru text NOT NULL, title_en text NOT NULL DEFAULT '',
  description_ru text NOT NULL DEFAULT '', description_en text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '', kind text NOT NULL DEFAULT 'painting',
  interior_enabled boolean NOT NULL DEFAULT false, source text NOT NULL DEFAULT '',
  cover_artwork_id text, sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.artworks (
  id text PRIMARY KEY, title_ru text NOT NULL, title_en text NOT NULL DEFAULT '',
  category text NOT NULL, categories text[] NOT NULL DEFAULT '{}',
  year text NOT NULL DEFAULT '', size text NOT NULL DEFAULT '',
  medium_ru text NOT NULL DEFAULT '', medium_en text NOT NULL DEFAULT '',
  image_url text NOT NULL, width integer NOT NULL DEFAULT 1000, height integer NOT NULL DEFAULT 1000,
  catalogue_only boolean NOT NULL DEFAULT false, source_availability text,
  source text NOT NULL DEFAULT '', sort_order integer NOT NULL DEFAULT 0,
  hidden boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now(),
  project_id text REFERENCES public.projects(id), interior_enabled boolean, genre text, style text
);

CREATE TABLE public.artwork_prices (
  artwork_id text PRIMARY KEY, price integer, updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.favorites (
  user_id uuid NOT NULL DEFAULT auth.uid(), artwork_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, artwork_id)
);

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL DEFAULT 'work',
  title_ru text NOT NULL, title_en text NOT NULL DEFAULT '', body_ru text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '', image_url text NOT NULL DEFAULT '',
  event_date text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  artwork_id text NOT NULL, artwork_title text NOT NULL, method text NOT NULL,
  status text NOT NULL DEFAULT 'new', amount integer, customer_name text NOT NULL,
  customer_phone text NOT NULL, customer_email text NOT NULL,
  company text NOT NULL DEFAULT '', comment text NOT NULL DEFAULT '', payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), path text NOT NULL,
  referrer text NOT NULL DEFAULT '', device text NOT NULL DEFAULT 'desktop',
  visitor_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payment_settings (
  id integer PRIMARY KEY DEFAULT 1, yookassa_shop_id text NOT NULL DEFAULT '',
  yookassa_secret_key text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.payment_settings (id) VALUES (1);

CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1, show_prices boolean NOT NULL DEFAULT false,
  online_payment_enabled boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now(),
  collection_menu_position text NOT NULL DEFAULT 'top',
  collection_directions jsonb NOT NULL DEFAULT '[]', cv jsonb,
  genres jsonb NOT NULL DEFAULT '[]', styles jsonb NOT NULL DEFAULT '[]',
  show_style_filter boolean NOT NULL DEFAULT true
);

CREATE TABLE public.subscribers (
  email text PRIMARY KEY, subscribed boolean NOT NULL DEFAULT true, lang text NOT NULL DEFAULT 'ru',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

-- Права доступа
GRANT SELECT ON public.artworks, public.projects, public.artwork_prices, public.site_settings, public.news TO anon;
GRANT INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

DO $$ DECLARE t text; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP; END $$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone reads settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins read payment settings" ON public.payment_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update payment settings" ON public.payment_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone reads prices" ON public.artwork_prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage prices" ON public.artwork_prices FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'new' AND payment_id IS NULL);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone reads visible artworks" ON public.artworks FOR SELECT TO anon, authenticated USING (hidden = false OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage artworks" ON public.artworks FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone reads projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone records a visit" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (length(path) <= 300 AND length(referrer) <= 300 AND length(visitor_id) <= 64 AND device = ANY (ARRAY['desktop','mobile','tablet']));
CREATE POLICY "Admins read visits" ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users read own favorites" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users add own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users remove own favorites" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone reads published news" ON public.news FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage news" ON public.news FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins and owners read subscribers" ON public.subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR lower(email) = lower(auth.jwt() ->> 'email'));

-- Функции
CREATE OR REPLACE FUNCTION public.handle_first_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
CREATE TRIGGER on_auth_user_created_first_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();

CREATE OR REPLACE FUNCTION public.reserved_artworks() RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select distinct artwork_id from public.orders where status <> 'cancelled'
$$;

CREATE OR REPLACE FUNCTION public.subscribe(_email text, _lang text DEFAULT 'ru') RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.subscribers(email, lang) VALUES (lower(trim(_email)), CASE WHEN _lang = 'en' THEN 'en' ELSE 'ru' END)
  ON CONFLICT (email) DO UPDATE SET subscribed = true, updated_at = now();
$$;

CREATE OR REPLACE FUNCTION public.set_my_subscription(_on boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e text := lower(auth.jwt() ->> 'email');
BEGIN
  IF e IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.subscribers(email, subscribed) VALUES (e, _on)
  ON CONFLICT (email) DO UPDATE SET subscribed = _on, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, roles text[])
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
    SELECT u.id, u.email::text, u.created_at, u.last_sign_in_at,
      COALESCE(ARRAY(SELECT r.role::text FROM public.user_roles r WHERE r.user_id = u.id ORDER BY r.role), '{}')
    FROM auth.users u ORDER BY u.created_at;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _role public.app_role, _on boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT _on AND _role = 'admin' AND _user_id = auth.uid() THEN RAISE EXCEPTION 'cannot remove own admin role'; END IF;
  IF _on THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, _role) ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public.subscribe(text, text) TO anon, authenticated;

-- Хранилище для загрузок из админки (приватное)
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Anyone reads artwork files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'artworks');
CREATE POLICY "Admins upload artwork files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artworks' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins change artwork files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'artworks' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete artwork files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'artworks' AND public.has_role(auth.uid(),'admin'));

-- Выполнять после 01_schema.sql и 02_data.sql. Повторный запуск безопасен.
BEGIN;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
UPDATE public.orders SET updated_at = created_at WHERE updated_at > created_at AND status = 'new';
CREATE OR REPLACE FUNCTION public.touch_order_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN NEW.updated_at := now(); END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS orders_touch_updated_at ON public.orders;
CREATE TRIGGER orders_touch_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_order_updated_at();
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_updated_idx ON public.orders(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS page_views_created_idx ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS artworks_project_idx ON public.artworks(project_id);
CREATE INDEX IF NOT EXISTS artworks_taxonomy_idx ON public.artworks(genre, style, year);

-- Установить недостающие настройки, не перезаписывая сохранённые администратором.
INSERT INTO public.site_settings(id, collection_directions, genres, styles) VALUES (1, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.payment_settings(id) VALUES (1) ON CONFLICT (id) DO NOTHING;
UPDATE public.artworks SET project_id='murals', medium_ru='Роспись потолка', medium_en='Ceiling mural', category='projects', categories=ARRAY['projects']::text[], updated_at=now()
WHERE id IN ('drive-126','drive-127','work-ac84aa9abc14');

-- Последовательное назначение первого администратора даже при одновременной регистрации.
CREATE OR REPLACE FUNCTION public.handle_first_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(72490133);
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN
    INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
-- Если пользователь уже зарегистрирован до запуска скриптов — дать роль самому первому аккаунту.
DO $$ BEGIN
  PERFORM pg_advisory_xact_lock(72490133);
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') THEN
    INSERT INTO public.user_roles(user_id, role) SELECT id, 'admin'::public.app_role FROM auth.users ORDER BY created_at, id LIMIT 1 ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- RPC административных действий доступны только вошедшим пользователям; сама функция проверяет роль.
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_role(uuid,public.app_role,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid,public.app_role,boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.set_my_subscription(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_my_subscription(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserved_artworks() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.subscribe(text,text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_first_admin() FROM PUBLIC, anon, authenticated;

-- Минимальные права — RLS дополнительно ограничивает каждую операцию.
REVOKE ALL ON public.user_roles,public.orders,public.favorites,public.subscribers,public.payment_settings,public.page_views FROM anon;
GRANT INSERT ON public.page_views TO anon;
REVOKE INSERT,UPDATE,DELETE ON public.user_roles,public.subscribers FROM authenticated;
GRANT SELECT ON public.user_roles,public.subscribers TO authenticated;
REVOKE INSERT,DELETE ON public.payment_settings,public.site_settings FROM authenticated;
GRANT SELECT,UPDATE ON public.payment_settings,public.site_settings TO authenticated;
REVOKE UPDATE ON public.favorites FROM authenticated;
REVOKE DELETE ON public.orders FROM authenticated;
REVOKE UPDATE,DELETE ON public.page_views FROM authenticated;
GRANT ALL ON public.user_roles,public.projects,public.artworks,public.artwork_prices,public.favorites,public.news,public.orders,public.page_views,public.payment_settings,public.site_settings,public.subscribers TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;

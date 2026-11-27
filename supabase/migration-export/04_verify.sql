-- Только чтение. Выполнить после 01, 02, 03.
SELECT count(*) AS total, count(*) FILTER (WHERE NOT hidden) AS visible FROM public.artworks;
SELECT title_ru,project_id,medium_ru FROM public.artworks WHERE id IN ('drive-126','drive-127','work-ac84aa9abc14');
SELECT id,collection_directions,genres,styles FROM public.site_settings;
SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('has_role','reserved_artworks','subscribe','set_my_subscription','admin_list_users','admin_set_role');
SELECT u.email,r.role FROM public.user_roles r JOIN auth.users u ON u.id=r.user_id;
SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='updated_at';
SELECT tablename,rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('artworks','orders','user_roles','favorites','subscribers');

CREATE TABLE public.favorites (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  artwork_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, artwork_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own favorites" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users add own favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users remove own favorites" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'work' CHECK (kind IN ('work','exhibition','other')),
  title_ru text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  body_ru text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  event_date text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published news" ON public.news FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage news" ON public.news FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.site_settings ADD COLUMN cv jsonb, ADD COLUMN genres jsonb NOT NULL DEFAULT '[]'::jsonb, ADD COLUMN styles jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE POLICY "Anyone views artwork files" ON storage.objects FOR SELECT USING (bucket_id = 'artworks');
CREATE POLICY "Admins upload artwork files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artworks' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete artwork files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'artworks' AND public.has_role(auth.uid(), 'admin'));
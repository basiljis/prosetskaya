CREATE TABLE public.artworks (
  id text PRIMARY KEY,
  title_ru text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  category text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  year text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  medium_ru text NOT NULL DEFAULT '',
  medium_en text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  width integer NOT NULL DEFAULT 1000,
  height integer NOT NULL DEFAULT 1000,
  catalogue_only boolean NOT NULL DEFAULT false,
  source_availability text,
  source text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  hidden boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.artworks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artworks TO authenticated;
GRANT ALL ON public.artworks TO service_role;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads visible artworks" ON public.artworks FOR SELECT TO anon, authenticated USING (hidden = false OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage artworks" ON public.artworks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

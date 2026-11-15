CREATE TABLE public.projects (
 id text PRIMARY KEY,
 title_ru text NOT NULL,
 title_en text NOT NULL DEFAULT '',
 description_ru text NOT NULL DEFAULT '',
 description_en text NOT NULL DEFAULT '',
 year text NOT NULL DEFAULT '',
 kind text NOT NULL DEFAULT 'painting' CHECK (kind IN ('painting', 'photo')),
 interior_enabled boolean NOT NULL DEFAULT false,
 source text NOT NULL DEFAULT '',
 cover_artwork_id text,
 sort_order integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads projects" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
ALTER TABLE public.artworks ADD COLUMN project_id text REFERENCES public.projects(id), ADD COLUMN interior_enabled boolean;
CREATE INDEX artworks_project_id_idx ON public.artworks(project_id);
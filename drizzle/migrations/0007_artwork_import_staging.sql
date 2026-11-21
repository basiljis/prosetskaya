CREATE TABLE public.artwork_import (id text PRIMARY KEY, payload jsonb NOT NULL);
GRANT INSERT ON public.artwork_import TO anon;
GRANT ALL ON public.artwork_import TO service_role;
ALTER TABLE public.artwork_import ENABLE ROW LEVEL SECURITY;
CREATE POLICY "temporary import" ON public.artwork_import FOR INSERT TO anon WITH CHECK (true);
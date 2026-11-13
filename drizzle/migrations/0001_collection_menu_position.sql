ALTER TABLE public.site_settings ADD COLUMN collection_menu_position text NOT NULL DEFAULT 'top' CONSTRAINT site_settings_collection_menu_position_check CHECK (collection_menu_position IN ('top', 'left'));
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public.site_settings.collection_menu_position IS 'Public collection filter placement: top horizontal bar or left sidebar; only administrators can update via existing RLS.';
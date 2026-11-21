CREATE TABLE public.subscribers (
  email text PRIMARY KEY CHECK (length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subscribed boolean NOT NULL DEFAULT true,
  lang text NOT NULL DEFAULT 'ru',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and owners read subscribers" ON public.subscribers FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR lower(email) = lower(auth.jwt() ->> 'email'));

CREATE OR REPLACE FUNCTION public.subscribe(_email text, _lang text DEFAULT 'ru')
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.subscribers(email, lang) VALUES (lower(trim(_email)), CASE WHEN _lang = 'en' THEN 'en' ELSE 'ru' END)
  ON CONFLICT (email) DO UPDATE SET subscribed = true, updated_at = now();
$$;
GRANT EXECUTE ON FUNCTION public.subscribe(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_my_subscription(_on boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e text := lower(auth.jwt() ->> 'email');
BEGIN
  IF e IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.subscribers(email, subscribed) VALUES (e, _on)
  ON CONFLICT (email) DO UPDATE SET subscribed = _on, updated_at = now();
END $$;
REVOKE EXECUTE ON FUNCTION public.set_my_subscription(boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_my_subscription(boolean) TO authenticated;
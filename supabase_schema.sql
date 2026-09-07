-- ==============================================================================
-- Run this SQL in your Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.app_store (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_store ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for anon key
DROP POLICY IF EXISTS "Public access to app_store" ON public.app_store;
CREATE POLICY "Public access to app_store"
ON public.app_store
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

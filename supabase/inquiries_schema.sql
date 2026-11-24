-- ==============================================================================
-- Table: Customer Inquiries (from Contact Us Page)
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eeqipepnpfutyxvpufqy/sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.inquiries (
    id TEXT PRIMARY KEY DEFAULT ('inq-' || substr(uuid_generate_v4()::text, 1, 8)),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON TABLE public.inquiries TO anon, authenticated;

-- Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public to insert contact inquiries
DROP POLICY IF EXISTS "Allow public insert on inquiries" ON public.inquiries;
CREATE POLICY "Allow public insert on inquiries"
    ON public.inquiries FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow admins & anon to select inquiries
DROP POLICY IF EXISTS "Allow public select on inquiries" ON public.inquiries;
CREATE POLICY "Allow public select on inquiries"
    ON public.inquiries FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow delete on inquiries
DROP POLICY IF EXISTS "Allow delete on inquiries" ON public.inquiries;
CREATE POLICY "Allow delete on inquiries"
    ON public.inquiries FOR DELETE
    TO anon, authenticated
    USING (true);

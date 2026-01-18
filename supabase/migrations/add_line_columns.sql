-- LINE Integration: Add LINE user linkage columns to users table
-- Run this in Supabase SQL Editor

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS line_user_id text UNIQUE,
ADD COLUMN IF NOT EXISTS line_display_name text,
ADD COLUMN IF NOT EXISTS line_picture_url text,
ADD COLUMN IF NOT EXISTS line_connected_at timestamptz,
ADD COLUMN IF NOT EXISTS line_rich_menu_id text;

-- Create index for faster LINE user lookups
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON public.users(line_user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.users.line_user_id IS 'LINE User ID from LIFF authentication';
COMMENT ON COLUMN public.users.line_connected_at IS 'Timestamp when LINE was first connected';
COMMENT ON COLUMN public.users.line_rich_menu_id IS 'Current rich menu ID for this user';

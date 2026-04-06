-- ============================================================
-- Admin Account Setup
-- Run this in: Supabase Dashboard → SQL Editor
--
-- BEFORE running this script:
--   1. Sign up at http://localhost:3000/signup using
--      email: admin@gmail.com  /  password: admin123
--   2. If email confirmation is ENABLED, click the link in
--      your inbox first.
--   3. Then run this SQL to promote that user to admin.
-- ============================================================

-- Promote admin@gmail.com to admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@gmail.com';

-- Verify the result
SELECT id, email, role, created_at
FROM public.profiles
WHERE email = 'admin@gmail.com';

-- ============================================================
-- Debugging helpers
-- ============================================================

-- Check all profiles and their roles
SELECT id, email, role, created_at FROM public.profiles ORDER BY created_at;

-- Check whether the is_admin() function returns true
-- (must be run as the admin user — not useful from dashboard)
-- SELECT public.is_admin();

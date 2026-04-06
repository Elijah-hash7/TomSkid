-- ============================================================
-- fix-signup.sql
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- Safe to run multiple times (all statements are idempotent).
-- ============================================================


-- ============================================================
-- STEP 1 — Verify what currently exists
-- ============================================================

-- Check whether the trigger exists on auth.users
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table  = 'users'
  AND trigger_name = 'on_auth_user_created';
-- Expected: 1 row.  0 rows = trigger is missing → proceed with step 2.

-- Check whether the function exists
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name   = 'handle_new_user';
-- Expected: 1 row with security_type = 'DEFINER'.


-- ============================================================
-- STEP 2 — Recreate the trigger function (idempotent)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- ============================================================
-- STEP 3 — Recreate the trigger (idempotent)
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- STEP 4 — Backfill profiles for users that don't have one
-- (safe for manually-created accounts and pre-trigger users)
-- ============================================================

INSERT INTO public.profiles (id, email, role)
SELECT
  u.id,
  u.email,
  'customer'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
-- Check how many rows were inserted by looking at the row count.


-- ============================================================
-- STEP 5 — Add INSERT RLS policy so the app can create a
--          profile row as a fallback when the trigger misses.
--          (Allows an authenticated user to insert only their own row.)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can insert own profile"
        ON public.profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id)
    $policy$;
    RAISE NOTICE 'Created INSERT policy on profiles.';
  ELSE
    RAISE NOTICE 'INSERT policy already exists — skipped.';
  END IF;
END;
$$;


-- ============================================================
-- STEP 6 — Verify everything looks correct
-- ============================================================

-- All auth users and whether they have a matching profile
SELECT
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  u.created_at                     AS user_created_at,
  p.role                           AS profile_role,
  p.created_at                     AS profile_created_at,
  (p.id IS NULL)                   AS profile_missing
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- All RLS policies on profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

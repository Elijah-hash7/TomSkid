-- ============================================================
-- Expiry tracking for eSIM orders
-- ============================================================

-- Add expiry tracking columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at   timestamptz;

-- Index for efficient expiry-window queries (cron job + modal check)
CREATE INDEX IF NOT EXISTS orders_expires_at_idx
  ON public.orders (expires_at)
  WHERE expires_at IS NOT NULL;

-- ============================================================
-- pg_cron setup (requires pg_cron enabled in Supabase dashboard)
-- Run the block below manually in the Supabase SQL Editor once
-- you have deployed the app and set CRON_SECRET in .env:
--
-- SELECT cron.schedule(
--   'daily-esim-expiry-check',
--   '0 8 * * *',   -- 08:00 UTC every day
--   $$
--   SELECT net.http_post(
--     url     := 'https://YOUR_APP_DOMAIN/api/cron/check-expiry',
--     headers := jsonb_build_object(
--       'Content-Type',  'application/json',
--       'x-cron-secret', 'YOUR_CRON_SECRET'
--     ),
--     body    := '{}'::jsonb
--   );
--   $$
-- );
--
-- Replace YOUR_APP_DOMAIN with your Vercel / production URL.
-- Replace YOUR_CRON_SECRET with the value of your CRON_SECRET env var.
-- pg_net must also be enabled in the Supabase dashboard extensions page.
-- ============================================================

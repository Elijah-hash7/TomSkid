-- ============================================================
-- Schedule the check-expiry Edge Function via pg_cron + pg_net
--
-- Prerequisites:
--   1. Enable pg_cron and pg_net extensions in the dashboard
--      (Database → Extensions)
--   2. Deploy the Edge Function with "No JWT verification" checked
--   3. Set RESEND_API_KEY in the Edge Function secrets
-- ============================================================

-- Remove the old job if it exists (no-op if it doesn't)
SELECT cron.unschedule(jobid)
FROM   cron.job
WHERE  jobname = 'daily-esim-expiry-check';

-- Schedule the Edge Function at 08:00 UTC every day
SELECT cron.schedule(
  'daily-esim-expiry-check',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://fsbsmprrgoejvznerkzk.supabase.co/functions/v1/check-expiry',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzYnNtcHJyZ29lanZ6bmVya3prIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI5NDI4NSwiZXhwIjoyMDkwODcwMjg1fQ.Efg3ydgA7DxF4yAN8nimYMOg0SaEAe0PgJCyxF_bIqE'
    ),
    body    := '{}'::jsonb
  );
  $$
);

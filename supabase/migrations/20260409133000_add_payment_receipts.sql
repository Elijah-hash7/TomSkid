alter table public.orders
  add column if not exists payment_reference text,
  add column if not exists payment_receipt_path text;

insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

create policy "Users can upload own payment receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own payment receipts"
  on storage.objects for select
  using (
    bucket_id = 'payment-receipts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can read all payment receipts"
  on storage.objects for select
  using (bucket_id = 'payment-receipts' and public.is_admin());

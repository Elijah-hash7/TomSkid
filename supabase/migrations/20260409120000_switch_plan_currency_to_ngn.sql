alter table public.plans
  alter column currency set default 'NGN';

update public.plans
set currency = 'NGN'
where upper(currency) in ('USD', 'NG');

-- Abandoned-cart reminders need somewhere to record that a cart has already
-- been mailed about, otherwise the daily sweep would email the same customer
-- every single day until they either buy or empty the cart.
--
-- Run once in the Supabase SQL editor.

alter table public.carts
  add column if not exists reminder_sent_at timestamptz;

-- Clearing the stamp whenever the cart changes means a customer who comes
-- back, adds something else and leaves again is eligible for one more
-- reminder - still one per abandonment, not one per day.
create or replace function public.reset_cart_reminder()
returns trigger
language plpgsql
as $$
begin
  if new.items is distinct from old.items then
    new.reminder_sent_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists on_cart_items_changed on public.carts;
create trigger on_cart_items_changed
  before update on public.carts
  for each row execute function public.reset_cart_reminder();

-- 0002_security_and_performance_fixes.sql
-- يعكس الإصلاحات المُطبَّقة فعليًا على قاعدة الإنتاج عبر Supabase MCP (20 سبتمبر 2026)
-- بعد فحص get_advisors (security + performance) — راجع STATUS.md لسجل الفحص الكامل

-- === أمان: moderation_log كان محجوبًا ضمنيًا (RLS بلا Policy) — نجعله صريحًا ===
create policy "moderation_log_deny_all" on moderation_log
  for all using (false);

-- === أمان: تثبيت search_path + منع استدعاء الدالة مباشرة عبر RPC ===
create or replace function prevent_owner_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() = 'authenticated' then
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
  end if;
  return new;
end;
$$;

revoke execute on function prevent_owner_status_change() from public, anon, authenticated;

-- === أداء: دمج Policies المزدوجة + لف auth.uid() بـ(select ...) ===
drop policy if exists "businesses_select_approved_public" on businesses;
drop policy if exists "businesses_select_own" on businesses;
create policy "businesses_select" on businesses
  for select using (status = 'approved' or (select auth.uid()) = owner_id);

drop policy if exists "businesses_insert_own" on businesses;
create policy "businesses_insert_own" on businesses
  for insert with check ((select auth.uid()) = owner_id);

drop policy if exists "businesses_update_own" on businesses;
create policy "businesses_update_own" on businesses
  for update using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "reviews_select_approved_public" on reviews;
drop policy if exists "reviews_select_own" on reviews;
create policy "reviews_select" on reviews
  for select using (status = 'approved' or (select auth.uid()) = user_id);

drop policy if exists "reviews_insert_own" on reviews;
create policy "reviews_insert_own" on reviews
  for insert with check ((select auth.uid()) = user_id);

-- === أداء: فهارس Foreign Keys الناقصة ===
create index if not exists idx_businesses_owner on businesses(owner_id);
create index if not exists idx_categories_parent on categories(parent_id);
create index if not exists idx_moderation_log_admin on moderation_log(admin_id);
create index if not exists idx_moderation_log_business on moderation_log(business_id);
create index if not exists idx_reviews_user on reviews(user_id);

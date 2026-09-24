-- 0001_init.sql
-- حسب DATABASE.md المعتمد: businesses / categories / reviews + RLS إلزامية على الكل (D10)

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references categories(id),
  created_at timestamptz not null default now()
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  name text not null,
  description text,
  category_id uuid not null references categories(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  -- قيد صارم: مستخدم واحد = تقييم واحد فقط لكل شركة (SRS.md — US2)
  unique (business_id, user_id)
);

create index idx_businesses_category on businesses(category_id);
create index idx_businesses_status on businesses(status);
create index idx_reviews_business on reviews(business_id);

-- Audit Trail — من راجع ومتى (CLAUDE.md: كل تغيير حالة يُسجَّل بمن قام به ومتى)
create table moderation_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id),
  admin_id uuid not null references auth.users(id),
  decision text not null check (decision in ('approved', 'rejected')),
  reason text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row-Level Security — إلزامية على كل جدول، لا استثناء (D10/CLAUDE.md)
-- =========================================================

alter table categories enable row level security;
alter table businesses enable row level security;
alter table reviews enable row level security;
alter table moderation_log enable row level security;
-- عمدًا بلا أي Policy على moderation_log: RLS مفعّلة (D10 — لا استثناء) لكن بلا Policies
-- تعني حجب الوصول كليًا عبر anon/authenticated؛ يصل إليه service_role فقط من app/api/admin/*

-- categories: قراءة عامة للجميع، كتابة عبر service_role فقط (لا نموذج عام لإضافة تصنيفات)
create policy "categories_select_all" on categories
  for select using (true);

-- businesses: القراءة العامة تقتصر على approved فقط؛ المالك يرى سجلاته كاملة أيًا كانت حالتها
create policy "businesses_select_approved_public" on businesses
  for select using (status = 'approved');

create policy "businesses_select_own" on businesses
  for select using (auth.uid() = owner_id);

-- الإدراج: فقط المستخدم الموثّق يُدرج سجلًا يملكه هو (لا انتحال هوية مالك آخر)
create policy "businesses_insert_own" on businesses
  for insert with check (auth.uid() = owner_id);

-- المالك يعدّل سجله (اسم/وصف/تصنيف) — الحماية من تعديله لـstatus بنفسه تُفرض بـTrigger أدناه، لا بهذه الـPolicy وحدها
create policy "businesses_update_own" on businesses
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- =========================================================
-- ثغرة أمنية اكتُشفت ذاتيًا أثناء مراجعة rls-security-reviewer (subagent المُعرَّف بالقالب):
-- Policy أعلاه تتحقق من الملكية فقط — لا تمنع المالك من إرسال status='approved' مباشرة
-- عبر Supabase client (PostgREST)، متجاوزًا مراجعة الـAdmin كليًا. RLS وحدها عاجزة عن
-- تقييد عمود بعينه؛ الحل: Trigger يُعيد status/rejection_reason لقيمتهما القديمة تلقائيًا
-- إن كان مصدر الطلب دورًا عاديًا (authenticated) لا service_role (لوحة Admin).
-- =========================================================
create or replace function prevent_owner_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.role() = 'authenticated' then
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
  end if;
  return new;
end;
$$;

create trigger businesses_prevent_status_change
  before update on businesses
  for each row execute function prevent_owner_status_change();

-- reviews: القراءة العامة تقتصر على approved فقط
create policy "reviews_select_approved_public" on reviews
  for select using (status = 'approved');

create policy "reviews_select_own" on reviews
  for select using (auth.uid() = user_id);

-- الإدراج: مستخدم موثّق فقط، لنفسه فقط (auth.uid() = user_id يمنع انتحال هوية مقيّم آخر)
create policy "reviews_insert_own" on reviews
  for insert with check (auth.uid() = user_id);

-- ملاحظة أمنية (rls-security-reviewer subagent يفحص هذا تلقائيًا قبل أي Migration جديدة):
-- لا توجد Policy لـ UPDATE/DELETE على businesses.status أو reviews.status من جهة المستخدم العادي —
-- هذه العملية حصرية لدور Admin عبر service_role من الخادم (app/api/admin/*)، لا من الواجهة أبدًا.

import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth/requireAdmin';
import { createAdminSupabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 });
  }

  // service_role يتجاوز RLS عمدًا هنا — مسموح فقط بعد requireAdmin أعلاه (لا استخدام آخر بالكود)
  const supabaseAdmin = createAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true }); // US3 — الأقدم أولًا

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/auth/requireAdmin';
import { createAdminSupabaseClient } from '../../../../../lib/supabase/server';
import { moderationDecisionSchema } from '../../../../../lib/validation/schemas';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = moderationDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabaseAdmin = createAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from('businesses')
    .update({
      status: parsed.data.decision,
      rejection_reason: parsed.data.rejectionReason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit — من راجع ومتى (CLAUDE.md: كل تغيير حالة يُسجَّل)
  await supabaseAdmin.from('moderation_log').insert({
    business_id: params.id,
    admin_id: admin.userId,
    decision: parsed.data.decision,
    reason: parsed.data.rejectionReason ?? null,
  });

  return NextResponse.json({ data });
}

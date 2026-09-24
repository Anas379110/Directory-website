import { createServerSupabaseClient } from '../supabase/server';

/**
 * يتحقق أن المستخدم الحالي مسجّل دخول وله دور admin (عبر app_metadata.role —
 * حقل لا يستطيع المستخدم تعديله بنفسه، يُضبط فقط من لوحة Supabase أو service_role).
 * كل مسار app/api/admin/* يستدعي هذا أولًا قبل أي عملية.
 */
export async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  if (user.app_metadata?.role !== 'admin') return null;

  return { userId: user.id };
}

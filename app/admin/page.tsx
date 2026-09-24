import { requireAdmin } from '../../lib/auth/requireAdmin';
import { createAdminSupabaseClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminQueuePage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/'); // لا صفحة "غير مصرَّح" تكشف وجود لوحة إدارية — إعادة توجيه صامتة

  const supabaseAdmin = createAdminSupabaseClient();
  const { data: pending } = await supabaseAdmin
    .from('businesses')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">طابور المراجعة</h1>
      {!pending || pending.length === 0 ? (
        <p className="text-neutral-500">لا توجد طلبات معلّقة.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-right">
              <th className="py-2">الاسم</th>
              <th>تاريخ الطلب</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((b: { id: string; name: string; created_at: string }) => (
              <tr key={b.id} className="border-b">
                <td className="py-2">{b.name}</td>
                <td>{new Intl.DateTimeFormat('ar').format(new Date(b.created_at))}</td>
                <td className="flex gap-2 py-2">
                  {/* الأزرار الفعلية (Client Component بـ Fetch لـ PATCH /api/admin/queue/:id) تُستكمل بمرحلة UI التفاعلية */}
                  <button className="text-green-700 underline">موافقة</button>
                  <button className="text-red-700 underline">رفض</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

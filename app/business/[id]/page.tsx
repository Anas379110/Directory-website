import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'approved') // RLS تفرض هذا أصلًا؛ صراحة هنا لوضوح النية بالكود
    .single();

  if (!business) return notFound();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, created_at')
    .eq('business_id', params.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return (
    <article>
      <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
      <p className="text-neutral-700 mb-6">{business.description}</p>

      <h2 className="text-xl font-bold mb-3">التقييمات</h2>
      {!reviews || reviews.length === 0 ? (
        <p className="text-neutral-500">لا توجد تقييمات بعد.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r, i) => (
            <li key={i} className="border border-neutral-200 rounded p-3 bg-white">
              <span className="text-amber-600">{'★'.repeat(r.rating)}</span>
              {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

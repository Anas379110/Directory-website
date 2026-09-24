import { createServerSupabaseClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, description')
    .eq('status', 'approved'); // مطابق لـRLS، طبقة أمان مزدوجة

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">دليل الشركات والخدمات</h1>
      {!businesses || businesses.length === 0 ? (
        <p className="text-neutral-500">لا توجد شركات منشورة بعد.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((b) => (
            <a
              key={b.id}
              href={`/business/${b.id}`}
              className="block border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold mb-1">{b.name}</h3>
              <p className="text-sm text-neutral-700">{b.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

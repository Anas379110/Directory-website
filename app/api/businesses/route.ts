import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase/server';
import { businessRegistrationSchema } from '../../../lib/validation/schemas';
import { verifyTurnstile } from '../../../lib/turnstile';

export const dynamic = 'force-dynamic'; // بيانات حيّة — لا Static Generation

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const category = request.nextUrl.searchParams.get('category');

  // RLS تفرض status='approved' تلقائيًا للقراءة العامة — لا حاجة لفلترته يدويًا هنا (طبقة أمان مزدوجة أصلًا)
  let query = supabase.from('businesses').select('*').eq('status', 'approved');
  if (category) query = query.eq('category_id', category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولًا' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = businessRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // FR7 — التحقق الفعلي من Cloudflare Turnstile عبر Siteverify API قبل أي كتابة
  const turnstileValid = await verifyTurnstile(parsed.data.turnstileToken, process.env.TURNSTILE_SECRET_KEY);
  if (!turnstileValid) {
    return NextResponse.json({ error: 'فشل التحقق الأمني (Turnstile)' }, { status: 400 });
  }

  // status يُفرض 'pending' دائمًا بالخادم — لا يُقرأ من مدخلات العميل إطلاقًا (CLAUDE.md)
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      category_id: parsed.data.categoryId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

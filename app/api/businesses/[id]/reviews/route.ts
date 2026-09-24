import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase/server';
import { reviewSchema } from '../../../../../lib/validation/schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // FR3/US2 — تقييم يتطلب تسجيل دخول، لا زوار مجهولين (يمنع Spam)
  if (!user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول لإضافة تقييم' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // user_id يُشتقّ من الجلسة دائمًا — لا يُقرأ من مدخلات العميل (يمنع انتحال هوية مقيّم آخر)
  // القيد Unique(business_id, user_id) بقاعدة البيانات يفرض تقييمًا واحدًا لكل مستخدم لكل شركة
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      business_id: params.id,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      status: 'pending', // FR3 — يدخل pending دائمًا، لا نشر مباشر
    })
    .select()
    .single();

  if (error) {
    // خطأ قيد Unique = المستخدم قيّم هذه الشركة من قبل
    if (error.code === '23505') {
      return NextResponse.json({ error: 'لقد قيّمت هذه الشركة من قبل' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * عميل بصلاحيات المستخدم الموثّق (anon key + جلسته) — يخضع لـRLS الكاملة.
 * يُستخدم بكل Route Handler عادي (تسجيل شركة، إضافة تقييم، قراءة عامة).
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

/**
 * عميل service_role — يتجاوز RLS بالكامل. حصريًا لمسارات app/api/admin/* بعد التحقق
 * من دور Admin صراحة بالكود. ممنوع استيراده بأي ملف Client Component (AGENTS.md/CLAUDE.md).
 */
export function createAdminSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

import { createBrowserClient } from '@supabase/ssr';

// anon key فقط — كل استعلام من هنا يمر عبر RLS الكاملة (لا service_role هنا إطلاقًا)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

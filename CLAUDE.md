# PROJECT BRAIN — اقرأ هذا أولاً

## 1. ملخص المشروع
نبني: Directory — دليل خدمات ومعلومات (الموقع الوحيد من Track B ببرنامج anasnet.com).
النوع: Web App كامل (Next.js App Router + Supabase).
المستخدم: زوار (قراءة فقط)، أصحاب شركات (تسجيل/تعديل)، Admin (مراجعة).

اقرأ قبل أي تعديل:
- `PROJECT.md`, `SRS.md`, `SCOPE.md` الخاصة بموقع Directory.
- `../DECISIONS.md` (D7, D9, D10) و`../ARCHITECTURE.md` (Track B) و`../DATABASE.md`.

## 2. أوامر التشغيل
build: npm run build
dev:   npm run dev
test:  npm run test        (Vitest)
e2e:   npm run test:e2e    (Playwright)
lint:  npm run lint
db:migrate: npx supabase db push

## 3. قواعد الأسلوب
- TypeScript Strict Mode — لا `any`.
- Tailwind CSS فقط.
- `dir="rtl"` إلزامي.
- Zod لكل تحقق مدخلات (Server-side إلزامي، لا يُكتفى بتحقق الواجهة).
- API Routes تحت `app/api/` حصرًا حسب مسودة الـ Endpoints بـ SRS.md.

## 4. هيكلية الملفات
app/
  (public)/       ← صفحات عامة (تصفح/بحث/تفاصيل شركة)
  (auth)/         ← تسجيل دخول/حساب
  admin/          ← لوحة المراجعة (Admin only — محمية بـ Middleware)
  api/            ← Route Handlers
components/
lib/
  supabase/       ← عملاء Supabase (server/client منفصلان)
  validation/     ← Zod schemas

## 5. قواعد لا تتفاوض عليها
- **Row-Level Security (RLS) مفعّلة على كل جدول قبل أي Migration تُدمج — لا استثناء إطلاقًا.**
- كل تسجيل شركة/تقييم يدخل بحالة `pending` — لا نشر مباشر بأي حال.
- Cloudflare Turnstile إلزامي على نموذج تسجيل الشركة — لا تسمح بتجاوزه في أي بيئة عدا Test محليًا.
- كل Endpoint كتابة (POST/PATCH/DELETE) يتطلب Authentication + Authorization عبر دور المستخدم — لا اعتماد على تحقق الواجهة فقط.
- لا Secrets بالكود — مفاتيح Supabase عبر `.env` فقط، ولا تُطبع بالـ Logs.
- Rate Limiting على نقاط الكتابة (Cloudflare + مراجعة لاحقة إن لزم طبقة إضافية).

## 6. السياق الخاص
راجع API Design المسودة بـ SRS.md لمسارات الـ Endpoints الدقيقة قبل إضافة أي مسار جديد لم يُذكر هناك.

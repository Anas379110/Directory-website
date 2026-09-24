# AGENTS.md

## ملخص المشروع
Directory — دليل خدمات (Next.js + Supabase)، الموقع الوحيد بمعمارية Track B ببرنامج anasnet.com.

## أوامر أساسية
- build: npm run build
- test: npm run test
- lint: npm run lint

## قواعد الأسلوب
- TypeScript صارم، لا `any`.
- كل Route Handler يبدأ بـ Validation (Zod) ثم Authorization قبل أي منطق عمل.

## قيود على الوكيل
- لا تعطّل RLS أو تكتب استعلامًا يتجاوزه (مثل استخدام `service_role` key من الواجهة) — ممنوع مطلقًا.
- لا تنشئ مسار كتابة بدون Rate Limiting أو بدون حالة `pending` افتراضية.
- لا تُضف مزودي مصادقة إضافيين (Google/Facebook Auth إلخ) بدون طلب صريح — Supabase Email/Password أو ما يُحدَّد بـ SRS فقط.
- لا تدمج Migration بلا مراجعة RLS Policy المرفقة معها.
- اكتب اختبار Integration لكل Route Handler جديد يمس بيانات حقيقية.

## مرجع القرارات
`../DECISIONS.md` (D10) و`../DATABASE.md` — أي تغيير بمخطط الجداول يمر عبر Migration موثّقة، لا تعديل يدوي على Production.

# تعليمات المشروع الدائمة — GitHub Copilot

## عن المشروع
Directory (Next.js + Supabase) — راجع `CLAUDE.md`/`AGENTS.md` بجذر المستودع، القواعد نفسها تنطبق حرفيًا هنا.

## قواعد عامة
- TypeScript صارم بكل ملف.
- لا تقترح أو تكتب أي استعلام يتجاوز RLS.
- كل نموذج إدخال مستخدم (Client Component) يقابله Validation مطابق Server-side — لا تكتفِ بتحقق الواجهة.
- Cloudflare Turnstile إلزامي على أي نموذج عام جديد يستقبل بيانات غير موثوقة.

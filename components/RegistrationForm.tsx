import { useState } from 'react';
import { businessRegistrationSchema } from '../lib/validation/schemas';

export default function RegistrationForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name') as string,
      description: form.get('description') as string,
      categoryId: form.get('categoryId') as string,
      // التوكن الفعلي يُملأ عبر Turnstile widget JS عند التضمين الحقيقي (data-sitekey)
      turnstileToken: (form.get('cf-turnstile-response') as string) ?? '',
    };

    // فحص أمامي أولي فقط (UX) — التحقق الحقيقي دائمًا خادمي (CLAUDE.md، لا استثناء)
    const clientCheck = businessRegistrationSchema.safeParse(payload);
    if (!clientCheck.success) {
      setStatus('error');
      setErrorMsg('تحقق من الحقول المطلوبة');
      return;
    }

    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.formErrors?.[0] ?? body.error ?? 'حدث خطأ');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4">
        تم استلام طلبك بنجاح — طلبك الآن قيد المراجعة، وسيظهر بالدليل بعد الموافقة.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">اسم الشركة</label>
        <input id="name" name="name" required minLength={2} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">الوصف</label>
        <textarea id="description" name="description" className="w-full border rounded px-3 py-2" rows={4} />
      </div>
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium mb-1">التصنيف</label>
        <select id="categoryId" name="categoryId" required className="w-full border rounded px-3 py-2">
          <option value="">اختر تصنيفًا...</option>
        </select>
      </div>

      {/* Cloudflare Turnstile — يُضمَّن فعليًا عبر السكربت الرسمي + data-sitekey عند النشر الحقيقي (FR7) */}
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-brand text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {status === 'submitting' ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
      </button>
    </form>
  );
}

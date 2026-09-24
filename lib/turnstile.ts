/**
 * التحقق الخادمي من Cloudflare Turnstile (FR7 — إلزامي، غير قابل للتفاوض بـ SRS.md).
 * حقن fetch كوسيط لتسهيل الاختبار بمحاكاة الاستجابة، دون الحاجة لاتصال شبكة فعلي بالاختبارات.
 */
export async function verifyTurnstile(
  token: string,
  secret: string | undefined,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  // بلا مفتاح سري = رفض دائمًا صراحة، لا تمرير صامت بالخطأ (fail-closed لا fail-open)
  if (!secret) return false;
  if (!token || token.trim() === '') return false;

  const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });

  if (!res.ok) return false; // فشل الاتصال بخدمة Turnstile = رفض، لا نجاح افتراضي

  const result = await res.json();
  return result.success === true;
}

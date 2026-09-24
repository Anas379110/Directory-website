import { describe, it, expect, vi } from 'vitest';
import { verifyTurnstile } from './turnstile';

describe('verifyTurnstile — fail-closed لا fail-open (أمان حرج)', () => {
  it('يرفض بلا secret مُهيَّأ إطلاقًا (لا تمرير صامت)', async () => {
    const result = await verifyTurnstile('some-token', undefined);
    expect(result).toBe(false);
  });

  it('يرفض token فارغًا حتى مع secret صالح', async () => {
    const result = await verifyTurnstile('', 'my-secret');
    expect(result).toBe(false);
  });

  it('يقبل عند success=true من Cloudflare', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    const result = await verifyTurnstile('valid-token', 'my-secret', mockFetch as any);
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('يرفض عند success=false من Cloudflare', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const result = await verifyTurnstile('bad-token', 'my-secret', mockFetch as any);
    expect(result).toBe(false);
  });

  it('يرفض عند فشل الاتصال بخدمة Turnstile (res.ok=false) — لا نجاح افتراضي', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    const result = await verifyTurnstile('token', 'my-secret', mockFetch as any);
    expect(result).toBe(false);
  });
});

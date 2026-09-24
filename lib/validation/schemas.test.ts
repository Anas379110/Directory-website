import { describe, it, expect } from 'vitest';
import { businessRegistrationSchema, reviewSchema, moderationDecisionSchema } from './schemas';

describe('businessRegistrationSchema', () => {
  it('يقبل بيانات صالحة كاملة', () => {
    const result = businessRegistrationSchema.safeParse({
      name: 'مكتب محاماة الرياض',
      description: 'خدمات استشارية',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      turnstileToken: 'valid-token',
    });
    expect(result.success).toBe(true);
  });

  it('يرفض اسمًا قصيرًا جدًا', () => {
    const result = businessRegistrationSchema.safeParse({
      name: 'أ',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      turnstileToken: 'token',
    });
    expect(result.success).toBe(false);
  });

  it('يرفض بلا Turnstile token (FR7 إلزامي)', () => {
    const result = businessRegistrationSchema.safeParse({
      name: 'شركة صالحة',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      turnstileToken: '',
    });
    expect(result.success).toBe(false);
  });

  it('يرفض categoryId غير UUID صالح', () => {
    const result = businessRegistrationSchema.safeParse({
      name: 'شركة صالحة',
      categoryId: 'not-a-uuid',
      turnstileToken: 'token',
    });
    expect(result.success).toBe(false);
  });

  it('لا يقبل حقل status مُرسَلًا من العميل — يُتجاهَل لأنه خارج الـ Schema أصلًا', () => {
    const result = businessRegistrationSchema.safeParse({
      name: 'شركة صالحة',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      turnstileToken: 'token',
      status: 'approved', // محاولة تلاعب — Zod يتجاهل الحقول غير المعرَّفة بالـ schema
    });
    expect(result.success).toBe(true);
    expect((result as any).data.status).toBeUndefined();
  });
});

describe('reviewSchema', () => {
  it('يقبل تقييمًا بين 1 و5', () => {
    expect(reviewSchema.safeParse({ rating: 3, comment: 'جيد' }).success).toBe(true);
  });

  it('يرفض تقييمًا خارج المدى (0 أو 6)', () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it('يرفض تقييمًا عشريًا', () => {
    expect(reviewSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });
});

describe('moderationDecisionSchema — US3: سبب مكتوب إلزامي لكل رفض', () => {
  it('يقبل الموافقة بلا سبب', () => {
    expect(moderationDecisionSchema.safeParse({ decision: 'approved' }).success).toBe(true);
  });

  it('يرفض decision=rejected بلا rejectionReason', () => {
    const result = moderationDecisionSchema.safeParse({ decision: 'rejected' });
    expect(result.success).toBe(false);
  });

  it('يقبل الرفض مع سبب مكتوب فعليًا', () => {
    const result = moderationDecisionSchema.safeParse({
      decision: 'rejected',
      rejectionReason: 'بيانات تواصل غير صحيحة',
    });
    expect(result.success).toBe(true);
  });
});

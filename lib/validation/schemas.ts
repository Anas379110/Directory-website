import { z } from 'zod';

// حسب SRS.md FR1 — تسجيل شركة جديدة. لا يُقبل status من العميل إطلاقًا (يُفرض 'pending' بالخادم دائمًا).
export const businessRegistrationSchema = z.object({
  name: z.string().trim().min(2, 'اسم الشركة قصير جدًا').max(120),
  description: z.string().trim().max(2000).optional(),
  categoryId: z.string().uuid('تصنيف غير صالح'),
  turnstileToken: z.string().min(1, 'التحقق الأمني مطلوب'), // FR7 — Cloudflare Turnstile إلزامي
});

export type BusinessRegistrationInput = z.infer<typeof businessRegistrationSchema>;

// حسب SRS.md FR3/US2 — تقييم شركة. لا يُقبل status أو userId من العميل (يُشتقّان من الجلسة بالخادم).
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// حسب SRS.md FR4 — قرار Admin على طابور المراجعة
export const moderationDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().trim().min(3).max(500).optional(),
}).refine((data) => data.decision !== 'rejected' || !!data.rejectionReason, {
  message: 'سبب الرفض إلزامي عند الرفض', // US3 بـ SRS.md: "زر موافقة/رفض بسبب مكتوب لكل رفض"
  path: ['rejectionReason'],
});

export type ModerationDecisionInput = z.infer<typeof moderationDecisionSchema>;

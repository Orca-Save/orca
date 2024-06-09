import dayjs, { Dayjs } from 'dayjs';
import { z } from 'zod';
const zodDay = z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date');

export const onboardingSchema = z.object({
  goalName: z.string().min(1),
  goalAmount: z.coerce.number().min(0),
  goalDueAt: zodDay,

  privacyAgreement: z.boolean().optional(),
  saving: z.string().min(1).nullable().optional(),
  imagePath: z.string().optional(),
  savingAmount: z.coerce.number().min(0).optional(),
  initialAmount: z.coerce.number().min(0).optional(),
});

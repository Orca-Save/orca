import dayjs, { Dayjs } from 'dayjs';
import { z } from 'zod';
const zodDay = z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date');

export const onboardingSchema = z.object({
  goalName: z.string().min(1),
  goalAmount: z.coerce.number().min(0),
  goalDueAt: zodDay,

  imagePath: z
    .string()
    .nullable()
    .optional()
    .refine((value) => value !== null && value !== undefined, {
      message: 'Search for an image to visualize your goal!',
    }),
  id: z.string().optional(),
  privacyAgreement: z.boolean().optional(),
  saving: z.string().min(1).nullable().optional(),
  savingAmount: z.coerce.number().min(0).optional(),
  initialAmount: z.coerce.number().min(0).optional(),
});

import { z } from "zod";

export const onboardingSchema = z.object({
  goalName: z.string().min(1),
  goalAmount: z.number().min(1),
  goalDueAt: z.date().min(new Date()),

  action: z.string().min(1),
  actionAmount: z.number().min(1),

  saving: z.string().min(1),
  savingAmount: z.number().min(1),

  initialAmount: z.number().min(1).optional(),
});

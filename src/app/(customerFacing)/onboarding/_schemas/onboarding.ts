import dayjs, { Dayjs } from "dayjs";
import { z } from "zod";
const zodDay = z.custom<Dayjs>((val) => val instanceof dayjs, "Invalid date");

export const onboardingSchema = z.object({
  goalName: z.string().min(1),
  goalAmount: z.number().min(1),
  goalDueAt: zodDay,

  saving: z.string().min(1).optional(),
  savingAmount: z.number().min(1).optional(),

  initialAmount: z.number().min(1).optional(),
});

import dayjs, { Dayjs } from "dayjs";
import { z } from "zod";
const zodDay = z.custom<Dayjs>((val) => val instanceof dayjs, "Invalid date");

export const onboardingSchema = z.object({
  goalName: z.string().min(1),
  goalAmount: z.coerce.number().min(0),
  goalDueAt: zodDay,

  saving: z.string().min(1).optional(),
  imagePath: z.string().optional(),
  savingAmount: z.coerce.number().min(0).optional(),
  initialAmount: z.coerce.number().min(0).optional(),
});

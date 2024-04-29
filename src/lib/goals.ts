import { GoalFieldErrors } from "@/app/_actions/goals";

export type FieldErrors = { fieldErrors: Record<string, string[]> };
export function isFieldErrors(value: any): value is FieldErrors {
  return (value as GoalFieldErrors).fieldErrors != null;
}

import { GoalFieldErrors } from "@/app/admin/_actions/goals";
import { Goal } from "@prisma/client";

export function isGoalFieldErrors(
  value: GoalFieldErrors | Goal
): value is GoalFieldErrors {
  return (value as GoalFieldErrors).fieldErrors != null;
}

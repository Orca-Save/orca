import { GoalTransferFilter } from "@/app/(customerFacing)/_components/SavingsList";
import { GoalTransferFieldErrors } from "@/app/_actions/goalTransfers";
export const externalAccountId = "faed4327-3a9c-4837-a337-c54e9704d60f";

export function isGoalTransferFieldErrors(
  value: any
): value is GoalTransferFieldErrors {
  return (value as GoalTransferFieldErrors).fieldErrors != null;
}

export type PinnedGoalError = {
  noPinnedGoal: boolean;
};
export function isPinnedGoalError(value: any): value is PinnedGoalError {
  return (value as PinnedGoalError).noPinnedGoal != null;
}

export function isGoalTransferFilter(value: any): value is GoalTransferFilter {
  return value === "templates" || value === "accounts";
}

import { GoalTransferFieldErrors } from "@/app/_actions/goalTransfers";
import { GoalTransfer } from "@prisma/client";
export const externalAccountId = "faed4327-3a9c-4837-a337-c54e9704d60f";

export function isGoalTransferFieldErrors(
  value: GoalTransferFieldErrors | GoalTransfer
): value is GoalTransferFieldErrors {
  return (value as GoalTransferFieldErrors).fieldErrors != null;
}

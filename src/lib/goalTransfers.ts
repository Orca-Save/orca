import { GoalTransferFieldErrors } from "@/app/_actions/goalTransfers";
import { GoalTransfer } from "@prisma/client";

export function isGoalTransferFieldErrors(
  value: GoalTransferFieldErrors | GoalTransfer
): value is GoalTransferFieldErrors {
  return (value as GoalTransferFieldErrors).fieldErrors != null;
}

"use client";

import { addQuickSave } from "@/app/_actions/goalTransfers";
import { formatCurrency } from "@/lib/formatters";
import {
  GoalCategory,
  GoalTransfer as PrismaGoalTransfer,
} from "@prisma/client";
import { Button } from "antd";

type GoalTransfer = PrismaGoalTransfer & {
  category: GoalCategory;
};
export function QuickSaveButton({
  transfer,
  goalId,
}: {
  transfer: GoalTransfer;
  goalId?: string;
}) {
  const onClick = () => {
    if (goalId) addQuickSave(goalId, transfer);
  };

  return (
    <Button
      key={transfer.id}
      disabled={!goalId}
      size="large"
      style={{ height: "auto", width: "auto" }}
      onClick={onClick}
    >
      <p>{transfer.itemName}</p>
      <p>{formatCurrency(transfer.amountInCents / 100)}</p>
      <p>{transfer.category.name}</p>
    </Button>
  );
}

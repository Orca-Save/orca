"use client";

import { addQuickSave } from "@/app/_actions/goalTransfers";
import { formatCurrency } from "@/lib/formatters";
import {
  GoalCategory,
  GoalTransfer as PrismaGoalTransfer,
} from "@prisma/client";
import { Button, Typography } from "antd";

const { Text } = Typography;

type GoalTransfer = PrismaGoalTransfer & {
  category: GoalCategory | null;
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
      <Text>{transfer.itemName}</Text>
      <Text>{formatCurrency(transfer.amount.toNumber())}</Text>
      <Text>{transfer.category?.name}</Text>
    </Button>
  );
}

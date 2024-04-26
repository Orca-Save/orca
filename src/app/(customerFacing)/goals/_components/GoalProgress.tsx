"use client";
import { currencyFormatter } from "@/lib/utils";
import { Flex, Progress, ProgressProps } from "antd";

type GoalProgressProps = {
  target: number;
  currentBalance: number;
};

const twoColors: ProgressProps["strokeColor"] = {
  "0%": "#108ee9",
  "100%": "#87d068",
};

export default function GoalProgress({
  target,
  currentBalance,
}: GoalProgressProps) {
  const percent = (currentBalance / target) * 100;
  return (
    <Flex gap="small">
      {currencyFormatter(currentBalance)}
      <Progress
        percent={percent}
        status="active"
        style={{ marginRight: "1rem" }}
        strokeWidth={13}
        format={() => currencyFormatter(target)}
        strokeColor={twoColors}
      />
    </Flex>
  );
}

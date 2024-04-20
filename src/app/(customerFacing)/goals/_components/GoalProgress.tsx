"use client";
import { currencyFormatter } from "@/lib/utils";
import { Flex, Progress, ProgressProps } from "antd";

type GoalProgressProps = {
  targetInCents: number;
  currentBalanceInCents: number;
};

const twoColors: ProgressProps["strokeColor"] = {
  "0%": "#108ee9",
  "100%": "#87d068",
};

export default function GoalProgress({
  targetInCents,
  currentBalanceInCents,
}: GoalProgressProps) {
  return (
    <Flex gap="small">
      {currencyFormatter(currentBalanceInCents / 100)}
      <Progress
        percent={(currentBalanceInCents / targetInCents) * 100}
        status="active"
        strokeWidth={13}
        format={() => currencyFormatter(targetInCents / 100)}
        strokeColor={twoColors}
      />
    </Flex>
  );
}

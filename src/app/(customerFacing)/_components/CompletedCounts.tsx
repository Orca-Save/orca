import { Text } from "@/app/_components/Typography";
import { formatCurrency } from "@/lib/formatters";
import { greenThemeColors } from "@/lib/utils";
import { Card, Space } from "antd";

export default async function CompletedCounts({
  totalSaved,
  goalsCompleted,
}: {
  totalSaved: number;
  goalsCompleted: number;
}) {
  return (
    <Card>
      <Space
        direction="horizontal"
        style={{
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Text
          style={{
            color: greenThemeColors.colorPrimary,
          }}
        >
          Total saved: {formatCurrency(totalSaved)}
        </Text>
        <Text
          style={{
            color: greenThemeColors.colorPrimary,
          }}
        >
          Goals completed: {goalsCompleted}
        </Text>
      </Space>
    </Card>
  );
}

import { Text } from "@/app/_components/Typography";
import { formatCurrency } from "@/lib/formatters";
import { Card, Space } from "antd";

export default async function CompletedCounts({
  totalSaved,
  goalsCompleted,
}: {
  totalSaved: number;
  goalsCompleted: number;
}) {
  return (
    <Space
      direction="horizontal"
      size="large"
      style={{
        justifyContent: "center",
        width: "100%",
      }}
    >
      <Card>
        <Text>Total saved: {formatCurrency(totalSaved)}</Text>{" "}
        <Text>Goals completed: {goalsCompleted}</Text>
      </Card>
    </Space>
  );
}

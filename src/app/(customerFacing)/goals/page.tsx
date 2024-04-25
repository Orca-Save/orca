import { Card, Skeleton, Space } from "antd";

import IconRoute from "./_components/IconButtonRoute";
import { PlusOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";

const DynamicGoalList = dynamic(() => import("./_components/GoalList"), {
  loading: () => (
    <>
      <Card>
        <Skeleton paragraph={{ rows: 3 }} />
      </Card>
      <Card>
        <Skeleton paragraph={{ rows: 3 }} />
      </Card>
      <Card>
        <Skeleton paragraph={{ rows: 3 }} />
      </Card>
    </>
  ),
});
export default async function GoalsPage() {
  return (
    <Space direction="vertical" className="w-full">
      <IconRoute
        route={"/goals/new"}
        icon={<PlusOutlined />}
        text={"New Goal"}
      />
      <DynamicGoalList />
    </Space>
  );
}

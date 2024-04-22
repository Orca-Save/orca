import { Card, Skeleton } from "antd";

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
    <>
      <IconRoute
        route={"/goals/new"}
        icon={<PlusOutlined />}
        text={"New Goal"}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DynamicGoalList />
      </div>
    </>
  );
}

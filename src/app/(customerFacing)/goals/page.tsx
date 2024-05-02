import { Card, Skeleton, Space } from "antd";

import { completedUserGoalCount } from "@/app/_actions/users";
import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { PlusOutlined } from "@ant-design/icons";
import { getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import CompletedCounts from "../_components/CompletedCounts";
import IconRoute from "./_components/IconButtonRoute";

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
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/");
  }
  if (!isExtendedSession(session)) return null;
  const completedCounts = await completedUserGoalCount(session.user.id);
  return (
    <Space direction="vertical" className="w-full">
      <IconRoute
        route={"/goals/new"}
        icon={<PlusOutlined />}
        text={"New Goal"}
      />
      <div>
        <CompletedCounts
          goalsCompleted={completedCounts.goalsCompleted}
          totalSaved={completedCounts.totalSaved}
        />
      </div>
      <DynamicGoalList />
    </Space>
  );
}

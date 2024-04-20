import { Suspense } from "react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Card, Progress, ProgressProps, Skeleton } from "antd";
import { PlusOutlined, ShareAltOutlined } from "@ant-design/icons";
import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";

import { isExtendedSession } from "@/lib/session";
import PopconfirmDelete from "./_components/PopconfirmDelete";
import EditAction from "../_components/EditAction";
import IconRoute from "./_components/NewGoalButton";
import { currencyFormatter } from "@/lib/utils";
import GoalProgress from "./_components/GoalProgress";
import Meta from "antd/es/card/Meta";

const getGoals = (userId: string) => {
  return db.goal.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
};
const getGoalTransfersSum = (userId: string) => {
  return db.goalTransfer.groupBy({
    by: ["goalId"], // Group by goalId
    _sum: {
      amountInCents: true,
    },
    _count: {
      goalId: true,
    },
    where: {
      goal: {
        userId: userId,
      },
    },
  });
};

export default async function GoalsPage() {
  return (
    <>
      <IconRoute
        route={"/goals/new"}
        icon={<PlusOutlined />}
        text={"New Goal"}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
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
          }
        >
          <GoalsSuspense />
        </Suspense>
      </div>
    </>
  );
}
async function GoalsSuspense() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: "/goals" });
    return;
  }

  if (isExtendedSession(session)) {
    let [goals, sums] = await Promise.all([
      getGoals(session.user.id),
      getGoalTransfersSum(session.user.id),
    ]);
    const goalSumMap = new Map(
      sums.map((item) => [
        item.goalId,
        { amountInCents: item._sum.amountInCents, count: item._count.goalId },
      ])
    );

    return goals.map((goal) => {
      const currentBalanceInCents = goalSumMap.get(goal.id)?.amountInCents || 0;
      const savedItemCount = goalSumMap.get(goal.id)?.count || 0;
      return (
        <Card
          key={goal.id}
          actions={[
            <PopconfirmDelete
              goalId={goal.id}
              key="delete"
              title="Delete the goal"
              description="Are you sure to delete this goal?"
            />,
            <EditAction route={`/goals/${goal.id}/edit`} key="edit" />,
            <ShareAltOutlined key="share" />,
          ]}
        >
          <Meta
            title={goal.name}
            description={"by " + goal.dueAt.toLocaleDateString()}
          />
          <p>Saved {savedItemCount} times!</p>
          <GoalProgress
            currentBalanceInCents={currentBalanceInCents}
            targetInCents={goal.targetInCents}
          />
          <p>{goal.description}</p>
        </Card>
      );
    });
  }
}

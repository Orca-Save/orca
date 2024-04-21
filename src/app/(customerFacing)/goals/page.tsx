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
import IconRoute from "./_components/IconButtonRoute";
import GoalProgress from "./_components/GoalProgress";
import Meta from "antd/es/card/Meta";
import { UserPinType, sortPins } from "@/lib/users";
import PinSavingButton from "@/app/_components/PinSavingButton";
import GoalCard from "../_components/GoalCard";

const getGoals = (userId: string) => {
  return db.goal.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
};
const getGoalTransfersSum = (userId: string) => {
  return db.goalTransfer.groupBy({
    by: ["goalId"],
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

const getUserPins = cache(
  (userId: string) => {
    return db.userPin.findMany({
      where: { type: UserPinType.Goal, userId },
    });
  },
  ["/goals", "getUserPins"]
);

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
    let [goals, sums, userPins] = await Promise.all([
      getGoals(session.user.id),
      getGoalTransfersSum(session.user.id),
      getUserPins(session.user.id),
    ]);
    const goalSumMap = new Map(
      sums.map((item) => [
        item.goalId,
        { amountInCents: item._sum.amountInCents, count: item._count.goalId },
      ])
    );
    const userHasPinnedGoal = userPins.some(
      (pin) => pin.userId === session.user.id
    );
    const goalsWithDetails = goals
      .map((goal) => ({
        ...goal,
        userPinId: userPins.find((pin) => pin.typeId === goal.id)?.id,
        currentBalanceInCents: goalSumMap.get(goal.id)?.amountInCents || 0,
        savedItemCount: goalSumMap.get(goal.id)?.count || 0,
      }))
      .sort(sortPins);
    return goalsWithDetails.map((goal) => {
      return (
        <GoalCard
          revalidatePath="/goals"
          userHasPinnedGoal={userHasPinnedGoal}
          goal={goal}
        />
      );
    });
  }
}

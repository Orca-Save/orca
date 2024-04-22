import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Button, Skeleton, Space } from "antd";
import Link from "next/link";
import { Suspense } from "react";
import GoalCard from "./_components/GoalCard";
import { isExtendedSession } from "@/lib/session";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import { UserPinType } from "@/lib/users";
import { PlusOutlined } from "@ant-design/icons";
import { QuickSaveButton } from "./_components/QuickSaveButton";
import { getPinnedUserGoal, getPinnedUserGoalId } from "./_actions/data";
import { Title } from "../_components/Title";
import authOptions from "@/lib/nextAuthOptions";

const getPinnedGoalTransfers = async (userId: string) => {
  const userPins = await db.userPin.findMany({
    where: {
      userId: userId,
      type: UserPinType.GoalTransfer,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (userPins) {
    const pinnedGoalTransfers = await db.goalTransfer.findMany({
      where: {
        id: {
          in: userPins.map((pin) => pin.typeId),
        },
      },
      include: {
        category: true,
      },
    });
    return pinnedGoalTransfers;
  }

  return null;
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
  ["/", "getUserPins"]
);

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: "/savings" });
    return;
  }
  if (isExtendedSession(session)) {
    return (
      <>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Suspense
            fallback={
              <>
                <Skeleton paragraph={{ rows: 4 }} />
              </>
            }
          >
            <GoalSuspense userId={session.user.id} />
          </Suspense>

          <Link href="/savings/new">
            <Button
              icon={<PlusOutlined />}
              size="large"
              type="primary"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Save
            </Button>
          </Link>
          <Link href="/savings/new">
            <Button
              icon={<PlusOutlined />}
              size="large"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Buy
            </Button>
          </Link>

          <Title level={4}>One-tap Impulse Saves</Title>

          <Suspense
            fallback={
              <>
                <Skeleton paragraph={{ rows: 3 }} />
              </>
            }
          >
            <QuickSaveButtons userId={session.user.id} />
          </Suspense>
        </Space>
      </>
    );
  }
}

async function QuickSaveButtons({ userId }: { userId: string }) {
  const [quickTransfers, goalId] = await Promise.all([
    getPinnedGoalTransfers(userId),
    getPinnedUserGoalId(userId),
  ]);

  if (!quickTransfers) return <div>No Pinned Goal Transfers.</div>;

  return (
    <>
      {!goalId && <Title level={4}>No Pinned Goal.</Title>}
      <Space wrap>
        {quickTransfers.map((transfer) => (
          <QuickSaveButton
            key={transfer.id}
            transfer={transfer}
            goalId={goalId}
          />
        ))}
      </Space>
    </>
  );
}

async function GoalSuspense({ userId }: { userId: string }) {
  const [goal, sums, userPins] = await Promise.all([
    getPinnedUserGoal(userId),
    getGoalTransfersSum(userId),
    getUserPins(userId),
  ]);
  if (!goal) return <Title>No Pinned Goal.</Title>;

  const goalSumMap = new Map(
    sums.map((item) => [
      item.goalId,
      { amountInCents: item._sum.amountInCents, count: item._count.goalId },
    ])
  );
  const userHasPinnedGoal = userPins.some((pin) => pin.userId === userId);
  let goalDetail = Object.assign(goal, {
    userPinId: userPins.find((pin) => pin.typeId === goal.id)?.id,
    currentBalanceInCents: goalSumMap.get(goal.id)?.amountInCents || 0,
    savedItemCount: goalSumMap.get(goal.id)?.count || 0,
  });
  return (
    <GoalCard
      revalidatePath="/"
      goal={goalDetail}
      userHasPinnedGoal={userHasPinnedGoal}
    />
  );
}

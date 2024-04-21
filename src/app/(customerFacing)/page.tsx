import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Goal } from "@prisma/client";
import { Button, Card, Grid, Skeleton, Space } from "antd";
import Link from "next/link";
import { Suspense } from "react";
import GoalCard from "./_components/GoalCard";
import { isExtendedSession } from "@/lib/session";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { UserPinType } from "@/lib/users";
import { PlusOutlined } from "@ant-design/icons";
import { formatCurrency } from "@/lib/formatters";

const getPinnedUserGoal = async (userId: string) => {
  const userPin = await db.userPin.findFirst({
    where: {
      userId: userId,
      type: UserPinType.Goal,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (userPin) {
    const pinnedGoal = await db.goal.findUnique({
      where: {
        id: userPin.typeId,
      },
    });
    return pinnedGoal;
  }

  return null;
};

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
      <main
      // className="space-y-12"
      >
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

          <p>One-tap Impulse Saves</p>

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
      </main>
    );
  }
}

async function QuickSaveButtons({ userId }: { userId: string }) {
  const quickTransfers = await getPinnedGoalTransfers(userId);

  if (!quickTransfers) return <div>No Pinned Goal Transfers.</div>;

  return (
    <Space wrap>
      {quickTransfers.map((transfer) => (
        <Button
          key={transfer.id}
          size="large"
          style={{ height: "auto", width: "auto" }}
        >
          <p>{transfer.itemName}</p>
          <p>{formatCurrency(transfer.amountInCents / 100)}</p>
          <p>{transfer.category.name}</p>
        </Button>
      ))}
    </Space>
  );
}

async function GoalSuspense({ userId }: { userId: string }) {
  const [goal, sums, userPins] = await Promise.all([
    getPinnedUserGoal(userId),
    getGoalTransfersSum(userId),
    getUserPins(userId),
  ]);
  if (!goal) return <div>No Pinned Goal.</div>;

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

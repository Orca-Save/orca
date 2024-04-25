import { cache } from "@/lib/cache";
import GoalCard from "./GoalCard";
import db from "@/db/db";
import { UserPinType } from "@/lib/users";
import { getPinnedUserGoal } from "../_actions/data";
import { Title } from "@/app/_components/Typography";

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

export default async function DashGoalCard({ userId }: { userId: string }) {
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

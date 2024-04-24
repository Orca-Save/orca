import db from "@/db/db";
import { cache } from "@/lib/cache";
import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { UserPinType, sortPins } from "@/lib/users";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import GoalCard from "../../_components/GoalCard";
import { Title } from "@/app/_components/Title";
import { baseURL } from "@/lib/utils";

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

export default async function GoalsSuspense() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: baseURL + "/goals" });
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
    const pinnedGoals = goalsWithDetails.filter((x) => x.userPinId);
    return (
      <>
        <Title level={4}>
          {pinnedGoals.length ? "Focus Goal" : "No Focus Goal"}
        </Title>
        {pinnedGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            revalidatePath="/goals"
            userHasPinnedGoal={userHasPinnedGoal}
            goal={goal}
          />
        ))}
        <Title level={4}>
          {goalsWithDetails.length ? "Goals" : "No Goals"}
        </Title>
        {goalsWithDetails
          .filter((x) => !x.userPinId)
          .map((goal) => (
            <GoalCard
              key={goal.id}
              revalidatePath="/goals"
              userHasPinnedGoal={userHasPinnedGoal}
              goal={goal}
            />
          ))}
      </>
    );
  }
  return <Title> Sign in required</Title>;
}

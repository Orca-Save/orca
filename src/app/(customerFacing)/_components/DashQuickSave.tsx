import { Text } from "@/app/_components/Typography";
import db from "@/db/db";
import { Space } from "antd";
import { getPinnedUserGoal } from "../_actions/data";
import { QuickSaveButton } from "./QuickSaveButton";

const getPinnedGoalTransfers = async (userId: string) => {
  return db.goalTransfer.findMany({
    where: {
      userId,
      pinned: true,
    },
    include: {
      category: true,
    },
  });
};

export default async function QuickSaveButtons({ userId }: { userId: string }) {
  const [quickTransfers, goal] = await Promise.all([
    getPinnedGoalTransfers(userId),
    getPinnedUserGoal(userId),
  ]);

  if (!quickTransfers) return <Text>No Pinned One-Tap Saves.</Text>;
  if (!goal) return <Text>No Pinned Goal.</Text>;

  return (
    <>
      <Space wrap>
        {quickTransfers.map((transfer) => (
          <QuickSaveButton
            key={transfer.id}
            transfer={transfer}
            goalId={goal.id}
          />
        ))}
      </Space>
    </>
  );
}

import { Text, Title } from "@/app/_components/Typography";
import db from "@/db/db";
import { UserPinType } from "@/lib/users";
import { Space } from "antd";
import { getPinnedUserGoalId } from "../_actions/data";
import { QuickSaveButton } from "./QuickSaveButton";

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

export default async function QuickSaveButtons({ userId }: { userId: string }) {
  const [quickTransfers, goalId] = await Promise.all([
    getPinnedGoalTransfers(userId),
    getPinnedUserGoalId(userId),
  ]);

  if (!quickTransfers) return <Text>No Pinned Goal Transfers.</Text>;

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

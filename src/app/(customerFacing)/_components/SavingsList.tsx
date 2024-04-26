import PinSavingButton from "@/app/_components/PinSavingButton";
import { Text, Title } from "@/app/_components/Typography";
import db from "@/db/db";
import { externalAccountId } from "@/lib/goalTransfers";
import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { UserPinType, sortPins } from "@/lib/users";
import { baseURL, currencyFormatter } from "@/lib/utils";
import {
  GoalCategory,
  GoalTransfer as PrismaGoalTransfer,
} from "@prisma/client";
import { Avatar, Card, Space } from "antd";
import Meta from "antd/es/card/Meta";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import EditAction from "./EditAction";
import PopconfirmDelete from "./PopconfirmDelete";

type GoalTransfer = PrismaGoalTransfer & {
  category: GoalCategory | null;
  userPinId?: string;
};
export type GoalTransferFilter = "templates" | "accounts";
const getGoalTransfers = (userId: string, filter?: GoalTransferFilter) => {
  const where: {
    userId: string;
    goalId: null | { not: null };
    categoryId?: string;
  } = { userId, goalId: { not: null } };
  if (filter === "templates") where.goalId = null;
  if (filter === "accounts") where.categoryId = externalAccountId;
  return db.goalTransfer.findMany({
    where,
    include: { category: true },
    orderBy: { transactedAt: "desc" },
  });
};
const getUserPins = (userId: string) => {
  return db.userPin.findMany({
    where: { type: UserPinType.GoalTransfer, userId },
  });
};
export default async function SavingsList({
  filter,
  routeParams,
}: {
  filter?: GoalTransferFilter;
  routeParams: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", {
      callbackUrl: baseURL + "/savings",
    });
    return;
  }
  if (isExtendedSession(session)) {
    const [goalTransfers, userPins] = await Promise.all([
      getGoalTransfers(session.user.id, filter),
      getUserPins(session.user.id),
    ]);

    const goalTransfersWithPins = goalTransfers
      .map((goalTransfer) => ({
        ...goalTransfer,
        userPinId: userPins.find((pin) => pin.typeId === goalTransfer.id)?.id,
      }))
      .sort(sortPins);
    const pinnedGoalTransfers = goalTransfersWithPins.filter(
      (x) => x.userPinId
    );
    const pinnedTitle =
      filter === "templates" ? "Pinned One-tap Impulse Saves" : "Pinned Saves";
    const otherTitle = filter === "templates" ? "" : "Savings";
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        {pinnedGoalTransfers.length ? (
          <Space className="center-space">
            <Title level={4}>{pinnedTitle}</Title>
          </Space>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pinnedGoalTransfers.map((goalTransfer) => (
            <GoalTransferCard
              key={goalTransfer.id}
              routeParams={routeParams}
              goalTransfer={goalTransfer}
              userId={session.user.id}
            />
          ))}
        </div>
        <Space className="center-space">
          <Title level={4}>{otherTitle}</Title>
        </Space>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goalTransfersWithPins
            .filter((x) => !x.userPinId)
            .map((goalTransfer) => (
              <GoalTransferCard
                key={goalTransfer.id}
                routeParams={routeParams}
                goalTransfer={goalTransfer}
                userId={session.user.id}
              />
            ))}
        </div>
      </Space>
    );
  }
}

function GoalTransferCard({
  goalTransfer,
  userId,
  routeParams,
}: {
  goalTransfer: GoalTransfer;
  userId: string;
  routeParams: string;
}) {
  const amount = goalTransfer.amount.toNumber();
  return (
    <Card
      key={goalTransfer.id}
      actions={[
        <PopconfirmDelete
          goalTransferId={goalTransfer.id}
          key="delete"
          title="Delete the goal"
          description="Are you sure to delete this goal?"
        />,
        <EditAction
          key="edit"
          route={`/savings/${goalTransfer.id}/edit` + routeParams}
        />,
        <PinSavingButton
          key="pin"
          userPinId={goalTransfer.userPinId}
          typeId={goalTransfer.id}
          type={UserPinType.GoalTransfer}
          userId={userId}
        />,
      ]}
    >
      <Meta
        avatar={
          <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
        }
        title={goalTransfer.itemName}
        description={goalTransfer.category?.name}
      />
      <Text type={amount < 0 ? "danger" : undefined}>
        {currencyFormatter(amount)}
      </Text>
    </Card>
  );
}

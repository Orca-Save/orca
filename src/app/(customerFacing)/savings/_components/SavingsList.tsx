import db from "@/db/db";
import { cache } from "@/lib/cache";
import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { UserPinType, sortPins } from "@/lib/users";
import { Avatar, Card } from "antd";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import PopconfirmDelete from "./PopconfirmDelete";
import EditAction from "../../_components/EditAction";
import PinSavingButton from "@/app/_components/PinSavingButton";
import Meta from "antd/es/card/Meta";
import { baseURL, currencyFormatter } from "@/lib/utils";
import { externalAccountId } from "@/lib/goalTransfers";

export type GoalTransferFilter = "templates" | "accounts";
const getGoalTransfers = cache(
  (userId: string, filter?: GoalTransferFilter) => {
    const where: {
      userId: string;
      goalId: null | { not: null };
      categoryId?: string;
    } = { userId, goalId: { not: null } };
    if (filter === "templates") where.goalId = null;
    if (filter === "accounts") where.categoryId = externalAccountId;
    return db.goalTransfer.findMany({
      where,
      include: { goal: true, category: true },
      orderBy: { transactedAt: "desc" },
    });
  },
  ["/savings", "getGoalTransfers"]
);
const getUserPins = cache(
  (userId: string) => {
    return db.userPin.findMany({
      where: { type: UserPinType.GoalTransfer, userId },
    });
  },
  ["/savings", "getUserPins"]
);

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
    return goalTransfersWithPins.map((goalTransfer) => {
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
              userId={session.user.id}
            />,
          ]}
        >
          <Meta
            avatar={
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
            }
            title={goalTransfer.itemName}
            description={goalTransfer.category.name}
          />
          <p>
            {currencyFormatter((goalTransfer.amountInCents / 100).toString())}
          </p>
        </Card>
      );
    });
  }
}

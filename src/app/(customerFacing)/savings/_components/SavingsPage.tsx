import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { isExtendedSession } from "@/lib/session";
import { Avatar, Card, Skeleton, Tabs } from "antd";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import Meta from "antd/es/card/Meta";

import { currencyFormatter } from "@/lib/utils";
import PinSavingButton from "@/app/_components/PinSavingButton";
import { UserPinType, sortPins } from "@/lib/users";
import PopconfirmDelete from "./PopconfirmDelete";
import EditAction from "../../_components/EditAction";
import { Suspense } from "react";
import IconRoute from "../../goals/_components/IconButtonRoute";
import { PlusOutlined } from "@ant-design/icons";

type Filter = "templates" | "accounts";
const getGoalTransfers = cache(
  (userId: string, filter?: Filter) => {
    const externalAccountId = "faed4327-3a9c-4837-a337-c54e9704d60f";
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

export default async function SavingsPage({
  filter,
  newButtonText,
}: {
  filter?: Filter;
  newButtonText: string;
}) {
  let routeParams = "";
  if (filter === "accounts") routeParams = "?filter=accounts";
  if (filter === "templates") routeParams = "?filter=templates";
  return (
    <>
      <IconRoute
        icon={<PlusOutlined />}
        route={"/savings/new" + routeParams}
        text={newButtonText}
        key="newSaving"
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
          <SavingsList filter={filter} routeParams={routeParams} />
        </Suspense>
      </div>
    </>
  );
}

async function SavingsList({
  filter,
  routeParams,
}: {
  filter?: Filter;
  routeParams: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: "/savings" });
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
              userPinId={goalTransfer.userPinId}
              typeId={goalTransfer.id}
              type={UserPinType.GoalTransfer}
              revalidatePath="/savings"
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

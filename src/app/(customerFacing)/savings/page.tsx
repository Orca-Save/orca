import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { isExtendedSession } from "@/lib/session";
import { Avatar, Button, Card, Input, Skeleton } from "antd";
import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";
import { Suspense } from "react";
import EditAction from "../_components/EditAction";
import { PlusOutlined, PushpinOutlined } from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import IconRoute from "../goals/_components/NewGoalButton";
import { currencyFormatter } from "@/lib/utils";
import PopconfirmDelete from "./_components/PopconfirmDelete";
import PinSavingButton from "@/app/_components/PinSavingButton";
import { UserPinType, sortPins } from "@/lib/users";
import { Dayjs } from "dayjs";
const getGoalTransfers = cache(
  (userId: string) => {
    return db.goalTransfer.findMany({
      where: { userId },
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
export default function MySavingsPage() {
  return (
    <>
      <IconRoute
        icon={<PlusOutlined />}
        route="/savings/new"
        text="New Saving"
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
          <GoalTransferSuspense />
        </Suspense>
      </div>
    </>
  );
}

async function GoalTransferSuspense() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: "/savings" });
    return;
  }
  if (isExtendedSession(session)) {
    const [goalTransfers, userPins] = await Promise.all([
      getGoalTransfers(session.user.id),
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
              route={`/savings/${goalTransfer.id}/edit`}
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
          {/* <p>{goalTransfer.itemName}</p>
          <p>{goalTransfer.categoryId}</p> */}
          <p>
            {currencyFormatter((goalTransfer.amountInCents / 100).toString())}
          </p>
        </Card>
      );
    });
  }
}

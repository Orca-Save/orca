import PinSavingButton from "@/app/_components/PinSavingButton";
import { Text, Title } from "@/app/_components/Typography";
import { currencyFormatter } from "@/lib/utils";
import { GoalTransfer } from "@prisma/client";
import { Avatar, Card, Space } from "antd";
import Meta from "antd/es/card/Meta";
import EditAction from "./EditAction";
import PopconfirmDelete from "./PopconfirmDelete";

export type GoalTransferFilter = "templates" | "accounts";

export default async function SavingsList({
  filter,
  routeParams,
  topGoalTransfers,
  bottomGoalTransfers,
}: {
  filter?: GoalTransferFilter;
  routeParams: string;
  topGoalTransfers?: GoalTransfer[];
  bottomGoalTransfers: GoalTransfer[];
}) {
  const isTemplates = filter === "templates";
  const pinnedTitle = isTemplates ? "Pinned" : "";
  const otherTitle = isTemplates ? "One-Tap Saves" : "";

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {isTemplates ? (
        <>
          <Space className="center-space">
            <Title level={4}>{pinnedTitle}</Title>
          </Space>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topGoalTransfers?.map((goalTransfer) => (
              <GoalTransferCard
                key={goalTransfer.id}
                routeParams={routeParams}
                goalTransfer={goalTransfer}
              />
            ))}
          </div>
        </>
      ) : null}
      <Space className="center-space">
        <Title level={4}>{otherTitle}</Title>
      </Space>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bottomGoalTransfers.map((goalTransfer) => (
          <GoalTransferCard
            key={goalTransfer.id}
            routeParams={routeParams}
            goalTransfer={goalTransfer}
          />
        ))}
      </div>
    </Space>
  );
}

function GoalTransferCard({
  goalTransfer,
  routeParams,
}: {
  goalTransfer: GoalTransfer;
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
          title="Delete the saving"
          description="Are you sure to delete this saving?"
        />,
        <EditAction
          key="edit"
          route={`/savings/${goalTransfer.id}/edit` + routeParams}
        />,
        <PinSavingButton
          key="pin"
          type="GoalTransfer"
          typeId={goalTransfer.id}
          userHasPinnedGoal={false}
          pinned={goalTransfer.pinned}
        />,
      ]}
    >
      <Meta
        avatar={
          <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />
        }
        title={goalTransfer.itemName}
        description={goalTransfer.transactedAt?.toDateString()}
      />
      <Text type={amount < 0 ? "danger" : undefined}>
        {currencyFormatter(amount)}
      </Text>
    </Card>
  );
}

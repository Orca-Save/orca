import { greenThemeColors } from "@/lib/utils";
import { PlusOutlined } from "@ant-design/icons";
import { GoalTransfer } from "@prisma/client";
import { Button, Card, ConfigProvider, Skeleton, Space } from "antd";
import dynamic from "next/dynamic";
import Link from "next/link";
import { GoalTransferFilter } from "./SavingsList";
const DynamicSavingsList = dynamic(() => import("./SavingsList"), {
  loading: () => (
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
  ),
});
export default async function SavingsPage({
  filter,
  newSaveText,
  newPurchaseText,
  saveHref,
  buyHref,
  hide,
  bottomGoalTransfers,
  topGoalTransfers,
}: {
  filter?: GoalTransferFilter;
  newPurchaseText?: string;
  newSaveText: string;
  saveHref: string;
  buyHref: string;
  bottomGoalTransfers: GoalTransfer[];
  topGoalTransfers?: GoalTransfer[];
  hide?: boolean;
}) {
  let routeParams = "";
  if (filter === "accounts") routeParams = "?filter=accounts";
  if (filter === "templates") routeParams = "?filter=templates";
  return (
    <>
      <Space
        direction="horizontal"
        style={{ justifyContent: "center", width: "100%" }}
      >
        {!hide ? (
          <Link href={saveHref + routeParams}>
            <ConfigProvider
              theme={{
                components: {
                  Button: greenThemeColors,
                },
              }}
            >
              <Button
                type="primary"
                style={{ color: "black" }}
                icon={<PlusOutlined />}
              >
                {newSaveText}
              </Button>
            </ConfigProvider>
          </Link>
        ) : null}
        {filter === undefined && (
          <Link href={buyHref}>
            <Button icon={<PlusOutlined />}>{newPurchaseText}</Button>
          </Link>
        )}
      </Space>
      <DynamicSavingsList
        bottomGoalTransfers={bottomGoalTransfers}
        topGoalTransfers={topGoalTransfers}
        filter={filter}
        routeParams={routeParams}
      />
    </>
  );
}

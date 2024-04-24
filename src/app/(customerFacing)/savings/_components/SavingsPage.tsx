import { Card, Skeleton } from "antd";
import { Suspense } from "react";
import IconRoute from "../../goals/_components/IconButtonRoute";
import { PlusOutlined } from "@ant-design/icons";
import { GoalTransferFilter } from "./SavingsList";
import dynamic from "next/dynamic";
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
  newButtonText,
}: {
  filter?: GoalTransferFilter;
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
      <DynamicSavingsList filter={filter} routeParams={routeParams} />
    </>
  );
}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DynamicSavingsList filter={filter} routeParams={routeParams} />
      </div>
    </>
  );
}

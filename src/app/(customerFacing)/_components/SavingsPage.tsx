import { Button, Card, Skeleton, Space } from "antd";
import { Suspense } from "react";
import IconRoute from "../goals/_components/IconButtonRoute";
import { PlusOutlined } from "@ant-design/icons";
import { GoalTransferFilter } from "./SavingsList";
import dynamic from "next/dynamic";
import Link from "next/link";
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
}: {
  filter?: GoalTransferFilter;
  newPurchaseText?: string;
  newSaveText: string;
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
        <Link href={"/savings/new"}>
          <Button type="primary" icon={<PlusOutlined />}>
            {newSaveText}
          </Button>
        </Link>
        {filter === undefined && (
          <Link href={"/savings/new?filter=templates"}>
            <Button icon={<PlusOutlined />}>{newPurchaseText}</Button>
          </Link>
        )}
      </Space>
      <DynamicSavingsList filter={filter} routeParams={routeParams} />
    </>
  );
}

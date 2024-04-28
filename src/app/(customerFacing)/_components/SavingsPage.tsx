import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Skeleton, Space } from "antd";
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
}: {
  filter?: GoalTransferFilter;
  newPurchaseText?: string;
  newSaveText: string;
  saveHref: string;
  buyHref: string;
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
            <Button type="primary" icon={<PlusOutlined />}>
              {newSaveText}
            </Button>
          </Link>
        ) : null}
        {filter === undefined && (
          <Link href={buyHref}>
            <Button icon={<PlusOutlined />}>{newPurchaseText}</Button>
          </Link>
        )}
      </Space>
      <DynamicSavingsList filter={filter} routeParams={routeParams} />
    </>
  );
}

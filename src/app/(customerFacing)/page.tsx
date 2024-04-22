import { Button, Skeleton, Space } from "antd";
import Link from "next/link";
import dynamic from "next/dynamic";

import { isExtendedSession } from "@/lib/session";
import { signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import { PlusOutlined } from "@ant-design/icons";
import { Title } from "../_components/Title";
import authOptions from "@/lib/nextAuthOptions";

const DynamicPinnedGoal = dynamic(() => import("./_components/DashGoalCard"), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});
const DynamicQuickSave = dynamic(() => import("./_components/DashQuickSave"), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: "/savings" });
    return;
  }
  if (isExtendedSession(session)) {
    return (
      <>
        <Space direction="vertical" style={{ width: "100%" }}>
          <DynamicPinnedGoal userId={session.user.id} />
          <Link href="/savings/new">
            <Button
              icon={<PlusOutlined />}
              size="large"
              type="primary"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Save
            </Button>
          </Link>
          <Link href="/savings/new">
            <Button
              icon={<PlusOutlined />}
              size="large"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Buy
            </Button>
          </Link>

          <Title level={4}>One-tap Impulse Saves</Title>

          <DynamicQuickSave userId={session.user.id} />
        </Space>
      </>
    );
  }
}

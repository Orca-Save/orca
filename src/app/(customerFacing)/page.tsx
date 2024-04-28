import { Button, Skeleton, Space } from "antd";
import dynamic from "next/dynamic";
import Link from "next/link";

import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { PlusOutlined } from "@ant-design/icons";
import { getServerSession } from "next-auth";
import { Title } from "../_components/Typography";
import SignUpPage from "./_components/SignUpPage";

const DynamicPinnedGoal = dynamic(() => import("./_components/DashGoalCard"), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});
const DynamicQuickSave = dynamic(() => import("./_components/DashQuickSave"), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <SignUpPage />;
  }
  if (isExtendedSession(session)) {
    return (
      <>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={4}>Focus Goal</Title>
          <DynamicPinnedGoal userId={session.user.id} />
          <Link href="/savings/impulseSave">
            <Button
              icon={<PlusOutlined />}
              size="large"
              type="primary"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Save
            </Button>
          </Link>
          <Link href="/purchases/impulseBuy">
            <Button
              icon={<PlusOutlined />}
              size="large"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Buy
            </Button>
          </Link>

          <Title level={4}>Quick Saves</Title>

          <DynamicQuickSave userId={session.user.id} />
        </Space>
      </>
    );
  }
}

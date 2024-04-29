import { Button, Skeleton, Space } from "antd";
import dynamic from "next/dynamic";
import Link from "next/link";

import db from "@/db/db";
import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { PlusOutlined } from "@ant-design/icons";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Title } from "../_components/Typography";
import ConfettiComp from "./_components/Confetti";
import SignUpPage from "./_components/SignUpPage";

const DynamicPinnedGoal = dynamic(() => import("./_components/DashGoalCard"), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});
const DynamicQuickSave = dynamic(() => import("./_components/DashQuickSave"), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});

const getOnboardingProfileCount = (userId: string) => {
  return db.onboardingProfile.count({
    where: {
      userId: userId,
    },
  });
};

export default async function HomePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <SignUpPage />;
  }
  if (isExtendedSession(session)) {
    const onboardingProfileCount = await getOnboardingProfileCount(
      session.user.id
    );
    if (session.isNewUser || onboardingProfileCount === 0)
      redirect("/onboarding");
    return (
      <>
        <ConfettiComp run={searchParams?.confetti === "true"} path="/" />
        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={4}>Focus Goal</Title>
          <DynamicPinnedGoal userId={session.user.id} />
          <Link href="/savings/impulseSave/new">
            <Button
              icon={<PlusOutlined />}
              size="large"
              type="primary"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Save
            </Button>
          </Link>
          <Link href="/purchases/impulseBuy/new">
            <Button
              icon={<PlusOutlined />}
              size="large"
              style={{ width: "100%", height: "90px" }}
            >
              Impulse Buy
            </Button>
          </Link>

          <Title level={4}>One-tap Saves</Title>

          <DynamicQuickSave userId={session.user.id} />
        </Space>
      </>
    );
  }
}

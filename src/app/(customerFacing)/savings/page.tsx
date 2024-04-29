import db from "@/db/db";
import { externalAccountId } from "@/lib/goalTransfers";
import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { Tabs, TabsProps } from "antd";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ConfettiComp from "../_components/Confetti";
import SavingsPage from "../_components/SavingsPage";

const getGoalTransfers = (userId: string) => {
  return db.goalTransfer.findMany({
    where: {
      userId,
    },
    include: { category: true },
    orderBy: { transactedAt: "desc" },
  });
};

export default async function MySavingsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect("/");

  const goalTransfers = await getGoalTransfers(session.user.id);
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Log",
      children: (
        <SavingsPage
          bottomGoalTransfers={goalTransfers.filter(
            (transfer) =>
              transfer.goalId !== null || transfer.amount.toNumber() < 0
          )}
          saveHref="/savings/impulseSave/new"
          buyHref="/purchases/impulseBuy/new"
          newSaveText="Impulse Save"
          newPurchaseText="Impulse Buy"
        />
      ),
    },
    {
      key: "2",
      label: "One-Tap",
      children: (
        <SavingsPage
          topGoalTransfers={goalTransfers.filter((transfer) => transfer.pinned)}
          bottomGoalTransfers={goalTransfers.filter(
            (transfer) =>
              !transfer.goalId &&
              !transfer.pinned &&
              transfer.amount.toNumber() > 0
          )}
          saveHref="/savings/oneTapSave/new"
          buyHref="/purchases/impulseBuy/new"
          newSaveText="Add One-Tap Save"
          filter="templates"
        />
      ),
    },
    {
      key: "3",
      label: "External",
      children: (
        <SavingsPage
          bottomGoalTransfers={goalTransfers.filter(
            (transfer) => transfer.categoryId === externalAccountId
          )}
          saveHref="/savings/oneTapSave/new?filter=templates"
          buyHref="/purchases/impulseBuy"
          newSaveText="New External Account"
          filter="accounts"
          hide={true}
        />
      ),
    },
  ];
  return (
    <>
      <ConfettiComp run={searchParams?.confetti === "true"} path="/savings" />
      <Tabs centered defaultActiveKey="1" items={items} />
    </>
  );
}

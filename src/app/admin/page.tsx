import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Card } from "antd";

const { Meta } = Card;
async function getSavingsData() {
  const data = await db.saving.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });

  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSavings: data._count,
  };
}

async function getUserData() {
  const [userCount, transferData] = await Promise.all([
    db.user.count(),
    db.saving.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (transferData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getgoalData() {
  const activeCount = await db.goal.count();

  return { activeCount };
}

export default async function AdminDashboard() {
  const [savingsData, userData, goalData] = await Promise.all([
    getSavingsData(),
    getUserData(),
    getgoalData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Savings"
        subtitle={`${formatNumber(savingsData.numberOfSavings)} Savings`}
        body={formatCurrency(savingsData.amount)}
      />
      <DashboardCard
        title="Customers"
        subtitle={`${formatCurrency(
          userData.averageValuePerUser
        )} Average Value`}
        body={formatNumber(userData.userCount)}
      />
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card title={title}>
      <h3>{subtitle}</h3>
      {body}
    </Card>
  );
}

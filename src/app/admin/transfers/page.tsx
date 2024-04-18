import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import { PageHeader } from "../_components/PageHeader";
import { Table } from "antd";

function getSavings() {
  return db.saving.findMany({
    select: {
      id: true,
      pricePaidInCents: true,
      goal: { select: { name: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default function SavingsPage() {
  return (
    <>
      <PageHeader>Savings</PageHeader>
      <SavingsTable />
    </>
  );
}
const columns = [
  {
    title: "Goal",
    dataIndex: "goalName",
    key: "name",
  },
  {
    title: "User",
    dataIndex: "user",
    key: "user",
  },
  {
    title: "Balance",
    dataIndex: "balanceInCents",
    key: "balanceInCents",
  },
];
async function SavingsTable() {
  const savings = await getSavings();

  if (savings.length === 0) return <p>No savings found</p>;

  return (
    <Table
      columns={columns}
      dataSource={savings.map((saving) => ({
        key: saving.id,
        goalName: saving.goal.name,
        user: saving.user.email,
        balance: formatCurrency(saving.pricePaidInCents / 100),
      }))}
    />
  );
}

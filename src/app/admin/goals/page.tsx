import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Button, Table } from "antd";

export default function AdminGoalsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Goals</PageHeader>
        <Button>
          <Link href="/admin/goals/new">Add Goal</Link>
        </Button>
      </div>
      <GoalsTable />
    </>
  );
}
const columns = [
  {
    title: "Available For Purchase",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Name",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Balance",
    dataIndex: "balanceInCents",
    key: "balanceInCents",
  },
  {
    title: "Savings",
    dataIndex: "savings",
    key: "savings",
  },
];
async function GoalsTable() {
  const goals = await db.goal.findMany({
    select: {
      id: true,
      name: true,
      balanceInCents: true,
      _count: { select: { savings: true } },
    },
    orderBy: { name: "asc" },
  });

  if (goals.length === 0) return <p>No goals found</p>;
  /* // <DropdownMenuItem asChild>
                  //   <a download href={`/admin/goals/${goal.id}/download`}>
                  //     Download
                  //   </a>
                  // </DropdownMenuItem>
                  // <DropdownMenuItem asChild>
                  //   <Link href={`/admin/goals/${goal.id}/edit`}>Edit</Link>
                  // </DropdownMenuItem>
                  // <ActiveToggleDropdownItem
                  //   id={goal.id}
                  //   isAvailableForPurchase={goal.isAvailableForPurchase}
                  // /> */
  return (
    <Table
      columns={columns}
      dataSource={goals.map((w) => ({
        ...w,
        balanceInCents: formatCurrency(w.balanceInCents),
        savings: formatNumber(w._count.savings),
      }))}
    />
  );
}

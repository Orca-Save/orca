import Link from "next/link";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Button, Table } from "antd";
import { Title } from "@/app/_components/Typography";

export default function AdminGoalsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <Title>Goals</Title>
        <Button>
          <Link href="/admin/goals/new">Add Goal</Link>
        </Button>
      </div>
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

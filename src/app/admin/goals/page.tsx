import { Title } from "@/app/_components/Typography";
import { Button } from "antd";
import Link from "next/link";

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

import { Title } from "@/app/_components/Title";
import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import { Table } from "antd";
export default function SavingsPage() {
  return (
    <>
      <Title>Savings</Title>
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

import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import { PageHeader } from "../_components/PageHeader";
import { Table } from "antd";
export default function SavingsPage() {
  return (
    <>
      <PageHeader>Savings</PageHeader>
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

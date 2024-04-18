import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { PageHeader } from "../_components/PageHeader";
import { MoreVertical } from "lucide-react";
import { DeleteDropDownItem } from "./_components/UserActions";
import { Table } from "antd";

function getUsers() {
  return db.user.findMany({
    select: {
      id: true,
      email: true,
      savings: { select: { pricePaidInCents: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default function UsersPage() {
  return (
    <>
      <PageHeader>Customers</PageHeader>
      <UsersTable />
    </>
  );
}

const columns = [
  {
    title: "Email",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Savings",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
  },
];
async function UsersTable() {
  const users = await getUsers();

  if (users.length === 0) return <p>No customers found</p>;

  return (
    <Table
      columns={columns}
      dataSource={users.map((user) => ({
        key: user.id,
        savings: user.savings.length,
        balance: formatCurrency(
          user.savings.reduce((sum, o) => o.pricePaidInCents + sum, 0) / 100
        ),
      }))}
    />
  );
}

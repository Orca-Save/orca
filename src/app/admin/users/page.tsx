import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { PageHeader } from "../_components/PageHeader";
import { MoreVertical } from "lucide-react";
import { DeleteDropDownItem } from "./_components/UserActions";
import { Table } from "antd";

export default function UsersPage() {
  return (
    <>
      <PageHeader>Customers</PageHeader>
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

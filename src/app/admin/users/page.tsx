import { Title } from "@/app/_components/Typography";

export default function UsersPage() {
  return (
    <>
      <Title>Customers</Title>
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

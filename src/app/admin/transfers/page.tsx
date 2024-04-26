import { Title } from "@/app/_components/Typography";
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

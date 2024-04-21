import { Tabs, TabsProps } from "antd";
import SavingsPage from "./_components/SavingsPage";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Saving History",
    children: <SavingsPage newButtonText="New Saving" />,
  },
  {
    key: "2",
    label: "Quick Saves",
    children: <SavingsPage newButtonText="New Quick Save" filter="templates" />,
  },
  {
    key: "3",
    label: "External Accounts",
    children: (
      <SavingsPage newButtonText="New External Account" filter="accounts" />
    ),
  },
];

export default function MySavingsPage() {
  return <Tabs centered defaultActiveKey="1" items={items} />;
}

import { Tabs, TabsProps } from "antd";
import SavingsPage from "../_components/SavingsPage";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Log",
    children: (
      <SavingsPage newSaveText="Impulse Save" newPurchaseText="Impulse Buy" />
    ),
  },
  {
    key: "2",
    label: "Quick Saves",
    children: <SavingsPage newSaveText="Add Quick Saving" filter="templates" />,
  },
  {
    key: "3",
    label: "External",
    children: (
      <SavingsPage newSaveText="New External Account" filter="accounts" />
    ),
  },
];

export default function MySavingsPage() {
  return <Tabs centered defaultActiveKey="1" items={items} />;
}

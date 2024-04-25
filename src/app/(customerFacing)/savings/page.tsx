import { Tabs, TabsProps } from "antd";
import SavingsPage from "../_components/SavingsPage";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "One-tap",
    children: (
      <SavingsPage newSaveText="Add One-tap Impulse Save" filter="templates" />
    ),
  },
  {
    key: "2",
    label: "Log",
    children: (
      <SavingsPage newSaveText="Impulse Save" newPurchaseText="Impulse Buy" />
    ),
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

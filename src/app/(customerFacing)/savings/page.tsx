import { Tabs, TabsProps } from "antd";
import SavingsPage from "../_components/SavingsPage";

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "Log",
    children: (
      <SavingsPage
        saveHref="/savings/impulseSave/new"
        buyHref="/purchases/impulseBuy/new"
        newSaveText="Impulse Save"
        newPurchaseText="Impulse Buy"
      />
    ),
  },
  {
    key: "2",
    label: "One-Tap",
    children: (
      <SavingsPage
        saveHref="/savings/oneTapSave/new?filter=templates"
        buyHref="/purchases/impulseBuy/new"
        newSaveText="Add One-Tap Save"
        filter="templates"
      />
    ),
  },
  {
    key: "3",
    label: "External",
    children: (
      <SavingsPage
        saveHref="/savings/oneTapSave/new?filter=templates"
        buyHref="/purchases/impulseBuy"
        newSaveText="New External Account"
        filter="accounts"
        hide={true}
      />
    ),
  },
];

export default function MySavingsPage() {
  return <Tabs centered defaultActiveKey="1" items={items} />;
}

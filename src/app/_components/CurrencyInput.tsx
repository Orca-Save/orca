import { currencyFormatter } from "@/lib/utils";
import { InputNumber, Select } from "antd";

const { Option } = Select;
const selectAfter = (
  <Select defaultValue="USD" style={{ width: 60 }}>
    <Option value="USD">$</Option>
    <Option value="EUR">€</Option>
    <Option value="GBP">£</Option>
    <Option value="CNY">¥</Option>
  </Select>
);

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string | null) => void;
}) {
  const currencyParser = (value?: string) =>
    value?.replace?.(/[-,]/g, "") ?? "";
  // value?.replace?.(/\$\s?|,|-/g, "") ?? "";

  return (
    <InputNumber
      formatter={(value) => currencyFormatter(value, true)}
      parser={currencyParser}
      precision={2}
      prefix={"$"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: "100%" }}
    />
  );
}
export default CurrencyInput;

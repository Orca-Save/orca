import React from "react";
import { InputNumber } from "antd";

function CurrencyInput({
  value,
  onChange,
  placeholder,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (value: string | null) => void;
}) {
  // Formatter to add a dollar sign and commas as thousand separators
  const currencyFormatter = (value?: string) =>
    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Parser to remove non-numeric characters except the minus sign and the decimal point
  const currencyParser = (value?: string) =>
    value?.replace?.(/\$\s?|(,*)/g, "") ?? "";

  return (
    <InputNumber
      formatter={currencyFormatter}
      parser={currencyParser}
      precision={2}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: "100%" }}
    />
  );
}
export default CurrencyInput;

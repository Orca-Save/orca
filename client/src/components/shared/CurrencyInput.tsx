import { InputNumber, Select } from 'antd';
import React from 'react';

import { currencyFormatter2 } from '../../utils/general';

const { Option } = Select;
const selectAfter = (
  <Select defaultValue='USD' style={{ width: 60 }}>
    <Option value='USD'>$</Option>
    <Option value='EUR'>€</Option>
    <Option value='GBP'>£</Option>
    <Option value='CNY'>¥</Option>
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
    value?.replace?.(/[-,]/g, '') ?? '';

  return (
    <InputNumber
      formatter={(value, info) => currencyFormatter2(value)}
      parser={currencyParser}
      precision={2}
      prefix={'$'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
    />
  );
}
export default CurrencyInput;

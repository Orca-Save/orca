import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { Button, Form, Input, notification, Rate, Space } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { apiFetch } from '../../utils/general';
import CurrencyInput from '../shared/CurrencyInput';

type GoalTransferFormValues = {
  itemName: string;
  amount: number;
  rating: number;
};
const customIcons: Record<number, React.ReactNode> = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};

export default function QuickSaveForm({
  isSavings,
  itemNameTitle,
  itemNamePlaceholder,
}: {
  isSavings: boolean;
  itemNameTitle: string;
  itemNamePlaceholder: string;
}) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const onFinish = async (values: GoalTransferFormValues) => {
    const formData = new FormData();
    formData.append('itemName', values.itemName);
    if (values.rating) formData.append('rating', String(values.rating));
    const adjustedAmount = isSavings ? values.amount : -values.amount;
    formData.append('amount', String(adjustedAmount));

    const params = new URLSearchParams(window.location.search);
    const result = await apiFetch('/api/goals/quickGoalTransfer', 'POST', {
      goalTransferType: params.get('filter'),
      formData: formData,
    });

    if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([field, errors]: any) => {
        errors.forEach((error: any) => {
          form.setFields([
            {
              name: field,
              errors: [error],
            },
          ]);
        });
      });
    } else if (result.noPinnedGoal) {
      api.error({
        message: `No pinned goal to save to`,
        placement: 'top',
        duration: 2,
      });
    }
    navigate('/?confetti=true');
  };
  return (
    <>
      {contextHolder}
      <Form form={form} layout='vertical' onFinish={onFinish}>
        <Form.Item
          name='itemName'
          label={itemNameTitle}
          rules={[{ required: true, message: 'Please input the item name' }]}
        >
          <Input placeholder={itemNamePlaceholder} />
        </Form.Item>
        <Form.Item
          name='amount'
          label='Amount'
          rules={[{ required: true, message: 'Please input the amount' }]}
        >
          <CurrencyInput placeholder='Amount' />
        </Form.Item>
        {!isSavings ? (
          <Form.Item
            name='rating'
            label='How did you feel about this purchase?'
            rules={[{ required: true, message: 'Please rate this purchase' }]}
          >
            <Rate character={({ index = 0 }) => customIcons[index + 1]} />
          </Form.Item>
        ) : null}
        <Space direction='horizontal'>
          <Button
            data-id='goal-transfer-form-submit'
            type='primary'
            size='large'
            htmlType='submit'
          >
            Save
          </Button>
          <Button
            data-id='goal-transfer-form-cancel'
            size='large'
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </Space>
      </Form>
    </>
  );
}

'use client';

import { Button, Form, Input, Rate, Space, notification } from 'antd';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  isGoalTransferFieldErrors,
  isPinnedGoalError,
} from '@/lib/goalTransfers';
import { isExtendedSession } from '@/lib/session';
import { getPrevPageHref } from '@/lib/utils';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { addQuickGoalTransfer } from '../_actions/goalTransfers';
import CurrencyInput from './CurrencyInput';

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
  referer,
  itemNameTitle,
  itemNamePlaceholder,
}: {
  referer: string;
  isSavings: boolean;
  itemNameTitle: string;
  itemNamePlaceholder: string;
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('azure-ad-b2c');
    },
  });
  const [api, contextHolder] = notification.useNotification();
  const onFinish = async (values: GoalTransferFormValues) => {
    if (!session) return;
    if (!isExtendedSession(session)) return;

    const formData = new FormData();
    formData.append('itemName', values.itemName);
    if (values.rating) formData.append('rating', String(values.rating));
    const adjustedAmount = isSavings ? values.amount : -values.amount;
    formData.append('amount', String(adjustedAmount));

    const params = new URLSearchParams(window.location.search);
    const action = addQuickGoalTransfer.bind(
      null,
      session.user.id,
      params.get('filter')
    );
    const result = await action(formData);

    if (isGoalTransferFieldErrors(result)) {
      Object.entries(result.fieldErrors).forEach(([field, errors]) => {
        errors.forEach((error) => {
          form.setFields([
            {
              name: field,
              errors: [error],
            },
          ]);
        });
      });
    } else if (isPinnedGoalError(result) && result.noPinnedGoal) {
      api.error({
        message: `No pinned goal to save to`,
        placement: 'top',
        duration: 2,
      });
    }
    let path = getPrevPageHref(referer, window);
    if (isSavings) path += '?confetti=true';
    router.push(path);
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
            onClick={() => router.push(getPrevPageHref(referer, window))}
          >
            Cancel
          </Button>
        </Space>
      </Form>
    </>
  );
}

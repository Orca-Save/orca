'use client';

import { Goal, GoalCategory, GoalTransfer } from '@prisma/client';
import {
  Button,
  Collapse,
  DatePicker,
  Form,
  Input,
  Rate,
  Select,
  Tooltip,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  externalAccountId,
  isGoalTransferFieldErrors,
} from '@/lib/goalTransfers';
import { isExtendedSession } from '@/lib/session';
import { getPrevPageHref } from '@/lib/utils';
import {
  FrownOutlined,
  InfoCircleOutlined,
  MehOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { addGoalTransfer, updateGoalTransfer } from '../_actions/goalTransfers';
import CurrencyInput from './CurrencyInput';

type GoalTransferFormValues = {
  goalId: string;
  categoryId: string;
  link: string;
  note?: string;
  itemName: string;
  merchantName: string;
  amount: number;
  rating: number;
  transactedAt: Dayjs | null;
};
const { TextArea } = Input;
const customIcons: Record<number, React.ReactNode> = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};

export function GoalTransferForm({
  categories,
  goals,
  referer,
  goalTransfer,
  isSavings,
}: {
  categories: GoalCategory[];
  goals: Goal[];
  isSavings: boolean;
  referer: string;
  goalTransfer?: GoalTransfer | null;
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false); // Add loading state
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('azure-ad-b2c');
    },
  });

  const filterParam = searchParams.get('filter');
  let isTemplate = false;
  if (
    filterParam === 'templates' ||
    (goalTransfer && goalTransfer.goalId === null)
  ) {
    isTemplate = true;
  }

  const onFinish = async (values: GoalTransferFormValues) => {
    if (!session) return;
    if (!isExtendedSession(session)) return;
    const formData = new FormData();

    const adjustedAmount = isSavings ? values.amount : -values.amount;
    formData.append('amount', String(adjustedAmount));
    formData.append('itemName', values.itemName);

    if (values.merchantName)
      formData.append('merchantName', values.merchantName);
    if (values.transactedAt) {
      formData.append('transactedAt', values.transactedAt.format());
    }

    if (values.link) formData.append('link', values.link);
    if (values.note) formData.append('note', values.note);
    if (values.rating) formData.append('rating', String(values.rating));
    if (values.goalId) formData.append('goalId', values.goalId);
    if (values.categoryId) formData.append('categoryId', values.categoryId);

    setLoading(true);

    const action = goalTransfer
      ? updateGoalTransfer.bind(null, goalTransfer.id)
      : addGoalTransfer.bind(null, session.user.id, isTemplate);
    const result = await action(formData);
    setLoading(false);

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
    } else {
      let newPath = getPrevPageHref(referer, window);
      if (isSavings) newPath += '?confetti=true';
      router.push(newPath);
    }
  };
  let amount = (goalTransfer?.amount as number | undefined) ?? 0;
  if (amount < 0) {
    amount = -amount;
  }
  let isExternalAccount =
    filterParam === 'accounts' || goalTransfer?.goalId === externalAccountId;
  const initialCategoryId = isExternalAccount ? externalAccountId : undefined;
  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={onFinish}
      initialValues={{
        itemName: goalTransfer?.itemName,
        amount,
        transactedAt: goalTransfer?.transactedAt
          ? dayjs(goalTransfer.transactedAt)
          : dayjs(),
        note: goalTransfer?.note,
        link: goalTransfer?.link,
        name: goalTransfer?.itemName,
        rating: goalTransfer?.rating,
        merchantName: goalTransfer?.merchantName,
        goalId: goalTransfer?.goalId ?? goals.find((goal) => goal.pinned)?.id,
        categoryId: goalTransfer?.categoryId ?? initialCategoryId,
      }}
    >
      <Form.Item
        name='itemName'
        label='Item or Action'
        rules={[{ required: true, message: 'Please input the item name!' }]}
      >
        <Input
          placeholder={`ex: ${
            isSavings ? 'Made lunch at home' : 'Starbucks Iced Latte'
          }`}
        />
      </Form.Item>

      <Form.Item
        name='amount'
        label='Amount'
        rules={[{ required: true, message: 'Please input the amount!' }]}
      >
        <CurrencyInput placeholder='Amount' />
      </Form.Item>
      {!isSavings ? (
        <Form.Item
          name='rating'
          label={
            <span>
              How did you feel about this purchase?
              <Tooltip
                title={
                  <>
                    <p style={{ marginBottom: '0.5rem' }}>
                      This rating is necessary to ensure the insights we deliver
                      are truly personalized.
                    </p>
                    <p>
                      For example, we don&apos;t want to suggest you cut back on
                      “Yoga with friends” to meet your goal if this is something
                      you truly value.
                    </p>
                  </>
                }
              >
                <InfoCircleOutlined style={{ marginLeft: '5px' }} />
              </Tooltip>
            </span>
          }
          rules={[{ required: true, message: 'Please rate the item!' }]}
        >
          <Rate character={({ index = 0 }) => customIcons[index + 1]} />
        </Form.Item>
      ) : null}

      <Collapse style={{ width: '100%' }}>
        <Collapse.Panel header='Optional Fields' key='1' forceRender>
          {!isTemplate && isSavings ? (
            <Form.Item name='goalId' label='Goal'>
              <Select
                placeholder='Select a goal'
                options={goals.map((goal: Goal) => ({
                  label: `${goal.name} ${
                    goal.description ? `(${goal.description})` : ''
                  }`,
                  value: goal.id,
                }))}
              />
            </Form.Item>
          ) : null}
          <Form.Item name='transactedAt' label='Transaction Date'>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='merchantName' label='Merchant Name'>
            <Input placeholder='Merchant Name' />
          </Form.Item>
          <Form.Item name='categoryId' label='Category'>
            <Select
              placeholder='Select a category'
              disabled={isExternalAccount}
              options={categories.map((category: GoalCategory) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </Form.Item>
          <Form.Item name='link' label='Link'>
            <Input placeholder='Link to item' />
          </Form.Item>
          <Form.Item name='note' label='Additional Note'>
            <TextArea placeholder='Additional notes about the transaction' />
          </Form.Item>
        </Collapse.Panel>
      </Collapse>

      <div className='flex justify-end mt-5 space-x-4'>
        <Button
          data-id='goal-transfer-form-cancel'
          size='large'
          onClick={() => router.push(getPrevPageHref(referer, window))}
        >
          Cancel
        </Button>
        <Button
          data-id='goal-transfer-form-submit'
          type='primary'
          size='large'
          htmlType='submit'
          loading={loading}
          disabled={loading}
        >
          Save
        </Button>
      </div>
    </Form>
  );
}

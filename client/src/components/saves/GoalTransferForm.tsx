import {
  FrownOutlined,
  InfoCircleOutlined,
  MehOutlined,
  SmileOutlined,
} from '@ant-design/icons';
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
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { plaidCategories } from 'shared-library/dist/plaidCategories';

import { Goal, GoalTransfer } from '../../types/all';
import { apiFetch, externalAccountId } from '../../utils/general';
import CurrencyInput from '../shared/CurrencyInput';

const customIcons: Record<number, React.ReactNode> = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};

const { TextArea } = Input;

type GoalTransferFormValues = {
  itemName: string;
  amount: number;
  rating: number;
  transactedAt: dayjs.Dayjs;
  note: string;
  link: string;
  goalId: string;
  categoryId: string;
  plaidCategory: string;
  merchantName: string;
};

export function GoalTransferForm({
  goals,
  goalTransfer,
  isSavings,
}: {
  goals: Goal[];
  isSavings: boolean;
  goalTransfer?: GoalTransfer;
}) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const filterParam = searchParams.get('filter');
  let isTemplate = false;
  if (
    filterParam === 'templates' ||
    (goalTransfer && goalTransfer.goalId === null)
  ) {
    isTemplate = true;
  }

  const onFinish = async (values: GoalTransferFormValues) => {
    const formData: any = { id: goalTransfer?.id };
    const adjustedAmount = isSavings ? values.amount : -values.amount;
    formData.amount = String(adjustedAmount);
    formData.itemName = values.itemName;

    if (values.merchantName) formData.merchantName = values.merchantName;
    if (values.transactedAt) {
      formData.transactedAt = values.transactedAt.format();
    }

    if (values.link) formData.link = values.link;
    if (values.note) formData.note = values.note;
    if (values.rating) formData.rating = String(values.rating);
    if (values.goalId) formData.goalId = values.goalId;
    if (values.categoryId) formData.categoryId = values.categoryId;
    if (values.plaidCategory) formData.plaidCategory = values.plaidCategory;

    setLoading(true);

    const endpoint = goalTransfer
      ? '/api/goals/updateGoalTransfer'
      : '/api/goals/addGoalTransfer';

    const result = await apiFetch(endpoint, 'POST', {
      formData,
      isTemplate,
    });
    setLoading(false);

    if (result.fieldErrors) {
      Object.entries(result.fieldErrors).forEach(([field, errors]: any) => {
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
      navigate(-1);
    }
  };
  let amount = (goalTransfer?.amount as number | undefined) ?? 0;
  if (amount < 0) {
    amount = -amount;
  }
  let isExternalAccount =
    filterParam === 'accounts' ||
    goalTransfer?.goalId === externalAccountId ||
    goalTransfer?.initialTransfer;
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
        plaidCategory: goalTransfer?.plaidCategory,
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
          <Form.Item name='plaidCategory' label='Category'>
            <Select
              placeholder='Select a category'
              disabled={isExternalAccount}
              options={plaidCategories}
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
          onClick={() => navigate(-1)}
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

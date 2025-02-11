import { Button, Collapse, DatePicker, Form, Input, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plaidCategories } from 'shared-library/dist/plaidCategories';

import { Goal } from '../../types/all';
import { apiFetch, newEndpoint } from '../../utils/general';
import CurrencyInput from '../shared/CurrencyInput';
import UnsplashForm from '../shared/UnsplashForm';
import { Capacitor } from '@capacitor/core';

type GoalFormValues = {
  name: string;
  description: string;
  note?: string;
  initialAmount: number;
  targetAmount: number;
  imagePath?: string;
  dueAt: Dayjs | null;
  categoryId: string;
  plaidCategory: string;
  file: {
    file: File;
  };
};
const { TextArea } = Input;

export function GoalForm({
  goal,
  initialAmount,
}: {
  goal?: Goal | null;
  initialAmount?: number;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const platform = Capacitor.getPlatform();
  const onFinish = async (values: GoalFormValues) => {
    const formData: any = { id: goal?.id };
    formData.name = values.name;
    formData.targetAmount = String(values.targetAmount);

    if (values.description) formData.description = values.description;
    if (values.note) formData.note = values.note;
    if (values.categoryId) {
      formData.categoryId = values.categoryId;
    }
    if (values.plaidCategory) {
      formData.plaidCategory = values.plaidCategory;
    }
    if (values.dueAt) {
      formData.dueAt = values.dueAt.format(); // Assuming moment.js for date formattig
    }
    if (values.initialAmount) {
      formData.initialAmount = String(values.initialAmount);
    }
    formData.imagePath = values.imagePath!;

    setLoading(true);
    const endpoint = goal ? '/api/goals/updateGoal' : '/api/goals/createGoal';
    const result = await apiFetch(endpoint, 'POST', {
      formData,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(newEndpoint('/api/upload/image'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        form.setFieldsValue({ imagePath: data.imagePath });
      }
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const targetAmount = goal?.targetAmount ? goal.targetAmount : undefined;
  return (
    <>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          name: goal?.name,
          description: goal?.description ?? '',
          targetAmount,
          dueAt: goal?.dueAt ? dayjs(goal.dueAt) : dayjs(),
          note: goal?.note ?? '',
          initialAmount: initialAmount,
          imagePath: goal?.imagePath,
          categoryId: goal?.categoryId,
          plaidCategory: goal?.plaidCategory,
        }}
      >
        <Form.Item
          name='name'
          label='Goal Name'
          rules={[{ required: true, message: 'Please input the name!' }]}
        >
          <Input placeholder='Name' />
        </Form.Item>
        <Form.Item
          name='dueAt'
          label='Due Date'
          rules={[{ required: true, message: 'Please select the due date!' }]}
        >
          <DatePicker minDate={dayjs()} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name='targetAmount'
          label='Target Balance'
          rules={[
            { required: true, message: 'Please input the target balance!' },
          ]}
        >
          <CurrencyInput placeholder='Target Balance' />
        </Form.Item>

        <Form.Item name='initialAmount' label='Initial Saved Amount'>
          <CurrencyInput placeholder='Initial Balance' />
        </Form.Item>

        {platform !== 'ios' && (
          <Form.Item name='image' label='Upload Image'>
            <input type='file' onChange={handleFileChange} />
          </Form.Item>
        )}
        <Form.Item name='imagePath'>
          <UnsplashForm
            defaultValue={goal?.imagePath ?? undefined}
            onSelect={(url) => form.setFieldsValue({ imagePath: url })}
          />
        </Form.Item>
        <Collapse>
          <Collapse.Panel header='Optional Fields' key='1' forceRender>
            <Form.Item name='plaidCategory' label='Category'>
              <Select
                placeholder='Select a category'
                options={plaidCategories}
              />
            </Form.Item>
            <Form.Item name='description' label='Description'>
              <TextArea placeholder='Description' />
            </Form.Item>

            <Form.Item
              name='note'
              label='Additional Note'
              rules={[{ message: 'Please input additional notes!' }]}
            >
              <TextArea placeholder='Additional notes about the goal' />
            </Form.Item>
          </Collapse.Panel>
        </Collapse>

        <div className='flex justify-end mt-5 space-x-4'>
          <Button
            data-id='goal-form-cancel'
            size='large'
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            data-id='goal-form-submit'
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
    </>
  );
}

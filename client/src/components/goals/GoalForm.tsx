'use client';

import { Goal } from '@prisma/client';
import {
  Button,
  Collapse,
  DatePicker,
  Form,
  Input,
  Select,
  Upload,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { isFieldErrors } from '@/lib/goals';
import { isExtendedSession } from '@/lib/session';
import { getPrevPageHref } from '@/lib/utils';
import { UploadOutlined } from '@ant-design/icons';
import CollapsePanel from 'antd/es/collapse/CollapsePanel';
import { useState } from 'react';
import { addGoal, updateGoal } from '../../../../src/app/_actions/goals';
import CurrencyInput from '../shared/CurrencyInput';
import UnsplashForm from '../shared/UnsplashForm';

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
  image: {
    file: File;
  };
};
const { TextArea } = Input;

export function GoalForm({
  goal,
  categories,
  referer,
  initialAmount,
}: {
  goal?: Goal | null;
  categories: {
    label: string;
    value: string;
  }[];
  initialAmount?: number;
  referer: string;
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Add loading state
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('azure-ad-b2c');
    },
  });
  const onFinish = async (values: GoalFormValues) => {
    if (!session) return null;

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('targetAmount', String(values.targetAmount));

    if (values.description) formData.append('description', values.description);
    if (values.note) formData.append('note', values.note);
    if (values.categoryId) {
      formData.append('categoryId', values.categoryId);
    }
    if (values.plaidCategory) {
      formData.append('plaidCategory', values.plaidCategory);
    }
    if (values.dueAt) {
      formData.append('dueAt', values.dueAt.format()); // Assuming moment.js for date formatting
    }
    if (values.initialAmount) {
      formData.append('initialAmount', String(values.initialAmount));
    }
    formData.append('imagePath', values.imagePath!);

    if (values.image)
      formData.append('image', form.getFieldValue('image').file.originFileObj);

    if (isExtendedSession(session)) {
      setLoading(true);
      const action = goal
        ? updateGoal.bind(null, goal.id, session.user.id)
        : addGoal.bind(null, session.user.id);
      const result = await action(undefined, formData);
      setLoading(false);

      if (isFieldErrors(result)) {
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
        router.push(getPrevPageHref(referer, window) + '?confetti=true');
      }
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

        <Form.Item name='image'>
          <Upload>
            <Button data-id='goal-image-upload' icon={<UploadOutlined />}>
              Upload Image
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item name='imagePath'>
          <UnsplashForm
            defaultValue={goal?.imagePath ?? undefined}
            onSelect={(url) => form.setFieldsValue({ imagePath: url })}
          />
        </Form.Item>
        <Collapse>
          <CollapsePanel header='Optional Fields' key='1' forceRender>
            <Form.Item name='plaidCategory' label='Category'>
              <Select placeholder='Select a category' options={categories} />
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
          </CollapsePanel>
        </Collapse>

        <div className='flex justify-end mt-5 space-x-4'>
          <Button
            data-id='goal-form-cancel'
            size='large'
            onClick={() => router.back()}
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
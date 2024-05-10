'use client';

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button, Form, Input, Space, notification } from 'antd';
import React from 'react';
import { createSubscription } from '../_actions/stripe';
import { useRouter } from 'next/navigation';
import { Title } from '@/app/_components/Typography';

function SubscriptionForm({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [form] = Form.useForm();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async () => {
    try {
      const email = form.getFieldValue('email');
      const name = form.getFieldValue('name');

      const paymentMethod = await stripe?.createPaymentMethod({
        type: 'card',
        card: elements?.getElement(CardElement)!,
        billing_details: {
          name,
          email,
        },
      });

      if (paymentMethod?.paymentMethod === undefined) {
        console.error('failed to create payment method record');
        api.error({
          message: `Failed to create payment method record`,
          placement: 'top',
          duration: 2,
        });
        return;
      }
      const response = await createSubscription(userId, {
        email,
        name,
        paymentMethod: paymentMethod?.paymentMethod?.id,
      });

      const confirmPayment = await stripe?.confirmCardPayment(
        response.clientSecret
      );

      if (confirmPayment?.error) {
        api.error({
          message: confirmPayment.error.message,
          placement: 'top',
          duration: 3,
        });
      } else {
        api.success({
          message: 'Success! Check your email for the invoice.',
          placement: 'top',
          duration: 3,
        });
        router.push('/user');
      }
    } catch (error) {
      api.error({
        message: 'Something went wrong. Please try again later.',
        placement: 'top',
        duration: 3,
      });
      console.error(error);
    }
  };

  return (
    <Space align='start'>
      <Form form={form} onFinish={onFinish} initialValues={{ email }}>
        <Form.Item
          name='name'
          label='Name on card'
          rules={[
            { required: true, message: 'Please provide a name for the card' },
          ]}>
          <Input placeholder='Name' type='text' />
        </Form.Item>
        <Form.Item
          name='email'
          label='Email'
          rules={[{ required: true, message: 'Please provide an email' }]}>
          <Input />
        </Form.Item>
        <CardElement />
        <Button htmlType='submit' disabled={!stripe}>
          Subscribe
        </Button>
      </Form>
      <Title level={3}>Subscribe for $3.00!</Title>
    </Space>
  );
}

export default SubscriptionForm;

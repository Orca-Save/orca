'use client';

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button, Form, Input } from 'antd';
import React from 'react';
import { createSubscription } from '../_actions/subscriptions';
import { Router, useRouter } from 'next/router';

function SubscriptionForm({ userId }: { userId: string }) {
  const [form] = Form.useForm();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

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
        alert(confirmPayment.error.message);
      } else {
        alert('Success! Check your email for the invoice.');
        router.push('/user/subscriptions');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={{
        email: 'user@mail.com',
      }}>
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
  );
}

export default SubscriptionForm;

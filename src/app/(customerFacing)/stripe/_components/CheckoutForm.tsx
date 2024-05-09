import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';
import { createSubscription } from '../_actions/subscriptions';

function CheckoutForm() {
  const [form] = Form.useForm();
  const stripe = useStripe();
  const elements = useElements();

  // main function
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

      console.log('paymentMethod', paymentMethod);
      if (paymentMethod?.paymentMethod === undefined) {
        console.error('failed to create payment method record');
        return;
      }
      const response = await createSubscription({
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
        name: 'name of user',
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

export default CheckoutForm;

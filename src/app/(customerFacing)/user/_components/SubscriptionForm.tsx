"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { StripeError } from "@stripe/stripe-js";
import { Button, Form, notification } from "antd";
import { useRouter } from "next/navigation";
import { addSubscriptionId } from "../_actions/stripe";

function SubscriptionForm({
  clientSecret,
  userId,
  subscriptionId,
}: {
  clientSecret: string;
  userId: string;
  subscriptionId: string;
}) {
  const [form] = Form.useForm();
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();

  const onFinish = async () => {
    try {
      if (!stripe || !elements) return;

      const results = await elements.submit();
      const addResponse = await addSubscriptionId(userId, subscriptionId);
      if (results.error) {
        return;
      }
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/user`,
        },
        redirect: "if_required",
      });

      if (paymentIntent === undefined) {
        console.error("failed to create payment method record");
        api.error({
          message: `Failed to create payment method record`,
          placement: "top",
          duration: 2,
        });
        return;
      }
      if (error) {
        api.error({
          message: (error as StripeError).message,
          placement: "top",
          duration: 3,
        });
      } else {
        api.success({
          message: "Success! Check your email for the invoice.",
          placement: "top",
          duration: 3,
        });
        router.push("/user");
      }
    } catch (error) {
      api.error({
        message: "Something went wrong. Please try again later.",
        placement: "top",
        duration: 3,
      });
      console.error(error);
    }
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <PaymentElement
        options={{
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
          fields: {
            billingDetails: {
              name: "auto",
              email: "auto",
            },
          },
        }}
      />
      <Button
        type="primary"
        size="large"
        htmlType="submit"
        disabled={!stripe || !elements}
      >
        Subscribe for $4.00/month
      </Button>
    </Form>
  );
}

export default SubscriptionForm;

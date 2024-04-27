"use client";

import { Button, DatePicker, Form, Input, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { isGoalFieldErrors } from "@/lib/goals";
import { isExtendedSession } from "@/lib/session";
import { getPrevPageHref } from "@/lib/utils";
import Link from "next/link";
import { addQuickGoal } from "../_actions/goals";
import CurrencyInput from "./CurrencyInput";

type GoalFormValues = {
  name: string;
  description: string;
  note?: string;
  initialAmount: number;
  targetAmount: number;
  dueAt: Dayjs | null;
  categoryId: string;
  file: {
    file: File;
  };
  image: {
    file: File;
  };
};
const { TextArea } = Input;

export default function QuickGoalForm({ referer }: { referer: string }) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("azure-ad-b2c");
    },
  });

  const onFinish = async (values: GoalFormValues) => {
    if (!session) return null;
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("targetAmount", String(values.targetAmount));

    if (values.dueAt) {
      formData.append("dueAt", values.dueAt.format());
    }
    if (values.initialAmount) {
      formData.append("initialAmount", String(values.initialAmount));
    }

    if (isExtendedSession(session)) {
      const action = addQuickGoal.bind(null, session.user.id);
      const result = await action(undefined, formData);

      if (isGoalFieldErrors(result)) {
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
        router.push("/goals");
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        dueAt: dayjs(),
      }}
    >
      <Form.Item
        name="name"
        label="Goal Name"
        rules={[{ required: true, message: "Please input the name!" }]}
      >
        <Input placeholder="Name" />
      </Form.Item>
      <Form.Item
        name="dueAt"
        label="Due Date"
        rules={[{ required: true, message: "Please select the due date!" }]}
      >
        <DatePicker minDate={dayjs()} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="targetAmount"
        label="Target Balance"
        rules={[
          { required: true, message: "Please input the target balance!" },
        ]}
      >
        <CurrencyInput placeholder="Target Balance" />
      </Form.Item>
      <Form.Item name="initialAmount" label="Initial Saved Amount">
        <CurrencyInput placeholder="Initial Balance" />
      </Form.Item>
      <Space direction="horizontal">
        <Button size="large" type="primary" htmlType="submit">
          Save
        </Button>
        <Link href={getPrevPageHref(referer, window)}>
          <Button size="large">Cancel</Button>
        </Link>
      </Space>
    </Form>
  );
}

"use client";

import { signIn, useSession } from "next-auth/react";
import dayjs, { Dayjs } from "dayjs";
import { Goal, GoalCategory } from "@prisma/client";
import { Button, DatePicker, Form, Input, Select } from "antd";
import { useRouter } from "next/navigation";

import { addGoal, updateGoal } from "../../_actions/goals";
import { isGoalFieldErrors } from "@/lib/goals";
import { isExtendedSession } from "@/lib/session";
import CurrencyInput from "./CurrencyInput";

type GoalFormValues = {
  name: string;
  description: string;
  note?: string;
  balanceInCents: number;
  targetInCents: number;
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

export function GoalForm({
  goal,
  categories,
}: {
  goal?: Goal | null;
  categories: GoalCategory[];
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("azure-ad-b2c");
    },
  });

  const onFinish = async (values: GoalFormValues) => {
    if (!session) return;
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("balanceInCents", String(values.balanceInCents)); // Convert number to string
    formData.append("note", values.note || "");
    formData.append("targetInCents", String(values.targetInCents));

    if (values.categoryId) {
      formData.append("categoryId", values.categoryId);
    }
    if (values.dueAt) {
      formData.append("dueAt", values.dueAt.format()); // Assuming moment.js for date formatting
    } else {
      formData.append("dueAt", ""); // Append an empty string or handle as required
    }
    if (isExtendedSession(session)) {
      const action = goal
        ? updateGoal.bind(null, goal.id, session.user.id)
        : addGoal.bind(null, session.user.id);
      const results = await action(undefined, formData);

      if (isGoalFieldErrors(results)) {
        Object.entries(results.fieldErrors).forEach(([field, errors]) => {
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
        name: goal?.name,
        description: goal?.description,
        balanceInCents: goal?.balanceInCents,
        dueAt: goal?.dueAt ? dayjs(goal.dueAt) : dayjs(),
        note: goal?.note,
        targetInCents: goal?.targetInCents,
        categoryId: goal?.categoryId,
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
        name="description"
        label="Description"
        // rules={[{ required: true, message: "Please input a description!" }]}
      >
        <TextArea placeholder="Description" />
      </Form.Item>
      <Form.Item
        name="balanceInCents"
        label="Balance (in cents)"
        rules={[{ required: true, message: "Please input the balance!" }]}
      >
        <CurrencyInput placeholder="Balance In Cents" />
      </Form.Item>
      <Form.Item
        name="targetInCents"
        label="Target Balance"
        rules={[
          { required: true, message: "Please input the target balance!" },
        ]}
      >
        <CurrencyInput placeholder="Target Balance" />
      </Form.Item>
      <Form.Item
        name="categoryId"
        label="Category"
        rules={[{ required: true, message: "Please select a category!" }]}
      >
        <Select
          placeholder="Select a category"
          options={categories.map((category: GoalCategory) => ({
            label: category.name,
            value: category.id,
          }))}
        />
      </Form.Item>
      <Form.Item
        name="dueAt"
        label="Due Date"
        rules={[{ required: true, message: "Please select the due date!" }]}
      >
        <DatePicker minDate={dayjs()} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="note"
        label="Additional Note"
        rules={[{ message: "Please input additional notes!" }]} // Optional, remove 'required' if not needed
      >
        <TextArea placeholder="Additional notes about the goal" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {goal ? "Update Goal" : "Add Goal"}
        </Button>
      </Form.Item>
    </Form>
  );
}

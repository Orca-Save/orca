"use client";

import { signIn, useSession } from "next-auth/react";
import dayjs, { Dayjs } from "dayjs";
import { Goal, GoalCategory } from "@prisma/client";
import { Button, DatePicker, Form, Input, Select } from "antd";
import { useRouter } from "next/navigation";

import { addGoal, updateGoal } from "../_actions/goals";
import { isGoalFieldErrors } from "@/lib/goals";
import { isExtendedSession } from "@/lib/session";
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
    console.log(values.targetAmount, String(values.targetAmount * 100));
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("initialAmountInCents", String(values.initialAmount * 100));
    formData.append("targetInCents", String(values.targetAmount * 100));
    formData.append("note", values.note || "");

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

  const targetAmount = goal?.targetInCents ? goal.targetInCents / 100 : 0;
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        name: goal?.name,
        description: goal?.description ?? "",
        targetAmount,
        dueAt: goal?.dueAt ? dayjs(goal.dueAt) : dayjs(),
        note: goal?.note ?? "",
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
        name="targetAmount"
        label="Target Balance"
        rules={[
          { required: true, message: "Please input the target balance!" },
        ]}
      >
        <CurrencyInput placeholder="Target Balance" />
      </Form.Item>
      {!goal && (
        <Form.Item name="initialAmount" label="Initial Saved Amount">
          <CurrencyInput placeholder="Initial Balance" />
        </Form.Item>
      )}
      <Form.Item name="description" label="Description">
        <TextArea placeholder="Description" />
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

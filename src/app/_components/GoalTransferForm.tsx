"use client";

import { useSession, signIn } from "next-auth/react";
import dayjs, { Dayjs } from "dayjs";
import { GoalTransfer, Goal, GoalCategory } from "@prisma/client";
import { Button, DatePicker, Form, Input, Select, Rate } from "antd";
import { useRouter } from "next/navigation";

import CurrencyInput from "./CurrencyInput";
import { addGoalTransfer, updateGoalTransfer } from "../_actions/goalTransfers";
import { isExtendedSession } from "@/lib/session";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { isGoalTransferFieldErrors } from "@/lib/goalTransfers";

type GoalTransferFormValues = {
  goalId: string;
  categoryId: string;
  link: string;
  note?: string;
  itemName: string;
  merchantName: string;
  amountInCents: number;
  rating: number;
  transactedAt: Dayjs | null;
};
const { TextArea } = Input;
const customIcons: Record<number, React.ReactNode> = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};

export function GoalTransferForm({
  categories,
  goals,
  goalTransfer,
}: {
  categories: GoalCategory[];
  goals: Goal[];
  goalTransfer?: GoalTransfer;
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("azure-ad-b2c");
    },
  });

  const onFinish = async (values: GoalTransferFormValues) => {
    if (!session) return;
    if (!isExtendedSession(session)) return;

    const formData = new FormData();
    formData.append("link", values.link);
    formData.append("note", values.note || "");
    formData.append("itemName", values.itemName);
    formData.append("merchantName", values.merchantName);
    formData.append(
      "amountInCents",
      String(Math.round(values.amountInCents * 100))
    );
    formData.append("rating", String(values.rating));

    if (values.transactedAt) {
      formData.append("transactedAt", values.transactedAt.format());
    } else {
      formData.append("transactedAt", "");
    }

    formData.append("goalId", values.goalId);
    formData.append("categoryId", values.categoryId);

    const action = goalTransfer
      ? updateGoalTransfer.bind(null, goalTransfer.id, session.user.id)
      : addGoalTransfer.bind(null, session.user.id);
    const result = await action(formData);

    if (isGoalTransferFieldErrors(result)) {
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
      router.push("/savings");
    }
  };
  const amountInCents = goalTransfer?.amountInCents
    ? goalTransfer.amountInCents / 100
    : 0;
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        amountInCents,
        transactedAt: goalTransfer?.transactedAt
          ? dayjs(goalTransfer.transactedAt)
          : dayjs(),
        rating: goalTransfer?.rating ?? 3,
        note: goalTransfer?.note ?? "",
        link: goalTransfer?.link ?? "",
        itemName: goalTransfer?.itemName ?? "",
        merchantName: goalTransfer?.merchantName ?? "",
        goalId: goalTransfer?.goalId ?? "",
        categoryId: goalTransfer?.categoryId ?? "",
      }}
    >
      <Form.Item
        name="link"
        label="Link"
        rules={[{ required: true, message: "Please input the link!" }]}
      >
        <Input placeholder="Link to transaction" />
      </Form.Item>
      <Form.Item
        name="itemName"
        label="Item Name"
        rules={[{ required: true, message: "Please input the item name!" }]}
      >
        <Input placeholder="Item Name" />
      </Form.Item>
      <Form.Item
        name="merchantName"
        label="Merchant Name"
        rules={[{ required: true, message: "Please input the merchant name!" }]}
      >
        <Input placeholder="Merchant Name" />
      </Form.Item>
      <Form.Item
        name="amountInCents"
        label="Amount"
        rules={[{ required: true, message: "Please input the amount!" }]}
      >
        <CurrencyInput placeholder="Amount" />
      </Form.Item>
      <Form.Item
        name="rating"
        label="Rating"
        rules={[{ required: true, message: "Please rate the transaction!" }]}
      >
        <Rate character={({ index = 0 }) => customIcons[index + 1]} />
      </Form.Item>
      <Form.Item
        name="transactedAt"
        label="Transaction Date"
        rules={[
          { required: true, message: "Please select the transaction date!" },
        ]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="goalId"
        label="Goal"
        rules={[{ required: true, message: "Please select a goal!" }]}
      >
        <Select
          placeholder="Select a goal"
          options={goals.map((goal: Goal) => ({
            label: `${goal.name} (${goal.description})`,
            value: goal.id,
          }))}
        />
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
      <Form.Item name="note" label="Additional Note">
        <TextArea placeholder="Additional notes about the transfer" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {goalTransfer ? "Save" : "Add"} Transfer
        </Button>
      </Form.Item>
    </Form>
  );
}

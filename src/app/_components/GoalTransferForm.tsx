"use client";

import { Goal, GoalCategory, GoalTransfer } from "@prisma/client";
import { Button, DatePicker, Form, Input, Rate, Select, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  externalAccountId,
  isGoalTransferFieldErrors,
} from "@/lib/goalTransfers";
import { isExtendedSession } from "@/lib/session";
import { getPrevPageHref } from "@/lib/utils";
import { FrownOutlined, MehOutlined, SmileOutlined } from "@ant-design/icons";
import { addGoalTransfer, updateGoalTransfer } from "../_actions/goalTransfers";
import CurrencyInput from "./CurrencyInput";

type GoalTransferFormValues = {
  goalId: string;
  categoryId: string;
  link: string;
  note?: string;
  itemName: string;
  merchantName: string;
  amount: number;
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
  referer,
  goalTransfer,
  isSavings,
}: {
  categories: GoalCategory[];
  goals: Goal[];
  isSavings: boolean;
  referer: string;
  goalTransfer?: GoalTransfer | null;
}) {
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("azure-ad-b2c");
    },
  });

  const filterParam = searchParams.get("filter");
  let isTemplate = false;
  if (
    filterParam === "templates" ||
    (goalTransfer && goalTransfer.goalId === null)
  ) {
    isTemplate = true;
  }

  const onFinish = async (values: GoalTransferFormValues) => {
    if (!session) return;
    if (!isExtendedSession(session)) return;

    const formData = new FormData();
    if (values.link) formData.append("link", values.link);
    formData.append("note", values.note || "");
    formData.append("itemName", values.itemName);
    formData.append("merchantName", values.merchantName);
    formData.append("rating", String(values.rating));

    const adjustedAmount = isSavings ? values.amount : -values.amount;
    formData.append("amount", String(adjustedAmount));

    if (values.transactedAt) {
      formData.append("transactedAt", values.transactedAt.format());
    } else {
      formData.append("transactedAt", "");
    }

    if (values.goalId) formData.append("goalId", values.goalId);
    formData.append("categoryId", values.categoryId);

    const action = goalTransfer
      ? updateGoalTransfer.bind(null, goalTransfer.id)
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
      router.push(getPrevPageHref(referer, window));
    }
  };
  const amount = goalTransfer?.amount ?? 0;
  let isExternalAccount =
    filterParam === "accounts" || goalTransfer?.goalId === externalAccountId;
  const initialCategoryId = isExternalAccount ? externalAccountId : undefined;
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        amount,
        transactedAt: goalTransfer?.transactedAt
          ? dayjs(goalTransfer.transactedAt)
          : dayjs(),
        note: goalTransfer?.note,
        link: goalTransfer?.link,
        merchantName: goalTransfer?.merchantName,
        goalId: goalTransfer?.goalId,
        categoryId: goalTransfer?.categoryId ?? initialCategoryId,
      }}
    >
      <Form.Item
        name="itemName"
        label="Item Name"
        rules={[{ required: true, message: "Please input the item name!" }]}
      >
        <Input placeholder="Item Name" />
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
        name="amount"
        label="Amount"
        rules={[{ required: true, message: "Please input the amount!" }]}
      >
        <CurrencyInput placeholder="Amount" />
      </Form.Item>
      <Form.Item name="rating" label="Rating">
        <Rate character={({ index = 0 }) => customIcons[index + 1]} />
      </Form.Item>

      {!isTemplate ? (
        <Form.Item
          name="goalId"
          label="Goal"
          rules={[{ required: true, message: "Please select a goal!" }]}
        >
          <Select
            placeholder="Select a goal"
            options={goals.map((goal: Goal) => ({
              label: `${goal.name} ${
                goal.description ? `(${goal.description})` : ""
              }`,
              value: goal.id,
            }))}
          />
        </Form.Item>
      ) : null}
      <Form.Item name="merchantName" label="Merchant Name">
        <Input placeholder="Merchant Name" />
      </Form.Item>
      <Form.Item name="categoryId" label="Category">
        <Select
          placeholder="Select a category"
          disabled={isExternalAccount}
          options={categories.map((category: GoalCategory) => ({
            label: category.name,
            value: category.id,
          }))}
        />
      </Form.Item>
      <Form.Item name="link" label="Link">
        <Input placeholder="Link to item" />
      </Form.Item>
      <Form.Item name="note" label="Additional Note">
        <TextArea placeholder="Additional notes about the transfer" />
      </Form.Item>
      <Space direction="horizontal">
        <Button type="primary" size="large" htmlType="submit">
          Save
        </Button>

        <Button
          size="large"
          onClick={() => router.push(getPrevPageHref(referer, window))}
        >
          Cancel
        </Button>
      </Space>
    </Form>
  );
}

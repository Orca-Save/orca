"use client";
import { Button, DatePicker, Form, Input, Row, Tabs } from "antd";
import { useForm } from "react-hook-form";

import CurrencyInput from "@/app/_components/CurrencyInput";
import { isExtendedSession } from "@/lib/session";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormItem } from "react-hook-form-antd";
import { onboardUser } from "./_actions/onboarding";
import { onboardingSchema } from "./_schemas/onboarding";

export default function OnboardingPage() {
  const [pageState, setPageState] = useState({ tabKey: "1" });
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("azure-ad-b2c");
    },
  });
  const router = useRouter();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      goalName: undefined,
      goalAmount: undefined,
      goalDueAt: dayjs(),
      action: undefined,
      actionAmount: undefined,
      saving: undefined,
      savingAmount: undefined,
      initialAmount: undefined,
    },
    resolver: zodResolver(onboardingSchema),
  });
  if (session && !isExtendedSession(session)) return null;

  const currentTab = Number(pageState.tabKey);
  return (
    <Row justify="center" align="middle">
      <div className="w-100">
        <Form
          layout="vertical"
          onFinish={async (data) => {
            if (session?.user?.id) await onboardUser(session.user.id, data);
            router.push("/");
          }}
        >
          <Tabs
            centered
            animated
            size="large"
            defaultActiveKey="1"
            onChange={(key) => setPageState({ tabKey: key })}
            activeKey={pageState.tabKey}
            items={[
              {
                label: "Goal",
                key: "1",

                children: (
                  <>
                    <FormItem
                      control={control}
                      name="goalName"
                      label="What's the first thing you want to save for?"
                    >
                      <Input />
                    </FormItem>
                    <FormItem
                      control={control}
                      name="goalAmount"
                      label="How much is it?"
                    >
                      <CurrencyInput />
                    </FormItem>
                    <FormItem
                      control={control}
                      name="goalDueAt"
                      label="By when?"
                    >
                      <DatePicker />
                    </FormItem>
                  </>
                ),
              },
              {
                label: "Action",
                key: "2",
                children: (
                  <>
                    <FormItem
                      control={control}
                      name="action"
                      label="What's a repeatable action that could help you save?"
                    >
                      <Input />
                    </FormItem>
                    <FormItem
                      control={control}
                      name="actionAmount"
                      label="About how much do you think it would save you each time?"
                    >
                      <CurrencyInput />
                    </FormItem>
                  </>
                ),
              },
              {
                label: "Saving",
                key: "3",
                children: (
                  <>
                    <FormItem
                      control={control}
                      name="saving"
                      label="What's something you could repeatedly skip buying?"
                    >
                      <Input />
                    </FormItem>
                    <FormItem
                      control={control}
                      name="savingAmount"
                      label="How much is it?"
                    >
                      <CurrencyInput />
                    </FormItem>
                  </>
                ),
              },
              {
                label: "Starting Point",
                key: "4",
                children: (
                  <>
                    <FormItem
                      control={control}
                      name="initialAmount"
                      label="Have you already saved an initial amount?"
                    >
                      <CurrencyInput />
                    </FormItem>
                  </>
                ),
              },
            ]}
          />
          <Row justify="end">
            {currentTab === 4 ? (
              <Form.Item>
                <Button type="primary" size="large" htmlType="submit">
                  Done
                </Button>
              </Form.Item>
            ) : (
              <Button
                type="primary"
                htmlType="button"
                onClick={() => {
                  const nextTab = currentTab + 1;
                  if (nextTab <= 4)
                    setPageState({ tabKey: nextTab.toString() });
                }}
              >
                Next
              </Button>
            )}
          </Row>
        </Form>
      </div>
    </Row>
  );
}

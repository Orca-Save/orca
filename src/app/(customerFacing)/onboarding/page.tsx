"use client";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Row,
  Space,
  Tabs,
  Typography,
} from "antd";

import CurrencyInput from "@/app/_components/CurrencyInput";
import { isFieldErrors } from "@/lib/goals";
import { isExtendedSession } from "@/lib/session";
import { applyFormErrors } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { onboardUser } from "./_actions/onboarding";
const { Title } = Typography;
export default function OnboardingPage() {
  const [form] = Form.useForm();
  const [pageState, setPageState] = useState({ tabKey: "1" });
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("azure-ad-b2c");
    },
  });
  const router = useRouter();

  if (session && !isExtendedSession(session)) return null;

  const currentTab = Number(pageState.tabKey);
  return (
    <Row justify="center" align="middle">
      <div className="w-100">
        <Form
          form={form}
          layout="vertical"
          onFinishFailed={(error) => setPageState({ tabKey: "1" })}
          onFinish={async (data) => {
            console.log("first");
            if (session?.user?.id) {
              const result = await onboardUser(session.user.id, data);
              if (isFieldErrors(result)) {
                applyFormErrors(form, result);
              } else {
                router.push("/");
              }
            }
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
                    <Title>{"Let's set up your first goal."}</Title>
                    <Form.Item
                      required
                      name="goalName"
                      label="What's the first thing you'll use Orca to help you save for?"
                      rules={[
                        {
                          required: true,
                          message: "Please give your goal a name",
                        },
                      ]}
                    >
                      <Input placeholder="ex: Vacation" />
                    </Form.Item>
                    <Form.Item
                      required
                      name="goalAmount"
                      label="How much do you need to save?"
                      rules={[
                        {
                          required: true,
                          message: "Please input the target balance",
                        },
                      ]}
                    >
                      <CurrencyInput />
                    </Form.Item>
                    <Form.Item
                      required
                      name="goalDueAt"
                      label="By when?"
                      rules={[
                        {
                          required: true,
                          message: "Please select the due date",
                        },
                      ]}
                    >
                      <DatePicker />
                    </Form.Item>

                    <Form.Item
                      name="initialAmount"
                      label="Have you saved anything toward this goal already?"
                    >
                      <CurrencyInput />
                    </Form.Item>
                  </>
                ),
              },
              {
                label: "Action",
                key: "2",
                children: (
                  <>
                    <Title>{"Let's set up a One-Tap save."}</Title>
                    <Form.Item
                      name="saving"
                      label="What's a repeatable action that could help you save?"
                    >
                      <Input placeholder="ex: Made dinner instead of DoorDashing" />
                    </Form.Item>
                    <Form.Item
                      name="savingAmount"
                      label="About how much do you think it would save you each time?"
                    >
                      <CurrencyInput />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
          <Row justify="end">
            {currentTab === 2 ? (
              <Form.Item>
                <Space direction="horizontal" size="middle">
                  <Button size="large" htmlType="submit">
                    Skip
                  </Button>
                  <Button type="primary" size="large" htmlType="submit">
                    Done
                  </Button>
                </Space>
              </Form.Item>
            ) : (
              <Button
                type="primary"
                htmlType="button"
                size="large"
                onClick={() => {
                  const nextTab = currentTab + 1;
                  if (nextTab <= 2)
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

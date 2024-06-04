'use client';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Layout,
  Row,
  Space,
  Tabs,
  Typography,
} from 'antd';

import CurrencyInput from '@/app/_components/CurrencyInput';
import { isFieldErrors } from '@/lib/goals';
import { isExtendedSession } from '@/lib/session';
import { applyFormErrors } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Open_Sans, Varela_Round } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Content } from '../_components/Layout';
import UnsplashForm from '../_components/UnsplashForm';
import { onboardUser } from './_actions/onboarding';

const { Title, Text } = Typography;

const varelaRound = Varela_Round({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-varelaround',
});
const openSans = Open_Sans({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-opensans',
});
export default function OnboardingPage() {
  const [form] = Form.useForm();
  const [pageState, setPageState] = useState({ tabKey: '1' });
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });
  const router = useRouter();

  if (session && !isExtendedSession(session)) return null;

  const currentTab = Number(pageState.tabKey);
  return (
    <>
      <Layout style={{ minHeight: '100vh', height: '100%' }}>
        <Content>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <h1
              className={`${varelaRound.className}`}
              style={{ fontSize: 40, fontWeight: 'bold' }}
            >
              Orca
            </h1>
          </div>
          <Row justify='center' align='middle'>
            <div className='w-100'>
              <Form
                form={form}
                layout='vertical'
                onFinishFailed={(error) => setPageState({ tabKey: '1' })}
                onFinish={async (data) => {
                  setLoading(true);
                  try {
                    if (session?.user?.id) {
                      const result = await onboardUser(session.user.id, data);
                      if (isFieldErrors(result)) {
                        applyFormErrors(form, result);
                      } else {
                        router.push('/?confetti=true');
                      }
                    }
                  } catch (error) {
                    console.error(error);
                  }
                  setLoading(false);
                }}
              >
                <Tabs
                  centered
                  animated
                  size='large'
                  defaultActiveKey='1'
                  style={{ maxWidth: '500px' }}
                  onChange={(key) => setPageState({ tabKey: key })}
                  activeKey={pageState.tabKey}
                  items={[
                    {
                      label: 'Goal',
                      key: '1',
                      children: (
                        <div style={{ margin: '15px' }}>
                          <h3
                            className={`${openSans.className} text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                          >
                            {"Let's set up your first goal."}
                          </h3>
                          <Form.Item
                            required
                            name='goalName'
                            label="What's the first thing you'll use Orca to help you save for?"
                            rules={[
                              {
                                required: true,
                                message: 'Please give your goal a name',
                              },
                            ]}
                          >
                            <Input placeholder='ex: Vacation' />
                          </Form.Item>
                          <Form.Item
                            required
                            name='goalAmount'
                            label='How much do you need to save?'
                            rules={[
                              {
                                required: true,
                                message: 'Please input the target balance',
                              },
                            ]}
                          >
                            <CurrencyInput />
                          </Form.Item>
                          <Form.Item
                            required
                            name='goalDueAt'
                            label='By when?'
                            rules={[
                              {
                                required: true,
                                message: 'Please select the due date',
                              },
                            ]}
                          >
                            <DatePicker />
                          </Form.Item>

                          <Form.Item name='imagePath'>
                            <UnsplashForm
                              onSelect={(url) =>
                                form.setFieldsValue({ imagePath: url })
                              }
                            />
                          </Form.Item>

                          <Form.Item
                            name='initialAmount'
                            label='Have you saved anything toward this goal already?'
                          >
                            <CurrencyInput />
                          </Form.Item>
                        </div>
                      ),
                    },
                    {
                      label: 'One-Tap',
                      key: '2',
                      children: (
                        <div style={{ margin: '15px' }}>
                          <div style={{ marginBottom: '20px' }}>
                            <h3
                              className={`${openSans.className} text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                            >
                              {"Let's set up a One-Tap save."}
                            </h3>
                            <Text>
                              Are there items that you frequently impulse
                              purchase, like DoorDash meals or afternoon coffee?
                              Create preset One-Tap buttons for your home page
                              so you can save with… one tap.
                            </Text>
                          </div>
                          <Form.Item name='saving' label='One-Tap save name'>
                            <Input placeholder='ex: Made dinner instead of DoorDashing' />
                          </Form.Item>
                          <Form.Item
                            name='savingAmount'
                            label='How much will that save you each time?'
                          >
                            <CurrencyInput />
                          </Form.Item>
                        </div>
                      ),
                    },
                  ]}
                />
                <Row justify='end' style={{ marginRight: '15px' }}>
                  {currentTab === 2 ? (
                    <Form.Item>
                      <Space direction='horizontal' size='middle'>
                        <Button
                          size='large'
                          htmlType='submit'
                          loading={loading}
                          disabled={loading}
                        >
                          Skip
                        </Button>
                        <Button
                          type='primary'
                          size='large'
                          htmlType='submit'
                          loading={loading}
                          disabled={loading}
                        >
                          Done
                        </Button>
                      </Space>
                    </Form.Item>
                  ) : (
                    <Button
                      type='primary'
                      htmlType='button'
                      size='large'
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
        </Content>
      </Layout>
    </>
  );
}

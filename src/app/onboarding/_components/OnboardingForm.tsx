'use client';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Row,
  Space,
  Tabs,
  Typography,
} from 'antd';

import PlaidLink from '@/app/(customerFacing)/user/_components/PlaidLink';
import StripeForm from '@/app/(customerFacing)/user/_components/StripeForm';
import CurrencyInput from '@/app/_components/CurrencyInput';
import { Paragraph } from '@/app/_components/Typography';
import UnsplashForm from '@/app/_components/UnsplashForm';
import { isFieldErrors } from '@/lib/goals';
import { isExtendedSession } from '@/lib/session';
import { applyFormErrors } from '@/lib/utils';
import { UserProfile } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Open_Sans, Varela_Round } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { onboardUser } from '../_actions/onboarding';

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
type OnboardingFormProps = {
  subResponse: {
    userProfile: UserProfile | null;
    clientSecret?: string;
    subscriptionId?: string;
  };
  linkToken: string;
};
export default function OnboardingForm({
  subResponse,
  linkToken,
}: OnboardingFormProps) {
  const [form] = Form.useForm();
  const [pageState, setPageState] = useState({ tabKey: '0' });
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });
  const router = useRouter();

  if (!session) return null;
  if (!isExtendedSession(session)) return null;

  const currentTab = Number(pageState.tabKey);
  console.log('currentTab', currentTab);
  const forceRender = true;
  return (
    <div>
      <Row justify='center'>
        <h1
          className={`${varelaRound.className}`}
          style={{ fontSize: 40, fontWeight: 'bold' }}
        >
          Orca
        </h1>
      </Row>
      <Row justify='center' align='middle' style={{ height: 800 }}>
        <Form
          form={form}
          layout='vertical'
          className='w-full md:w-4/5 lg:w-3/5'
          onFinishFailed={(error) => setPageState({ tabKey: '0' })}
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
            animated
            // centered
            size='small'
            tabBarStyle={{
              justifyContent: 'center',
            }}
            // renderTabBar={() => <React.Fragment />}
            tabPosition='top'
            defaultActiveKey='0'
            onChange={(key) => setPageState({ tabKey: key })}
            activeKey={pageState.tabKey}
            items={[
              {
                label: '1 Goal',
                key: '0',
                forceRender,
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
                label: '2 One-Tap',
                key: '1',
                forceRender,
                children: (
                  <div style={{ margin: '15px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h3
                        className={`${openSans.className} text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                      >
                        {"Let's set up a One-Tap save."}
                      </h3>
                      <Text>
                        Are there items that you frequently impulse purchase,
                        like DoorDash meals or afternoon coffee? Create preset
                        One-Tap buttons for your home page so you can save with…
                        one tap.
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
              {
                label: '3 Privacy',
                key: '2',
                forceRender,
                children: (
                  <div style={{ margin: '15px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h3
                        className={`${openSans.className} text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                      >
                        Thank you for choosing Orca!
                      </h3>
                      <Paragraph>
                        To ensure the best experience and keep your data secure,
                        we kindly ask you to review and agree to our privacy
                        policy. Please take a moment to read through{' '}
                        <Link href='/privacy-policy'>our Privacy Policy</Link>.
                      </Paragraph>
                    </div>
                    <Form.Item
                      name='privacyAgreement'
                      label='I have read and agree to the Privacy Policy'
                      required
                    >
                      <Checkbox />
                    </Form.Item>
                  </div>
                ),
              },
              {
                label: '4 Subscription',
                key: '3',
                forceRender,
                children: (
                  <div style={{ margin: '15px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h3
                        className={`${openSans.className} text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                      >
                        Transform Your Finances with Orca!
                      </h3>
                      <Paragraph>
                        Join Orca&apos;s subscription service to effortlessly
                        save money and manage your spending. Enjoy personalized
                        insights, real-time alerts, and user-friendly tools
                        designed to help you achieve your financial goals.
                        Subscribe now and take control of your financial future!
                      </Paragraph>
                      <Paragraph>
                        Sign up and cancel anytime at your{' '}
                        <Link href='/user'>user profile</Link>.
                      </Paragraph>
                      {subResponse.userProfile?.stripeSubscriptionId ? (
                        <>
                          <Text>
                            You are already subscribed.{' '}
                            <Link href='/user'>View your subscription</Link>
                          </Text>
                        </>
                      ) : (
                        <StripeForm
                          userId={session?.user.id}
                          email={session?.user.email ?? ''}
                          clientSecret={subResponse?.clientSecret!}
                          subscriptionId={subResponse?.subscriptionId!}
                        />
                      )}
                    </div>
                  </div>
                ),
              },
              {
                label: '5 Connect Accounts',
                key: '4',
                children: (
                  <div style={{ margin: '15px' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h3
                        className={`${openSans.className} text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                      >
                        Seamlessly Connect Your Bank Accounts with Orca!
                      </h3>
                      <Paragraph>
                        Link your first bank account effortlessly with
                        Orca&apos;s secure integration. Gain real-time insights
                        into your spending, track your savings, and enjoy a
                        unified view of your finances. Start making smarter
                        financial decisions today by connecting your accounts
                        with ease!
                      </Paragraph>

                      <Paragraph>
                        You can manage and add more linked accounts in your{' '}
                        <Link href='/user'>user profile</Link>.
                      </Paragraph>
                      <PlaidLink
                        userId={session.user.id}
                        linkToken={linkToken}
                      />
                      {/* <Subscription /> */}
                    </div>
                  </div>
                ),
              },
            ]}
          />
          <Row
            justify='end'
            style={{
              marginRight: '15px',
            }}
          >
            <Space>
              <Form.Item>
                <Button
                  size='large'
                  onClick={() => {
                    const prevTab = currentTab - 1;
                    if (prevTab >= 0)
                      setPageState({ tabKey: prevTab.toString() });
                  }}
                >
                  Back
                </Button>
              </Form.Item>
              <Form.Item>
                <Button
                  type='primary'
                  size='large'
                  key={currentTab === 4 ? 'submit' : 'button'}
                  id={currentTab === 4 ? 'submit' : 'button'}
                  htmlType={currentTab === 4 ? 'submit' : 'button'}
                  onClick={() => {
                    if (currentTab === 4) return;
                    const nextTab = currentTab + 1;
                    if (nextTab <= 4)
                      setPageState({ tabKey: nextTab.toString() });
                  }}
                >
                  Next
                </Button>
              </Form.Item>
            </Space>
          </Row>
        </Form>
      </Row>
    </div>
  );
}

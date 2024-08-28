import { HappyProvider } from '@ant-design/happy-work-theme';
import { UserOutlined } from '@ant-design/icons';
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
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useMsal } from '@azure/msal-react';
import React from 'react';
import { ItemData, OnboardingProfile, UserProfile } from '../../types/all';
import { applyFormErrors } from '../../utils/forms';
import { apiFetch } from '../../utils/general';
import { isFieldErrors } from '../../utils/goals';
import InstitutionCollapses from '../plaid/InstitutionsCollapse';
import CurrencyInput from '../shared/CurrencyInput';
import UnsplashForm from '../shared/UnsplashForm';
import CheckoutForm from '../stripe/CheckoutForm';
import PlaidLink from '../user/PlaidLink';

const { Title, Text, Paragraph } = Typography;
type OnboardingFormProps = {
  userProfile: UserProfile | null;
  linkToken: string;
  itemsData: ItemData[];
  onboardingProfile: OnboardingProfile | null;
};
export default function OnboardingForm({
  linkToken,
  userProfile,
  itemsData,
  onboardingProfile,
}: OnboardingFormProps) {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(
    userProfile?.privacyPolicyAccepted ?? false
  );
  const [pageState, setPageState] = useState(
    initialPageState(onboardingProfile, userProfile)
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const account = accounts[0];
  const currentTab = Number(pageState.tabKey);
  console.log(currentTab, userProfile);
  const forceRender = true;
  let disableNext = false;
  if (currentTab === 3 && !privacyChecked) disableNext = true;
  if (currentTab === 4 && !privacyChecked && !userProfile?.stripeSubscriptionId)
    disableNext = true;
  if (currentTab === 5 && itemsData.length === 0) disableNext = true;

  return (
    <Form
      form={form}
      layout='vertical'
      className='w-full md:w-4/5 lg:w-3/5'
      initialValues={{
        goalName: onboardingProfile?.goalName,
        goalAmount: onboardingProfile?.goalAmount,
        goalDueAt: onboardingProfile?.goalDueAt
          ? dayjs(onboardingProfile.goalDueAt)
          : undefined,
        imagePath: onboardingProfile?.imagePath,
        initialAmount: onboardingProfile?.initialAmount,
        saving: onboardingProfile?.saving,
        savingAmount: onboardingProfile?.savingAmount,
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
            key: '1',
            forceRender,
            children: (
              <div style={{ margin: '15px' }}>
                <h3
                  className={`font-sans text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
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

                <Form.Item
                  name='imagePath'
                  label='Visualize your goal!'
                  tooltip='Search and select your goal image.'
                  required
                >
                  <div>
                    <UnsplashForm
                      onSelect={(url) => {
                        form.setFieldsValue({ imagePath: url });
                        if (buttonRef.current) {
                          buttonRef.current.click();
                        }
                      }}
                      defaultValue={
                        onboardingProfile?.imagePath === null
                          ? undefined
                          : onboardingProfile?.imagePath
                      }
                    />
                  </div>
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
            key: '2',
            forceRender,
            children: (
              <div style={{ margin: '15px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    className={`font-sans text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                  >
                    {"Let's set up a One-Tap save."}
                  </h3>
                  <Text>
                    Are there items that you frequently impulse purchase, like
                    DoorDash meals or afternoon coffee? Create preset One-Tap
                    buttons for your home page so you can save with… one tap.
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
            key: '3',
            forceRender,
            children: (
              <div style={{ margin: '15px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    className={`font-sans text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                  >
                    Thank you for choosing Orca!
                  </h3>
                  <Paragraph>
                    To ensure the best experience and keep your data secure, we
                    kindly ask you to review and agree to our privacy policy.
                    Please take a moment to read through{' '}
                    <Link to='/privacy-policy'>our Privacy Policy</Link>.
                  </Paragraph>
                  <Paragraph>
                    You are able to manage your data and clear it from your{' '}
                    <Link to='/user'>user profile page</Link>.
                  </Paragraph>
                </div>
                <Form.Item
                  name='privacyAgreement'
                  label='I have read and agree to the Privacy Policy'
                  required
                >
                  <Checkbox
                    value={privacyChecked}
                    defaultChecked={privacyChecked}
                    onChange={(e) => setPrivacyChecked(e.target.checked)}
                  />
                </Form.Item>
              </div>
            ),
          },
          {
            label: '4 Subscription',
            key: '4',
            disabled: !privacyChecked && !userProfile?.stripeSubscriptionId,
            children: (
              <div style={{ margin: '15px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    className={`font-sans text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                  >
                    Transform Your Finances with Orca!
                  </h3>
                  <Paragraph>
                    Join Orca&apos;s subscription service to effortlessly save
                    money and manage your spending. Enjoy personalized insights,
                    real-time alerts, and user-friendly tools designed to help
                    you achieve your financial goals. Subscribe now and take
                    control of your financial future!
                  </Paragraph>
                  {userProfile?.stripeSubscriptionId ? (
                    <>
                      <Text>
                        You are subscribed.{' '}
                        <Link to='/user'>View your subscription</Link>
                      </Text>
                    </>
                  ) : (
                    <Paragraph>
                      Sign up and cancel anytime at your{' '}
                      <Link to='/user'>
                        <UserOutlined /> user profile
                      </Link>
                      .
                    </Paragraph>
                  )}

                  {currentTab === 4 && !userProfile?.stripeSubscriptionId ? (
                    <CheckoutForm
                      setSubscriptionId={(id) => {
                        if (userProfile) userProfile.stripeSubscriptionId = id;
                      }}
                    />
                  ) : null}
                </div>
              </div>
            ),
          },
          {
            label: '5 Connect Accounts',
            key: '5',
            forceRender,
            disabled: !privacyChecked, // || !userProfile?.stripeSubscriptionId,
            children: (
              <div style={{ margin: '15px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    className={`font-sans text-center decoration-clone pb-3 text-3xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
                  >
                    Seamlessly Connect Your Bank Accounts with Orca!
                  </h3>
                  <Paragraph>
                    Link your first bank account effortlessly with Orca&apos;s
                    secure integration. Gain real-time insights into your
                    spending, track your savings, and enjoy a unified view of
                    your finances. Start making smarter financial decisions
                    today by connecting your accounts with ease!
                  </Paragraph>

                  <Paragraph>
                    You can manage and add more linked accounts in your{' '}
                    <Link to='/user'>
                      <UserOutlined />
                      user profile
                    </Link>
                    .
                  </Paragraph>
                  <PlaidLink linkToken={linkToken} />
                  <InstitutionCollapses itemsData={itemsData} />
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
              data-id='onboarding-form-back'
              size='large'
              onClick={() => {
                const prevTab = currentTab - 1;
                if (prevTab >= 0) setPageState({ tabKey: prevTab.toString() });
              }}
            >
              Back
            </Button>
          </Form.Item>
          {currentTab === 5 && (
            <Form.Item>
              <Button
                size='large'
                onClick={async () => {
                  setLoading(true);
                  if (currentTab === 5) {
                    const newOnboardingProfile = {
                      ...onboardingProfile,
                      ...form.getFieldsValue(),
                      privacyAgreement: privacyChecked,
                      goalDueAt: form.getFieldValue('goalDueAt')?.format(),
                    };
                    await apiFetch('/api/users/onboardUser', 'POST', {
                      onboardingProfile: newOnboardingProfile,
                      skipSync: true,
                    });
                    navigate('/?confetti=true');
                  }
                  setLoading(false);
                }}
              >
                Skip
              </Button>
            </Form.Item>
          )}
          <Form.Item>
            <HappyProvider>
              <Button
                type='primary'
                data-id='onboarding-form-next'
                size='large'
                disabled={disableNext}
                loading={loading}
                onClick={async () => {
                  console.log('next');
                  if (currentTab === 3 && !privacyChecked) return;
                  if (currentTab === 4 && !userProfile?.stripeSubscriptionId)
                    return;

                  setLoading(true);
                  const newOnboardingProfile = {
                    ...onboardingProfile,
                    ...form.getFieldsValue(),
                    privacyAgreement: privacyChecked,
                    goalDueAt: form.getFieldValue('goalDueAt')?.format(),
                  };
                  if (currentTab === 5) {
                    await apiFetch('/api/users/onboardUser', 'POST', {
                      onboardingProfile: newOnboardingProfile,
                    });
                    setLoading(false);
                    navigate('/?confetti=true');
                    return;
                  } else if (currentTab !== 4) {
                    const result = await apiFetch(
                      '/api/users/saveOnboardingProfile',
                      'POST',
                      { onboardingProfile: newOnboardingProfile }
                    );
                    if (isFieldErrors(result)) {
                      console.log('field errors', result);
                      applyFormErrors(form, result);
                      setPageState({ tabKey: '1' });
                      return;
                    }
                  }
                  setLoading(false);

                  const nextTab = currentTab + 1;
                  if (nextTab <= 5)
                    setPageState({ tabKey: nextTab.toString() });
                }}
              >
                {currentTab === 5 ? 'Done' : 'Next'}
              </Button>
            </HappyProvider>
          </Form.Item>
        </Space>
      </Row>
    </Form>
  );
}

function initialPageState(
  onboardingProfile: OnboardingProfile | null,
  userProfile: UserProfile | null
) {
  let tabKey = '1';
  if (onboardingProfile) {
    if (onboardingProfile.goalName) tabKey = '2';
    if (onboardingProfile.saving) tabKey = '3';
    if (userProfile?.privacyPolicyAccepted) tabKey = '4';
    if (userProfile?.stripeSubscriptionId) tabKey = '5';
  }
  return {
    tabKey,
  };
}

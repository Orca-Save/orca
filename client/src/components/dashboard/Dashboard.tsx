import { HappyProvider } from '@ant-design/happy-work-theme';
import { useMsal } from '@azure/msal-react';
import {
  Button,
  ConfigProvider,
  Space,
  Tour,
  TourProps,
  Typography,
} from 'antd';
import * as emoji from 'node-emoji';
import { Link, useSearchParams } from 'react-router-dom';
import Pay from '../../plugins/payPlugin';

import { useRef, useState } from 'react';
import { apiFetch } from '../../utils/general';
import { greenThemeColors } from '../../utils/themeConfig';
import ReviewLink from '../plaid/ReviewLink';
import ConfettiComp from '../shared/Confetti';
import DashGoalCard from './DashGoalCard';
import DashboardSaveButtons from './DashQuickSave';

const { Title } = Typography;

export default function Dashboard({
  goal,
  quickTransfers,
  userTour,
  unreadTransactionCount,
  completedCounts,
}: {
  goal: any;
  quickTransfers: any;
  userTour: any;
  unreadTransactionCount: any;
  completedCounts: any;
}) {
  const oneTapSaves = useRef(null);
  const impulseSaves = useRef(null);
  const reviewTransactions = useRef(null);

  const { accounts } = useMsal();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = accounts[0]?.localAccountId;

  const [open, setOpen] = useState<boolean>(!!userTour?.dashQuickSave == false);

  const addGoalCurrentBalance = (amount: number) => {
    goal.currentBalance += amount;
  };
  const tourChange = (step: number) => {
    const tour: any = {};
    if (step === 1) tour.dashQuickSave = true;
    if (step === 2) tour.impulseSave = true;
    if (step === 3) tour.reviewTransactions = true;
    apiFetch('/api/users/updateTour', 'POST', {
      tour,
    });
  };
  const tourClose = () => {
    setOpen(false);
    const tour = {
      dashQuickSave: true,
      impulseSave: true,
      reviewTransactions: true,
    };
    apiFetch('/api/users/updateTour', 'POST', {
      tour,
    });
  };
  const style = { maxWidth: '100vw' };
  const steps: TourProps['steps'] = [
    {
      title: 'One-Tap Saves',
      style,
      description:
        "Here's the One-Tap button you just created. Tap it and you'll see the progress bar on your goal fill up.",
      target: () => oneTapSaves.current,
    },
    {
      title: 'Impulse Saves',
      style,
      description:
        'Tap here to record a unique would be purchase, and instead set aside that money for your goal.',
      target: () => impulseSaves.current,
    },
    {
      title: 'Review Transactions',
      style,
      description:
        'Tap here to review your transactions and quickly mark which were impulse buys. This helps us find what to work on to meet your goals, and you only review what you have control over, no rent payments in here.',
      target: () => reviewTransactions.current,
    },
  ];
  return (
    <div className='flex justify-center'>
      <ConfettiComp run={searchParams.get('confetti') === 'true'} path='/' />
      <Space direction='vertical' style={{ width: '100%' }}>
        <Button
          onClick={() =>
            Pay.subscribe({
              productId: 'main_sub',
              accessToken: localStorage.getItem('accessToken')!,
            }).then(console.log)
          }
        >
          Echoooo
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          Focus Goal
        </Title>
        <DashGoalCard completedCounts={completedCounts} goal={goal} />
        <Link to='/savings/new'>
          <ConfigProvider
            theme={{
              components: {
                Button: greenThemeColors,
              },
            }}
          >
            <HappyProvider>
              <Button
                ref={impulseSaves}
                data-id='dash-impulse-save-nav'
                size='large'
                type='primary'
                style={{
                  width: '100%',
                  height: '90px',
                  color: 'black',
                }}
              >
                <strong>
                  <span className='pr-2'>Impulse Save</span>
                </strong>
                {emoji.find('money_mouth_face')?.emoji}
              </Button>
            </HappyProvider>
          </ConfigProvider>
        </Link>
        <div ref={reviewTransactions}>
          <ReviewLink unreadObj={unreadTransactionCount} />
        </div>
        <Title level={4} style={{ margin: 0 }}>
          One-Tap Impulse Saves
        </Title>
        <div ref={oneTapSaves}>
          <DashboardSaveButtons
            addGoalCurrentBalance={addGoalCurrentBalance}
            goalId={goal?.id}
            quickTransfers={quickTransfers}
          />
        </div>
      </Space>
      <Tour
        open={open}
        onChange={tourChange}
        onClose={tourClose}
        steps={steps}
      />
    </div>
  );
}

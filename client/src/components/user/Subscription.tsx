import { Button, Typography } from 'antd';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Link } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import UpdateSubscriptionForm from './UpdateSubscriptionForm';

const { Title, Text } = Typography;

export default function Subscription() {
  dayjs.extend(localizedFormat);
  const { data } = useFetch('api/components/subscription', 'GET');
  if (!data) return null;
  const { userProfile, subscription } = data;
  if (userProfile?.stripeSubscriptionId) {
    return (
      <>
        <Title level={4}>Subscription</Title>
        <div>
          <Text>
            Next Bill Date:{' '}
            {dayjs(subscription!.current_period_end * 1000).format('ll')}
          </Text>
        </div>
        <div>
          <Text>Rate: $4/month</Text>
        </div>
        <div>
          <Text>
            Status:{' '}
            {subscription?.cancel_at_period_end
              ? 'Cancel at end of period'
              : 'Active'}
          </Text>
        </div>
        <UpdateSubscriptionForm
          cancel={!subscription?.cancel_at_period_end}
          actionText={
            subscription?.cancel_at_period_end
              ? 'Continue Subscription'
              : 'Stop Subscription'
          }
        />
      </>
    );
  }

  return (
    <>
      <Title level={4}>Subscription</Title>
      <div>
        <Text>
          You are not currently subscribed. Subscribe and cancel at anytime.
        </Text>
      </div>

      <Link to='/subscribe'>
        <Button data-id='subscription-nav-button' type='primary' size='large'>
          Begin Subscription
        </Button>
      </Link>
    </>
  );
}

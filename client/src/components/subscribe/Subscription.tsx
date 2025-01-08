import { Capacitor } from '@capacitor/core';
import { Button, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import React from 'react';
import { Link } from 'react-router-dom';

import Pay from '../../plugins/payPlugin';
import { UserProfile } from '../../types/all';
import { apiFetch } from '../../utils/general';

//@ts-ignore
import { ReactComponent as GooglePay } from './googlePay.svg';

const { Title, Text } = Typography;

export default function Subscription({
  userProfile,
  stripeSubscription,
  googleSubscription,
  appleSubscription,
}: {
  userProfile?: UserProfile;
  stripeSubscription: any;
  googleSubscription: any;
  appleSubscription: any;
}) {
  dayjs.extend(localizedFormat);
  const platform = Capacitor.getPlatform();
  const [loading, setLoading] = React.useState(false);
  if (platform === 'android' || googleSubscription?.autoRenewing)
    return (
      <div>
        <Title level={4}>Subscription</Title>
        {googleSubscription ? (
          <>
            <div>
              <Text>
                Next Bill Date:{' '}
                {googleSubscription?.expiryTimeMillis
                  ? dayjs(googleSubscription.expiryTimeMillis).format('LL')
                  : 'N/A'}
              </Text>
            </div>
            <div>
              <Text>
                Rate:{' '}
                {googleSubscription?.priceAmountMicros
                  ? `${(googleSubscription.priceAmountMicros / 1e6).toFixed(
                      2
                    )} ${googleSubscription.priceCurrencyCode}/month`
                  : 'N/A'}
              </Text>
            </div>
            <div>
              <Text>
                Status:{' '}
                {googleSubscription
                  ? googleSubscription.isActive
                    ? 'Active'
                    : googleSubscription.subscriptionStatus.replaceAll('_', ' ')
                  : 'Unknown'}
              </Text>
            </div>
            <div>
              <Text>
                Manage your subscription in the Google Play Store below
              </Text>
            </div>
          </>
        ) : (
          <Text>Subscribe to link your bank</Text>
        )}
        {platform === 'android' ? (
          <GooglePay
            style={{ height: 70 }}
            onClick={async () => {
              try {
                if (
                  !googleSubscription ||
                  googleSubscription?.isActive === false
                ) {
                  await Pay.subscribe({
                    // @ts-ignore
                    productId: process.env.REACT_APP_GOOGLE_PRODUCT_ID!,
                    backendURL:
                      // @ts-ignore
                      process.env.REACT_APP_API_URL!,
                    accessToken: localStorage.getItem('accessToken')!,
                  });
                } else {
                  await Pay.manageSubscription();
                }
                window.location.reload();
              } catch (err) {
                console.error(err);
              }
            }}
          />
        ) : (
          <Button
            onClick={async () => {
              await apiFetch('/api/users/cancelGoogleSub', 'GET');
              window.location.reload();
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    );

  if (platform === 'ios' || appleSubscription)
    return (
      <Space direction='vertical'>
        {appleSubscription ? (
          <>
            <div>
              <Text>
                Next Bill Date:{' '}
                {appleSubscription.subscriptionEnd
                  ? dayjs(appleSubscription.subscriptionEnd).format('LL')
                  : 'N/A'}
              </Text>
            </div>
            <div>
              <Text>
                Rate:{' '}
                {appleSubscription?.priceAmountMicros
                  ? `${(appleSubscription.priceAmountMicros / 1e6).toFixed(
                      2
                    )} ${appleSubscription.priceCurrencyCode}/month`
                  : 'N/A'}
              </Text>
            </div>
            <div>
              <Text>
                Status: {appleSubscription?.isActive ? 'Active' : 'Expired'}
              </Text>
            </div>
            <div>
              {platform === 'ios' ? (
                <Text>Manage your subscription in the App Store below</Text>
              ) : (
                <Text>
                  Manage your subscription from your apple device, or the Apple
                  store.
                </Text>
              )}
            </div>
          </>
        ) : (
          <Text>Subscribe to link your bank</Text>
        )}
        {platform === 'ios' && (
          <Button
            type='primary'
            size='large'
            loading={loading}
            onClick={async () => {
              setLoading(true);
              try {
                if (
                  !appleSubscription ||
                  appleSubscription?.isActive === false
                ) {
                  await Pay.subscribe({
                    // @ts-ignore
                    productId: process.env.REACT_APP_APPLE_PRODUCT_ID!,
                    backendURL:
                      // @ts-ignore
                      process.env.REACT_APP_API_URL!,
                    accessToken: localStorage.getItem('accessToken')!,
                  });
                  window.location.reload();
                } else {
                  await Pay.manageSubscription();
                  window.location.reload();
                }
              } catch (err) {
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
          >
            {appleSubscription?.isActive
              ? 'Manage Subscription'
              : 'Subscribe for $3.99/Month'}
          </Button>
        )}
        <Space>
          <Link to='/privacy-policy'>
            <Button>Privacy Policy</Button>
          </Link>
          <Button href='https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'>
            Terms of Use
          </Button>
        </Space>
      </Space>
    );

  if (userProfile?.stripeSubscriptionId && stripeSubscription) {
    return (
      <>
        <Title level={4}>Subscription</Title>
        <div>
          <Text>
            Next Bill Date:{' '}
            {dayjs(stripeSubscription!.current_period_end * 1000).format('ll')}
          </Text>
        </div>
        <div>
          <Text>Rate: $4/month</Text>
        </div>
        <div>
          <Text>
            Status:{' '}
            {stripeSubscription?.cancel_at_period_end
              ? 'Cancel at end of period'
              : 'Active'}
          </Text>
        </div>
        <Button
          data-id='update-subscription-button'
          onClick={async () => {
            await apiFetch('/api/stripe/updateSubscription', 'POST', {
              cancel: !stripeSubscription?.cancel_at_period_end,
            });
            window.location.reload();
          }}
        >
          {stripeSubscription?.cancel_at_period_end
            ? 'Continue Subscription'
            : 'Stop Subscription'}
        </Button>
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

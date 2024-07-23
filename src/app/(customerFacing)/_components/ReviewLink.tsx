import { HappyProvider } from '@/components/HappyProvider';
import { UnreadCountObject } from '@/lib/plaid';
import { Badge, Button, ConfigProvider, Flex } from 'antd';
import Link from 'next/link';
import ItemsLoginRequired from '../user/_components/ItemsLoginRequired';
import ConnectPlaid from './ConnectPlaid';
import RefreshPlaidItems from './RefreshPlaidItems';

export default async function ReviewLink({
  unreadObj,
  userId,
}: {
  unreadObj: UnreadCountObject;
  userId: string;
}) {
  if (unreadObj.plaidItemExists === false)
    return <ConnectPlaid userId={userId} />;

  if (unreadObj.loginRequired) return <ItemsLoginRequired userId={userId} />;
  return (
    <Flex
      justify='center'
      align='center'
      style={{
        marginBottom: '1rem',
        width: '100%',
      }}
    >
      <RefreshPlaidItems userId={userId} height={90} />
      <Link href='/review' className='w-full'>
        <HappyProvider>
          <Button
            size='large'
            type='primary'
            disabled={unreadObj.unreadCount === 0}
            style={{ width: '100%', height: 90 }}
          >
            {unreadObj.unreadCount ? (
              <Flex align='center' justify='center'>
                <strong>
                  <span className='pr-2'>Review Transactions</span>
                </strong>

                <ConfigProvider
                  theme={{
                    components: {
                      Badge: {
                        lineWidth: 0,
                      },
                    },
                  }}
                >
                  <Badge count={unreadObj.unreadCount} overflowCount={99} />
                </ConfigProvider>
              </Flex>
            ) : (
              <>
                <strong>
                  <span className='pr-2'>All Transactions Reviewed</span>
                </strong>
                🎉
              </>
            )}
          </Button>
        </HappyProvider>
      </Link>
    </Flex>
  );
}

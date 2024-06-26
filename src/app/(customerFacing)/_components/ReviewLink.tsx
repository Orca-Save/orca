import { getNextRefreshTime } from '@/app/_actions/plaid';
import { HappyProvider } from '@/components/HappyProvider';
import { UnreadCountObject } from '@/lib/plaid';
import { Badge, Button, ConfigProvider, Flex } from 'antd';
import Link from 'next/link';
import RefreshPlaidItems from './RefreshPlaidItems';

export default async function ReviewLink({
  unreadObj,
  userId,
}: {
  unreadObj: UnreadCountObject;
  userId: string;
}) {
  const nextRefreshTime = await getNextRefreshTime(userId);
  return (
    <Flex
      justify='center'
      align='center'
      style={{
        marginBottom: '1rem',
        width: '100%',
      }}
    >
      <RefreshPlaidItems
        userId={userId}
        height={90}
        nextRefreshTime={nextRefreshTime}
      />
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

import { getNextRefreshTime, getUserItems } from '@/app/_actions/plaid';
import { HappyProvider } from '@/components/HappyProvider';
import { UnreadCountObject } from '@/lib/plaid';
import { Badge, Button, ConfigProvider, Flex } from 'antd';
import Link from 'next/link';
import RefreshPlaidItems from './RefreshPlaidItems';

export default async function ReviewLink({
  unreadObj,
  userId,
  hideSyncWhenHasItems,
}: {
  unreadObj: UnreadCountObject;
  userId: string;
  hideSyncWhenHasItems?: boolean;
}) {
  const [nextRefreshTime, userItems] = await Promise.all([
    getNextRefreshTime(userId),
    getUserItems(userId),
  ]);
  const hasItems = userItems.length > 0;
  const showSync =
    !hideSyncWhenHasItems || !hasItems || unreadObj.unreadCount === 0;
  return (
    <Flex
      justify='center'
      align='center'
      style={{
        marginBottom: '1rem',
        width: '100%',
      }}
    >
      {showSync && (
        <RefreshPlaidItems
          userId={userId}
          height={90}
          hasItems={hasItems}
          nextRefreshTime={nextRefreshTime}
        />
      )}
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

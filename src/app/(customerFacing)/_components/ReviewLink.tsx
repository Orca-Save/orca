import { UnreadCountObject } from '@/app/_actions/users';
import { HappyProvider } from '@/components/HappyProvider';
import { Badge, Button, ConfigProvider, Flex } from 'antd';
import Link from 'next/link';

export default async function ReviewLink({
  unreadObj,
}: {
  unreadObj: UnreadCountObject;
}) {
  return (
    <Link href='/review'>
      <HappyProvider>
        <Button
          size='large'
          type='primary'
          disabled={unreadObj.unreadCount === 0}
          style={{ width: '100%', height: '90px', marginBottom: '1rem' }}
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
  );
}

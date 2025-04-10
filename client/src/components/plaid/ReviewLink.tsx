import { HappyProvider } from '@ant-design/happy-work-theme';
import { Badge, Button, ConfigProvider, Flex } from 'antd';
import { Link } from 'react-router-dom';

import { antdDefaultButton } from '../../utils/themeConfig';
import ConnectPlaid from './ConnectPlaid';
import ItemsLoginRequired from './ItemsLoginRequired';
import RefreshPlaidItems from './RefreshPlaidItems';

type UnreadCountObject = {
  unreadCount: number;
  plaidItemExists: boolean;
  loginRequired: boolean;
};

export default function ReviewLink({
  unreadObj,
}: {
  unreadObj: UnreadCountObject;
}) {
  if (unreadObj.plaidItemExists === false) return <ConnectPlaid />;

  if (unreadObj.loginRequired) return <ItemsLoginRequired />;
  return (
    <Flex
      justify='center'
      align='center'
      style={{
        marginBottom: '1rem',
        width: '100%',
      }}
    >
      <RefreshPlaidItems height={90} />
      <Link to='/review' className='w-full'>
        <HappyProvider>
          <ConfigProvider
            theme={{
              components: {
                Badge: {
                  lineWidth: 0,
                },
                Button: antdDefaultButton,
              },
            }}
          >
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

                  <Badge count={unreadObj.unreadCount} overflowCount={99} />
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
          </ConfigProvider>
        </HappyProvider>
      </Link>
    </Flex>
  );
}

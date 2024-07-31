import { Card } from 'antd';

import useFetch from '../../hooks/useFetch';
import PlaidLink from '../user/PlaidLink';

export default function ItemsLoginRequired() {
  const { data } = useFetch('api/plaid/linkedItems', 'GET');
  const { items } = data;
  const loginRequiredItems = items.filter((x: any) => x.loginRequired);
  return (
    <Card title='Expired logins'>
      {loginRequiredItems.map((item: any) => (
        <div key={item.itemId}>
          <PlaidLink
            text={item.institution?.name + ' Login Required'}
            linkToken={item.linkToken}
            overrideExistingAccountCheck={true}
          />
        </div>
      ))}
    </Card>
  );
}

import { Card } from 'antd';
import React from 'react';
import useFetch from '../../hooks/useFetch';
import PlaidLink from '../user/PlaidLink';

export default function ItemsLoginRequired({ userId }: { userId: string }) {
  const { data } = useFetch('api/plaid/linkedItems', 'GET');
  const { items } = data;
  const loginRequiredItems = items.filter((x) => x.loginRequired);
  return (
    <Card title='Expired logins'>
      {loginRequiredItems.map((item) => (
        <div key={item.itemId}>
          <PlaidLink
            text={item.institution?.name + ' Login Required'}
            linkToken={item.linkToken}
            overrideExistingAccountCheck={true}
            userId={userId}
          />
        </div>
      ))}
    </Card>
  );
}

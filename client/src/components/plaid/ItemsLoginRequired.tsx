import { Card } from 'antd';
import React from 'react';

export default function ItemsLoginRequired({ userId }: { userId: string }) {
  const items = await getAllLinkedItems(userId);
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

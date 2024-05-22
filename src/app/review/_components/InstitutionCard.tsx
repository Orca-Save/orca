import { Avatar, Card, Typography } from 'antd';
import { AccountBase, Institution } from 'plaid';
import React from 'react';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface InstitutionCardProps {
  institution: Institution;
}

const InstitutionCard: React.FC<InstitutionCardProps> = ({ institution }) => {
  const src = institution.logo ?? institution.url + '/favicon.ico';
  return (
    <Card className='w-full'>
      <Meta
        avatar={<Avatar src={src} />}
        title={institution.name}
        description={<Text type='secondary'>{institution.url}</Text>}
      />
    </Card>
  );
};

interface AccountCardProps {
  account: AccountBase | undefined;
  institution: Institution;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, institution }) => (
  <Card className='w-full'>
    <Meta
      avatar={<Avatar src={institution.logo} />}
      title={
        <>
          <Text strong>Account:</Text> {account?.name} ({account?.mask})
        </>
      }
      description={
        <>
          {' '}
          <Text strong>Balance:</Text> ${account?.balances?.current?.toFixed(2)}
        </>
      }
    />
  </Card>
);

export { AccountCard, InstitutionCard };

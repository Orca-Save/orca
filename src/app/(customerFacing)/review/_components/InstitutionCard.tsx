import { Avatar, Card, Typography } from 'antd';
import { AccountBase, Institution } from 'plaid';
import React from 'react';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface InstitutionCardProps {
  account: AccountBase | undefined;
  categoryIcon: string;
  institution?: Institution;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  account,
  institution,
}) => {
  const src = institution?.logo ?? institution?.url + '/favicon.ico';
  return (
    <Card className='w-full'>
      <Meta avatar={<Avatar src={src} />} title={institution?.name} />
      <Meta
        title={
          <>
            <Text strong>Account:</Text> {account?.name} ({account?.mask})
          </>
        }
        description={
          <>
            {' '}
            <Text strong>Balance:</Text> $
            {account?.balances?.current?.toFixed(2)}
          </>
        }
      />
    </Card>
  );
};

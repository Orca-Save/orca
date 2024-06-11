'use client';

import { ItemData, removePlaidItem } from '@/app/_actions/plaid';
import { Title } from '@/app/_components/Typography';
import { currencyFormatter } from '@/lib/utils';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, List, Space } from 'antd';
import { AccountBase, Institution } from 'plaid';
import PlaidLink from './PlaidLink';

const { Panel } = Collapse;

type InstitutionProps = {
  institution?: Institution;
  accounts: AccountBase[];
  linkToken: string;
  linkText: string;
  userId: string;
};
const InstitutionCollapse = ({
  institution,
  linkToken,
  accounts,
  linkText,
  userId,
}: InstitutionProps) => {
  const handleRemoveInstitution = async (institutionId: string) => {
    await removePlaidItem(institutionId);
  };
  return (
    <Collapse>
      <Panel
        header={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              {institution?.name ?? 'Login required. Expand to complete login.'}
            </span>
          </div>
        }
        key='1'
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <Space>
            <PlaidLink
              linkToken={linkToken}
              userId={userId}
              size='middle'
              text={linkText}
            />
            <Button
              data-id='remove-institution-button'
              type='primary'
              disabled={!institution?.institution_id}
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                handleRemoveInstitution(institution?.institution_id || '')
              }
            >
              Remove Institution
            </Button>
          </Space>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={accounts}
            renderItem={(account) => (
              <List.Item>
                <Card title={account.name}>
                  <p>Type: {account.type}</p>
                  <p>Subtype: {account.subtype}</p>
                  <p>Mask: {account.mask}</p>
                  <p>
                    Balance: {currencyFormatter(account.balances.current ?? '')}{' '}
                    {account.balances.iso_currency_code}
                  </p>
                </Card>
              </List.Item>
            )}
          />
        </Space>
      </Panel>
    </Collapse>
  );
};

const InstitutionCollapses = ({
  itemsData,
  userId,
}: {
  itemsData: ItemData[];
  userId: string;
}) => {
  return (
    <div>
      {itemsData.length > 0 && (
        <Title level={5}>Currently connected accounts</Title>
      )}
      {itemsData.map(({ institution, accounts, linkToken, linkText }) => (
        <InstitutionCollapse
          key={institution?.institution_id}
          institution={institution}
          linkToken={linkToken}
          linkText={linkText}
          userId={userId}
          accounts={accounts}
        />
      ))}
    </div>
  );
};

export default InstitutionCollapses;

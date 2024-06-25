'use client';

import { ItemData, removePlaidItem } from '@/app/_actions/plaid';
import { Title } from '@/app/_components/Typography';
import { DeleteOutlined } from '@ant-design/icons';
import { Account } from '@prisma/client';
import { Button, Card, Collapse, List, Popconfirm, Space } from 'antd';
import { Institution } from 'plaid';
import PlaidLink from './PlaidLink';

const { Panel } = Collapse;

type InstitutionProps = {
  institution?: Institution;
  accounts: Account[];
  linkToken: string;
  linkText: string;
  userId: string;
  itemId: string;
};
const InstitutionCollapse = ({
  institution,
  linkToken,
  accounts,
  linkText,
  userId,
  itemId,
}: InstitutionProps) => {
  const handleRemoveInstitution = async () => {
    await removePlaidItem(itemId);
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
          <Space wrap>
            <PlaidLink
              linkToken={linkToken}
              userId={userId}
              size='middle'
              text={linkText}
              usingExistingInstitution={true}
            />
            <Popconfirm
              placement='topLeft'
              title={'Confirm Deletion'}
              description={'Are you sure you want to remove this institution?'}
              okText='Yes'
              cancelText='No'
            >
              <Button
                data-id='remove-institution-button'
                type='primary'
                disabled={!institution?.institution_id}
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemoveInstitution}
              >
                Remove Institution
              </Button>
            </Popconfirm>
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
      {itemsData.map(
        ({ institution, accounts, linkToken, itemId, linkText }) => (
          <InstitutionCollapse
            key={institution?.institution_id}
            institution={institution}
            itemId={itemId}
            linkToken={linkToken}
            linkText={linkText}
            userId={userId}
            accounts={accounts}
          />
        )
      )}
    </div>
  );
};

export default InstitutionCollapses;

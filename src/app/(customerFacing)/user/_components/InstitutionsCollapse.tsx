'use client';

import { removePlaidItem } from '@/app/_actions/plaid';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, List } from 'antd';
import { AccountBase, Institution } from 'plaid';

const { Panel } = Collapse;

type InstitutionProps = {
  institution?: Institution;
  accounts: AccountBase[];
};
const InstitutionCollapse = ({ institution, accounts }: InstitutionProps) => {
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
            <span>{institution?.name}</span>
            <Button
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
          </div>
        }
        key='1'
      >
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
                  Balance: {account.balances.current}{' '}
                  {account.balances.iso_currency_code}
                </p>
              </Card>
            </List.Item>
          )}
        />
      </Panel>
    </Collapse>
  );
};

const InstitutionCollapses = ({
  itemsData,
}: {
  itemsData: {
    institution: Institution | undefined;
    accounts: AccountBase[];
  }[];
}) => {
  return (
    <div>
      {itemsData.map(({ institution, accounts }) => (
        <InstitutionCollapse
          key={institution?.institution_id}
          institution={institution}
          accounts={accounts}
        />
      ))}
    </div>
  );
};

export default InstitutionCollapses;
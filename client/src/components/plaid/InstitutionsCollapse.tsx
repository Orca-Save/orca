import { DeleteOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Collapse,
  List,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import React from 'react';

import { InstitutionProps, ItemData } from '../../types/all';
import { apiFetch } from '../../utils/general';
import PlaidLink from '../user/PlaidLink';

const { Panel } = Collapse;
const { Title } = Typography;

const InstitutionCollapse = ({
  institution,
  linkToken,
  accounts,
  linkText,
  itemId,
}: InstitutionProps) => {
  const handleRemoveInstitution = async () => {
    const results = await apiFetch('/api/plaid/removeItem', 'POST', {
      itemId,
    });
  };
  return (
    <Collapse>
      <Panel
        forceRender
        header={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              {institution?.name ??
                'Login or subscription required. Expand to complete login.'}
            </span>
          </div>
        }
        key='1'
      >
        <Space direction='vertical' style={{ width: '100%' }}>
          <Space wrap>
            <PlaidLink
              linkToken={linkToken}
              size='middle'
              text={linkText}
              overrideExistingAccountCheck={true}
            />
            <Popconfirm
              placement='topLeft'
              title={'Confirm Deletion'}
              description={'Are you sure you want to remove this institution?'}
              okText='Yes'
              cancelText='No'
              onConfirm={handleRemoveInstitution}
            >
              <Button
                data-id='remove-institution-button'
                type='primary'
                disabled={!institution?.institution_id}
                danger
                icon={<DeleteOutlined />}
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

const InstitutionCollapses = ({ itemsData }: { itemsData: ItemData[] }) => {
  console.log({ itemsData });
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
            accounts={accounts}
          />
        )
      )}
    </div>
  );
};

export default InstitutionCollapses;

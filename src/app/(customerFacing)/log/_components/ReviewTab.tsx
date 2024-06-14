import { Text } from '@/app/_components/Typography';
import { Button, Col, Row, Space } from 'antd';
import TransactionList from './TransactionList';

export default async function ReviewTab() {
  return (
    <Space direction='vertical' className='w-full'>
      <Row justify='center'>
        <Col span={24}>
          <Button
            data-id='review-transactions-nav'
            size='large'
            type='primary'
            style={{
              width: '100%',
              height: '90px',
              fontWeight: 'bold',
            }}
          >
            Review Transactions
          </Button>
        </Col>
      </Row>

      <Row justify='center'>
        <Col span={5}>
          <Space direction='vertical'>
            <Text strong>Filters</Text>
            <Button size='small'> All</Button>
          </Space>
        </Col>
        {[
          {
            filterLabel: 'Reviewed',
            antiFilterLabel: 'Not Reviewed',
            value: 'reviewed',
          },
          {
            filterLabel: 'Impulse Buy',
            antiFilterLabel: 'Non-Impulse',
            value: 'impulseBuy',
          },
          {
            filterLabel: 'Recurring',
            antiFilterLabel: 'Non-Recurring',
            value: 'recurring',
          },
        ].map(({ filterLabel, antiFilterLabel }) => (
          <Col span={5}>
            <Space direction='vertical' className='w-full'>
              <Button size='small' className='w-full' shape='round'>
                {filterLabel}
              </Button>
              <Button size='small' className='w-full' shape='round'>
                {antiFilterLabel}
              </Button>
            </Space>
          </Col>
        ))}
      </Row>
      <TransactionList />
      <Space direction='vertical'></Space>
      <Space wrap></Space>
    </Space>
  );
}

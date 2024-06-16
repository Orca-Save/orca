'use client';

import { FormattedTransaction } from '@/app/_actions/plaid';
import { antdDefaultButton, impulseButtonTheme } from '@/lib/themeConfig';
import { currencyFormatter } from '@/lib/utils';
import {
  Button,
  Col,
  ConfigProvider,
  Flex,
  List,
  Row,
  Space,
  Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
const { Text } = Typography;

type TransactionListProps = {
  transactions: FormattedTransaction[];
};
type FilterType = 'all' | 'reviewed' | 'impulseBuy' | 'recurring';
type Filter = {
  filter: FilterType;
  antiFilter: boolean;
};
export default function TransactionList({
  transactions,
}: TransactionListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<{
    antiFilter: boolean;
    filter: FilterType;
  }>({
    antiFilter: false,
    filter: 'all',
  });

  const setFilterHandler = (filter: FilterType, antiFilter: boolean) => {
    setFilter({ filter, antiFilter });
  };
  const groupedTransactionsArray = groupedTransactions(transactions, filter);
  return (
    <>
      <FilterOptions filter={filter} setFilterHandler={setFilterHandler} />

      <List
        dataSource={groupedTransactionsArray}
        split={false}
        renderItem={({ friendlyDistanceDate, transactions }) => (
          <List.Item>
            <Space direction='vertical' className='w-full'>
              <Text strong>{friendlyDistanceDate}</Text>
              {transactions.map((transaction) => (
                <List.Item
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                  key={transaction.id}
                  className='hover:bg-gray-200 hover:shadow-lg cursor-pointer transition-colors duration-300'
                >
                  <Row className='w-full mx-2'>
                    <Col span={16}>
                      <Text strong>
                        {transaction.merchantName
                          ? transaction.merchantName
                          : 'Unknown'}{' '}
                      </Text>
                      <Text type='secondary'>
                        ({transaction.accountName} {transaction.accountMask})
                      </Text>
                    </Col>
                    <Col span={2}>
                      {transaction.impulse ? (
                        <ConfigProvider
                          theme={{
                            components: {
                              Button: impulseButtonTheme,
                            },
                          }}
                        >
                          <Button type='primary' shape='circle'>
                            I
                          </Button>
                        </ConfigProvider>
                      ) : null}
                    </Col>
                    <Col span={6}>
                      <Text strong>
                        {currencyFormatter(transaction.amount)}
                      </Text>
                    </Col>
                  </Row>
                </List.Item>
              ))}
            </Space>
          </List.Item>
        )}
      />
    </>
  );
}

function groupedTransactions(
  transactions: FormattedTransaction[],
  filter: Filter
) {
  const filteredTransactions = transactions.filter((transaction) => {
    if (filter.filter === 'all') {
      return true;
    }
    if (filter.filter === 'reviewed') {
      return transaction.read === filter.antiFilter;
    }
    if (filter.filter === 'impulseBuy') {
      return transaction.impulse === filter.antiFilter;
    }
    if (filter.filter === 'recurring') {
      return transaction.recurring === filter.antiFilter;
    }
    return false;
  });

  const groupedTransactions = filteredTransactions.reduce(
    (acc, transaction) => {
      const { friendlyDistanceDate } = transaction;

      if (!acc[friendlyDistanceDate]) {
        acc[friendlyDistanceDate] = [];
      }
      acc[friendlyDistanceDate].push(transaction);
      return acc;
    },
    {} as Record<string, FormattedTransaction[]>
  );
  const groupedTransactionsArray = Object.entries(groupedTransactions).map(
    ([friendlyDistanceDate, transactions]) => ({
      friendlyDistanceDate,
      transactions,
    })
  );
  return groupedTransactionsArray;
}

function FilterOptions({
  filter,
  setFilterHandler,
}: {
  filter: Filter;
  setFilterHandler: (filter: FilterType, antiFilter: boolean) => void;
}) {
  const options: {
    filterLabel: string;
    antiFilterLabel: string;
    value: FilterType;
  }[] = [
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
  ];
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: antdDefaultButton,
        },
      }}
    >
      <Flex justify='center'>
        <Space direction='vertical' className='w-32'>
          <Flex justify='center'>
            <Text strong>Filters</Text>
          </Flex>
          <Flex justify='center'>
            <Button
              size='small'
              shape='round'
              type={filter.filter === 'all' ? 'primary' : 'default'}
              onClick={() => setFilterHandler('all', false)}
            >
              All
            </Button>
          </Flex>
        </Space>
        {options.map(({ filterLabel, value, antiFilterLabel }) => (
          <Space key={`${value}-filters`} direction='vertical' className='w-32'>
            <ConfigProvider
              theme={
                value === 'impulseBuy'
                  ? {
                      components: {
                        Button: impulseButtonTheme,
                      },
                    }
                  : undefined
              }
            >
              <Button
                size='small'
                className='w-full'
                shape='round'
                type={
                  filter.filter === value && filter.antiFilter
                    ? 'primary'
                    : 'default'
                }
                onClick={() => setFilterHandler(value, true)}
              >
                {filterLabel}
              </Button>
            </ConfigProvider>

            <Button
              size='small'
              className='w-full'
              shape='round'
              type={
                filter.filter === value && !filter.antiFilter
                  ? 'primary'
                  : 'default'
              }
              onClick={() => setFilterHandler(value, false)}
            >
              {antiFilterLabel}
            </Button>
          </Space>
        ))}
      </Flex>
    </ConfigProvider>
  );
}

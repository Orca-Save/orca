'use client';

import { FormattedTransaction } from '@/app/_actions/plaid';
import { discretionaryFilter } from '@/lib/plaid';
import { antdDefaultButton, impulseButtonTheme } from '@/lib/themeConfig';
import { currencyFormatter } from '@/lib/utils';
import {
  Badge,
  Button,
  Col,
  ConfigProvider,
  Flex,
  List,
  Row,
  Space,
  Typography,
} from 'antd';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
const { Text } = Typography;

type TransactionListProps = {
  transactions: FormattedTransaction[];
};
type FilterType = 'all' | 'reviewed' | 'impulseBuy' | 'discretionary';
type Filter = {
  filter: FilterType;
  antiFilter: boolean;
};
export default function TransactionList({
  transactions,
}: TransactionListProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<{
    antiFilter: boolean;
    filter: FilterType;
  }>({
    antiFilter: searchParams.get('anti') === 'true' ? true : false,
    filter: (searchParams.get('filter') as FilterType) ?? 'all',
  });

  const setFilterHandler = (filter: FilterType, antiFilter: boolean) => {
    setFilter({ filter, antiFilter });
  };
  const groupedTransactionsArray = groupedTransactions(transactions, filter);
  return (
    <>
      <FilterOptions
        filter={filter}
        router={router}
        setFilterHandler={setFilterHandler}
      />

      <List
        dataSource={groupedTransactionsArray}
        split={false}
        renderItem={({ formattedDate, transactions }) => (
          <List.Item>
            <Space direction='vertical' className='w-full'>
              <Text type='secondary'>{formattedDate}</Text>
              <List
                dataSource={transactions}
                renderItem={(transaction) => (
                  <List.Item
                    onClick={() =>
                      router.push(`/transactions/${transaction.id}`)
                    }
                    key={transaction.id}
                    className='hover:bg-gray-200 hover:shadow-lg cursor-pointer transition-colors duration-300'
                  >
                    <Row className='w-full mx-2'>
                      <Col span={8}>
                        <Text
                          strong
                          ellipsis={{
                            tooltip: true,
                          }}
                        >
                          {transaction.name ? transaction.name : 'Unknown'}
                        </Text>
                      </Col>
                      <Col span={8}>
                        <Text
                          type='secondary'
                          ellipsis={{
                            tooltip: true,
                          }}
                        >
                          {` (${transaction.accountName} ${transaction.accountMask})`}
                        </Text>
                      </Col>
                      <Col span={1}>
                        {transaction.impulse ? (
                          <div
                            style={{
                              border: '1px solid rgba(154,0,207, 0.6)',
                              borderRadius: '0.25rem',
                              backgroundColor: 'rgba(154,0,207, 0.2)',
                              color: 'rgba(154,0,207, 0.6)',
                              width: '1rem',
                              textAlign: 'center',
                            }}
                          >
                            I
                          </div>
                        ) : null}
                      </Col>
                      <Col span={6} className='text-right w-full'>
                        <Text
                          strong
                          style={{
                            marginRight: '0.3rem',
                          }}
                          type={transaction.amount < 0 ? 'success' : undefined}
                        >
                          {currencyFormatter(
                            transaction.amount,
                            undefined,
                            true
                          )}
                        </Text>
                      </Col>
                      <Col span={1}>
                        {transaction.read === false ? (
                          <Badge status='processing' />
                        ) : null}
                      </Col>
                    </Row>
                  </List.Item>
                )}
              />
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
    if (filter.filter === 'discretionary') {
      return discretionaryFilter(transaction) === filter.antiFilter;
    }
    return false;
  });

  const groupedTransactions = filteredTransactions.reduce(
    (acc, transaction) => {
      const { formattedDate } = transaction;

      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(transaction);
      return acc;
    },
    {} as Record<string, FormattedTransaction[]>
  );
  const groupedTransactionsArray = Object.entries(groupedTransactions).map(
    ([formattedDate, transactions]) => ({
      formattedDate,
      transactions,
    })
  );
  return groupedTransactionsArray;
}

function FilterOptions({
  filter,
  setFilterHandler,
  router,
}: {
  filter: Filter;
  router: any;
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
      filterLabel: 'Discretionary',
      antiFilterLabel: 'Non-Discretionary',
      value: 'discretionary',
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
      <Flex justify='center' wrap gap='small'>
        <Space direction='vertical' className='w-36'>
          <Flex justify='center'>
            <Text strong>Filters</Text>
          </Flex>
          <Flex justify='center'>
            <Button
              size='small'
              shape='round'
              type={filter.filter === 'all' ? 'primary' : 'default'}
              onClick={() => {
                setFilterHandler('all', false);
                router.replace(`/log/transactions`, {
                  shallow: true,
                });
              }}
            >
              All
            </Button>
          </Flex>
        </Space>
        {options.map(({ filterLabel, value, antiFilterLabel }) => (
          <Space key={`${value}-filters`} direction='vertical' className='w-36'>
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
                onClick={() => {
                  setFilterHandler(value, true);
                  router.replace(
                    `/log/transactions?filter=${value}&anti=${true}`,
                    {
                      shallow: true,
                    }
                  );
                }}
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
              onClick={() => {
                setFilterHandler(value, false);
                router.replace(
                  `/log/transactions?filter=${value}&anti=${false}`,
                  {
                    shallow: true,
                  }
                );
              }}
            >
              {antiFilterLabel}
            </Button>
          </Space>
        ))}
      </Flex>
    </ConfigProvider>
  );
}

'use client';

import { FormattedTransaction } from '@/app/_actions/plaid';
import { discretionaryFilter } from '@/lib/plaid';
import { antdDefaultButton } from '@/lib/themeConfig';
import { currencyFormatter } from '@/lib/utils';
import {
  Badge,
  Col,
  ConfigProvider,
  Flex,
  List,
  Menu,
  Row,
  Space,
  Switch,
  Typography,
} from 'antd';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
const { Text } = Typography;

type TransactionListProps = {
  transactions: FormattedTransaction[];
};
type FilterType = 'reviewed' | 'impulseBuy' | 'discretionary';
type Filter = {
  reviewed: boolean;
  impulseBuy: boolean;
  discretionary: boolean;
};

function useFilterParams(): Filter {
  const searchParams = useSearchParams();
  const filterParams = searchParams.get('filter')?.split(',');
  if (!filterParams) {
    return {
      impulseBuy: false,
      reviewed: false,
      discretionary: false,
    };
  }
  return {
    impulseBuy: filterParams.includes('impulseBuy'),
    reviewed: filterParams.includes('reviewed'),
    discretionary: filterParams.includes('discretionary'),
  };
}
export default function TransactionList({
  transactions,
}: TransactionListProps) {
  const router = useRouter();
  const params = useParams();
  const filterParams = useFilterParams();
  const [filter, setFilter] = useState(filterParams);
  const groupedTransactionsArray = groupedTransactions(transactions, filter);
  return (
    <>
      <FilterOptions
        filter={filter}
        router={router}
        setFilterHandler={setFilter}
      />

      <List
        dataSource={groupedTransactionsArray}
        split={false}
        renderItem={({ formattedDate, transactions }) => (
          <List.Item>
            <Space direction='vertical' className='w-full'>
              <Text type='secondary'>{formattedDate}</Text>
              <Menu
                selectedKeys={transactions
                  .filter((x) => x.read === false)
                  .map((x) => x.id)}
              >
                {transactions.map((transaction) => (
                  <Menu.Item
                    onClick={() =>
                      router.push(`/transactions/${transaction.id}`)
                    }
                    key={transaction.id}
                  >
                    <Row className='w-full h-full'>
                      <Col span={9} className='h-full w-full'>
                        <Flex align='center' className='h-full w-full'>
                          <Text
                            strong
                            ellipsis={{
                              tooltip: true,
                            }}
                          >
                            {transaction.name ? transaction.name : 'Unknown'}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={7} className='h-full w-full'>
                        <Flex align='center' className='h-full w-full'>
                          <Text
                            ellipsis={{
                              tooltip: true,
                            }}
                            // color='orange'
                            style={{
                              // border: '1px solid rgba(251,188,5, 0.2)',
                              borderRadius: '0.25rem',
                              backgroundColor: 'rgba(251,188,5, 0.2)',
                              padding: '0 0.25rem',
                              color: 'rgba(251,188,5)',
                              textAlign: 'center',
                            }}
                          >
                            {transaction.category}
                          </Text>
                          {/* <Tag
                            // color={color} key={category}
                            color='orange'
                          >
                            {transaction.category}
                          </Tag> */}
                        </Flex>
                      </Col>
                      <Col span={1} className='h-full w-full'>
                        {transaction.impulse ? (
                          <Flex align='center' className='h-full w-full'>
                            <Text
                              style={{
                                // border: '1px solid rgba(154,0,207, 0.6)',
                                borderRadius: '5rem',
                                backgroundColor: 'rgba(154,0,207, 0.2)',
                                // fontSize: 13,
                                color: 'rgba(154,0,207, 0.6)',
                                width: '100%',
                                textAlign: 'center',
                              }}
                            >
                              I
                            </Text>
                          </Flex>
                        ) : (
                          <div className='h-full w-full' />
                        )}
                      </Col>
                      <Col span={6} className='text-right h-full w-full'>
                        <Flex
                          align='center'
                          justify='right'
                          className='h-full w-full'
                        >
                          <Text
                            strong
                            style={{
                              marginRight: '0.3rem',
                            }}
                            type={
                              transaction.amount < 0 ? 'success' : undefined
                            }
                          >
                            {currencyFormatter(
                              transaction.amount,
                              undefined,
                              true
                            )}
                          </Text>
                        </Flex>
                      </Col>
                      <Col span={1} className='h-full w-full'>
                        {transaction.read === false ? (
                          <Flex
                            align='center'
                            justify='right'
                            className='h-full w-full'
                          >
                            <Badge status='processing' />
                          </Flex>
                        ) : null}
                      </Col>
                    </Row>
                  </Menu.Item>
                ))}
              </Menu>
            </Space>
          </List.Item>
        )}
      />
    </>
  );
}

function filterToParams(filter: Filter) {
  if (!filter.reviewed && !filter.impulseBuy && !filter.discretionary) {
    return 'all';
  }
  return Object.entries(filter)
    .filter(([_, value]) => value)
    .map(([key]) => key)
    .join(',');
}

function groupedTransactions(
  transactions: FormattedTransaction[],
  filter: Filter
) {
  const filteredTransactions = transactions.filter((transaction) => {
    if (!filter.reviewed && !filter.impulseBuy && !filter.discretionary) {
      return true;
    }

    if (filter.reviewed && transaction.read === true) return true;
    if (filter.impulseBuy && transaction.impulse === true) return true;
    if (filter.discretionary && discretionaryFilter(transaction) === true)
      return true;
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
  setFilterHandler: (filter: Filter) => void;
}) {
  const options: {
    label: string;
    value: FilterType;
  }[] = [
    {
      label: 'Reviewed',
      value: 'reviewed',
    },
    {
      label: 'Impulse Buy',
      value: 'impulseBuy',
    },
    {
      label: 'Recurring, transfer etc.',
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
      <Flex justify='center' align='center' wrap gap='small'>
        <Flex justify='center'>
          <Text strong>Filters</Text>
        </Flex>
        {options.map(({ label, value }) => (
          <>
            {label}
            <Switch
              size='small'
              checked={filter[value]}
              onClick={(checked) => {
                setFilterHandler({ ...filter, [value]: checked });
                router.replace(
                  `/log/transactions?filter=${filterToParams({
                    ...filter,
                    [value]: checked,
                  })}`,
                  {
                    shallow: true,
                  }
                );
              }}
            />
          </>
        ))}
      </Flex>
    </ConfigProvider>
  );
}

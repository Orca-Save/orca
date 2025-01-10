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
  Tour,
  TourProps,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { discretionaryFilter } from 'shared-library/dist/plaidCategories';

import { FormattedTransaction } from '../../types/all';
import { apiFetch, currencyFormatter } from '../../utils/general';
import { antdDefaultButton } from '../../utils/themeConfig';

const { Text } = Typography;

type TransactionListProps = {
  transactions: FormattedTransaction[];
  userTour: any;
};
type FilterType = 'reviewed' | 'impulseBuy' | 'discretionary';
type Filter = {
  reviewed: boolean;
  impulseBuy: boolean;
  discretionary: boolean;
};

function useFilterParams(searchParams: URLSearchParams): Filter {
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
  userTour,
}: TransactionListProps) {
  const firstItemRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParams = useFilterParams(searchParams);
  const navigate = useNavigate();
  const [filter, setFilter] = useState(filterParams);
  const groupedTransactionsArray = groupedTransactions(transactions, filter);
  const [open, setOpen] = useState<boolean>(
    !!userTour?.transactionListItem == false
  );
  const tour = {
    transactionListItem: true,
  };
  const tourClose = () => {
    setOpen(false);
    apiFetch('/api/users/updateTour', 'POST', {
      tour,
    });
  };

  const steps: TourProps['steps'] = [
    {
      title: 'Transaction History',
      description: 'Tap on transaction to see more detail, and make any edits.',
      target: () => firstItemRef.current,
      nextButtonProps: {
        onClick: async () => {
          await apiFetch('/api/users/updateTour', 'POST', {
            tour,
          });
          navigate('/');
        },
      },
    },
  ];
  return (
    <Flex
      justify='center'
      vertical
      style={{ overflow: 'hidden' }}
      className='h-full w-full'
    >
      <div className='w-full'>
        <FilterOptions
          filter={filter}
          setSearchParams={setSearchParams}
          setFilterHandler={setFilter}
        />
      </div>
      <div style={{ overflowY: 'auto' }}>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                activeBarBorderWidth: 0,
              },
            },
          }}
        >
          <List
            style={{ height: '100%' }}
            dataSource={groupedTransactionsArray}
            split={false}
            renderItem={({ formattedDate, transactions }, dayIdx) => (
              <List.Item>
                <Space direction='vertical' className='w-full'>
                  <Text type='secondary'>{formattedDate}</Text>
                  <Menu
                    selectedKeys={transactions
                      .filter((x) => x.read === false)
                      .map((x) => x.id)}
                  >
                    {transactions.map((transaction, idx) => (
                      <Menu.Item
                        onClick={() =>
                          navigate(`/transactions/${transaction.id}`)
                        }
                        key={transaction.id}
                      >
                        <Row
                          ref={dayIdx === 0 && idx === 0 ? firstItemRef : null}
                          className='w-full h-full'
                        >
                          <Col span={9} className='h-full w-full'>
                            <Flex align='center' className='h-full w-full'>
                              <Text
                                strong
                                ellipsis={{
                                  tooltip: true,
                                }}
                              >
                                {transaction.name
                                  ? transaction.name
                                  : 'Unknown'}
                              </Text>
                            </Flex>
                          </Col>
                          <Col span={7} className='h-full w-full'>
                            <Flex align='center' className='h-full w-full'>
                              <Text
                                ellipsis={{
                                  tooltip: true,
                                }}
                                style={{
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
                          <Col span={2} className='h-full w-full'>
                            {transaction.impulse ? (
                              <Flex
                                align='center'
                                justify='center'
                                className='h-full w-full'
                              >
                                <Text
                                  style={{
                                    // border: '1px solid rgba(154,0,207, 0.6)',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(154,0,207, 0.2)',
                                    // fontSize: 13,
                                    color: 'rgba(154,0,207, 0.6)',
                                    width: '20px',
                                    height: '20px',
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
                          <Col span={5} className='text-right h-full w-full'>
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
        </ConfigProvider>
      </div>
      <Tour open={open} onClose={tourClose} steps={steps} />
    </Flex>
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
    if (
      filter.discretionary &&
      discretionaryFilter(transaction as any) === true
    )
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
  setSearchParams,
}: {
  filter: Filter;
  setSearchParams: any;
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
      label: 'Non-Recurring, transfer etc.',
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
          <Text strong>Filter Only</Text>
        </Flex>
        {options.map(({ label, value }) => (
          <>
            <Text
              style={
                value !== 'impulseBuy'
                  ? undefined
                  : {
                      borderRadius: '1rem',
                      padding: '0.23rem 0.5rem',
                      backgroundColor: 'rgba(154,0,207, 0.2)',
                      color: 'rgba(154,0,207, 0.6)',
                    }
              }
            >
              {label}
            </Text>
            <Switch
              size='small'
              checked={filter[value]}
              onClick={(checked) => {
                setFilterHandler({ ...filter, [value]: checked });
                setSearchParams({
                  ...filter,
                  [value]: checked,
                });
              }}
            />
          </>
        ))}
      </Flex>
    </ConfigProvider>
  );
}

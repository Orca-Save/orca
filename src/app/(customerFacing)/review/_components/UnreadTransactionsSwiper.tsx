'use client';
import {
  CardData,
  CardId,
  CardMetaData,
  CardSwiper,
  SwipeAction,
  SwipeOperation,
} from '@/app/_components/CardSwiper';
import { Title } from '@/app/_components/Typography';
import { impulseButtonTheme } from '@/lib/themeConfig';
import { currencyFormatter } from '@/lib/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Liquid } from '@ant-design/plots';
import {
  Button,
  Card,
  ConfigProvider,
  Empty,
  Flex,
  Modal,
  Rate,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles by using 'reset.css'
import { useState } from 'react';
import {
  FormattedTransaction,
  markTransactionAsRead,
  syncItems,
} from '../../../_actions/plaid';
const { Text, Paragraph } = Typography;
const { Meta } = Card;
type UnreadTransactionsSwiperProps = {
  formattedTransactions: FormattedTransaction[];
  userId: string;
};

const customIcons: Record<number, React.ReactNode> = {
  1: <span>😞</span>,
  2: <span>😐</span>,
  3: <span>😊</span>,
  4: <span>😃</span>,
  5: <span>😍</span>,
};

export default function UnreadTransactionsSwiper({
  formattedTransactions,
  userId,
}: UnreadTransactionsSwiperProps) {
  const initialTransactions = formattedTransactions;
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>('');
  // const key = useRatingInput(setRating);
  const handleDismiss = async (
    element: HTMLDivElement,
    meta: CardMetaData,
    id: CardId,
    action: SwipeAction,
    operation: SwipeOperation
  ) => {
    await swipeOperation(id, action);
  };
  async function swipeOperation(id: CardId, action: SwipeAction) {
    if (action === SwipeAction.DISLIKE) {
      setSelectedTransactionId(id as string);
      setIsModalOpen(true);
      return;
    }
    await markTransactionAsRead(id as string, false);
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  }

  const transactionCards: CardData[] = transactions.map((transaction) => {
    return {
      id: transaction.id,
      src: '',
      meta: {},
      content: (
        <Flex
          justify='center'
          align='center'
          className='w-full'
          style={{ height: 275 }}
        >
          <Text strong>
            {transaction.merchantName ? transaction.merchantName : 'Unknown'}{' '}
          </Text>
          <Text type='secondary'>
            ({transaction.accountName} {transaction.accountMask})
          </Text>
          <Text strong className='ml-4'>
            {currencyFormatter(transaction.amount)}
          </Text>
        </Flex>
      ),
    };
  });
  const config = liquidConfig(transactions.length, initialTransactions.length);
  const transaction = transactions.find((x) => x.id === selectedTransactionId);
  return (
    <>
      <Modal
        centered
        open={isModalOpen}
        footer={null}
        title={
          <Flex justify='center'>
            <ConfigProvider
              theme={{
                components: {
                  Button: impulseButtonTheme,
                },
              }}
            >
              <Button shape='round' size='large' type='primary'>
                Impulse Buy
              </Button>
            </ConfigProvider>
          </Flex>
        }
      >
        <Flex justify='center'>
          <Space direction='vertical' align='center'>
            <Flex justify='center' className='w-full'>
              <Text strong>
                {transaction?.merchantName
                  ? transaction.merchantName
                  : 'Unknown'}{' '}
              </Text>
              <Text type='secondary'>
                ({transaction?.accountName} {transaction?.accountMask})
              </Text>
              <Text strong className='ml-4'>
                {transaction?.amount && currencyFormatter(transaction?.amount)}
              </Text>
            </Flex>
            <Flex justify='center'>
              <Tooltip
                title={
                  <>
                    <p style={{ marginBottom: '0.5rem' }}>
                      This rating is necessary to ensure the insights we deliver
                      are truly personalized.
                    </p>
                    <p>
                      For example, we don&apos;t want to suggest you cut back on
                      “Yoga with friends” to meet your goal if this is something
                      you truly value.
                    </p>
                  </>
                }
              >
                <Text strong>
                  How did you feel about this purchase?
                  <InfoCircleOutlined style={{ marginLeft: '5px' }} />
                </Text>
              </Tooltip>
            </Flex>
            <Flex justify='center'>
              <Rate
                key={selectedTransactionId}
                defaultValue={5}
                character={({ index = 0 }) => customIcons[index + 1]}
                style={{ marginTop: 8 }}
                onChange={async (value) => {
                  await markTransactionAsRead(
                    selectedTransactionId,
                    true,
                    value
                  );
                  setTransactions((prev) =>
                    prev.filter(
                      (transaction) => transaction.id !== selectedTransactionId
                    )
                  );
                  setSelectedTransactionId('');
                  setIsModalOpen(false);
                }}
              />
            </Flex>
          </Space>
        </Flex>
      </Modal>
      <div className='flex justify-center'>
        <Button
          data-id='sync-transactions-button'
          onClick={() => syncItems(userId)}
        >
          Sync Transactions
        </Button>
      </div>

      <div className='flex justify-center'>
        <Title level={5}>Transactions Left</Title>
      </div>
      <Liquid {...config} />
      <div className='flex justify-center'>
        <Text>
          <strong>Swipe Left</strong> for Impulse Buys, or{' '}
          <strong>Swipe Right</strong> for Reviewed
        </Text>
      </div>
      <div className='flex flex-col items-center justify-center h-full'>
        <div style={{ height: 400 }} className='w-full md:w-4/5 lg:w-3/5'>
          <CardSwiper
            // key={key}
            data={transactionCards}
            onDismiss={handleDismiss}
            dislikeButton={<div>Impulse Buy (A)</div>}
            likeButton={<div>Reviewed (D)</div>}
            withRibbons
            withActionButtons
            likeRibbonText='Reviewed'
            dislikeRibbonText='Impulse Buy'
            ribbonColors={{
              bgLike: 'green',
              bgDislike: 'red',
              textColor: 'white',
            }}
            emptyState={
              <Space
                direction='vertical'
                align='center'
                style={{ width: '100%' }}
              >
                <Empty description="You've reached the end of the list" />
              </Space>
            }
          />
        </div>
        <div className='flex my-4 justify-center'>
          <Button
            data-id='sync-transactions-button'
            onClick={() => syncItems(userId)}
            style={{
              height: 80,
              width: 220,
            }}
          >
            All Reviewed
          </Button>
        </div>
      </div>
    </>
  );
}

function liquidConfig(currentCount: number, totalCount: number) {
  let binSize = 15;
  if (totalCount > binSize) binSize = 50;
  if (totalCount > binSize) binSize = 100;
  return {
    percent: currentCount / binSize,
    height: 200,
    shape: 'rect',
    annotations: [
      {
        type: 'text',
        style: {
          text: `${currentCount}`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 16,
          fontStyle: 'bold',
        },
      },
    ],
    tooltip: false,
    style: {
      outlineBorder: 4,
      textFill: 'transparent',
      outlineDistance: 4,
      waveLength: 128,
    },
  };
}

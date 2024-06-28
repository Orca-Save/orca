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
import { impulseButtonTheme, lightGreenThemeColor } from '@/lib/themeConfig';
import { currencyFormatter } from '@/lib/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Liquid } from '@ant-design/plots';
import {
  Button,
  Card,
  ConfigProvider,
  Flex,
  Modal,
  Rate,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FormattedTransaction,
  markTransactionAsRead,
  markTransactionAsUnread,
  syncItems,
} from '../../../_actions/plaid';
import ConfettiComp from '../../_components/Confetti';
import UnreadButton from './UnreadButton';
import useRatingInput from './useRatingInput';
const { Text, Paragraph } = Typography;
const { Meta } = Card;
type UnreadTransactionsSwiperProps = {
  formattedTransactions: FormattedTransaction[];
  userId: string;
};

const customIcons: Record<number, React.ReactNode> = {
  1: (
    <Flex vertical justify='center'>
      <span>😞</span>
      <Text className='m-auto'>1</Text>
    </Flex>
  ),
  2: (
    <Flex vertical justify='center'>
      <span>😐</span>
      <Text className='m-auto'>2</Text>
    </Flex>
  ),
  3: (
    <Flex vertical justify='center'>
      <span>😊</span>
      <Text className='m-auto'>3</Text>
    </Flex>
  ),
  4: (
    <Flex vertical justify='center'>
      <span>😃</span>
      <Text className='m-auto'>4</Text>
    </Flex>
  ),
  5: (
    <Flex vertical justify='center'>
      <span>😍</span>
      <Text className='m-auto'>5</Text>
    </Flex>
  ),
};

type SwipeState = {
  transactions: FormattedTransaction[];
  reviewHistory: FormattedTransaction[];
  isModalOpen: boolean;
  swiperKey: string;
  isEmptyModalOpen: boolean;
  selectedTransactionId: string;
};

export default function UnreadTransactionsSwiper({
  formattedTransactions,
  userId,
}: UnreadTransactionsSwiperProps) {
  console.log('initialTransactions');
  const initialTransactions = formattedTransactions;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    transactions: [...initialTransactions],
    reviewHistory: [],
    isModalOpen: false,
    swiperKey: 'swiper-key',
    isEmptyModalOpen: false,
    selectedTransactionId: '',
  });

  const [rating, setRating] = useState(5);

  const router = useRouter();
  const rateImpulseBuy = async (value: number) => {
    setRating(value);
    await markTransactionAsRead(swipeState.selectedTransactionId, true, value);
    setSwipeState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter(
        (transaction) => transaction.id !== swipeState.selectedTransactionId
      ),
      selectedTransactionId: '',
      isModalOpen: false,
      isEmptyModalOpen: prev.transactions.length === 1,
    }));
    setRating(5);
  };

  const key = useRatingInput((rating) => {
    if (!swipeState.isModalOpen) return;
    rateImpulseBuy(rating);
  });

  const handleDismiss = async (
    element: HTMLDivElement,
    meta: CardMetaData,
    id: CardId,
    action: SwipeAction,
    operation: SwipeOperation
  ) => {
    await swipeOperation(id, action);
  };
  console.log('transactions', swipeState.transactions);
  async function swipeOperation(id: CardId, action: SwipeAction) {
    const transaction = swipeState.transactions.find((x) => x.id === id)!;
    const isDislike = action === SwipeAction.DISLIKE;
    if (isDislike && transaction.amount > 0) {
      setSwipeState((prev) => ({
        ...prev,
        isModalOpen: true,
        selectedTransactionId: id as string,
      }));
      return;
    }
    await markTransactionAsRead(id as string, isDislike);
    setSwipeState((prev) => ({
      ...prev,
      reviewHistory: prev.reviewHistory.concat([transaction]),
      transactions: prev.transactions.filter(
        (transaction) => transaction.id !== id
      ),
    }));
  }

  const transactionCards: CardData[] = swipeState.transactions.map(
    (transaction) => {
      const transactionName =
        transaction.merchantName ?? transaction.name ?? 'Unknown';
      return {
        id: transaction.id,
        src: '',
        meta: {},
        content: (
          <Flex
            justify='center'
            align='center'
            className='w-full'
            style={{
              height: 140,
              backgroundColor:
                transaction.amount < 0 ? lightGreenThemeColor : undefined,
            }}
            vertical
          >
            <Text>{transaction?.formattedDate}</Text>
            <Text
              strong
              ellipsis={{
                tooltip: true,
              }}
            >
              {transactionName}
            </Text>
            <Text
              type='secondary'
              ellipsis={{
                tooltip: true,
              }}
            >
              {transaction?.category ?? 'Unknown'}
            </Text>
            <Text
              strong
              type={transaction.amount < 0 ? 'success' : undefined}
              style={{
                marginRight: '0.3rem',
              }}
            >
              {currencyFormatter(transaction.amount, undefined, true)}
            </Text>
          </Flex>
        ),
      };
    }
  );
  const config = liquidConfig(
    swipeState.transactions.length,
    initialTransactions.length
  );
  const transaction = swipeState.transactions.find(
    (x) => x.id === swipeState.selectedTransactionId
  );
  const transactionName =
    transaction?.merchantName ?? transaction?.name ?? 'Unknown';

  return (
    <div className='w-full'>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 800 }}>
        <ConfettiComp
          count={20}
          run={swipeState.isEmptyModalOpen}
          redirect={false}
          path='/'
        />
      </div>
      <Modal
        centered
        open={swipeState.isEmptyModalOpen}
        zIndex={500}
        footer={
          <>
            <Link href='/'>
              <Button type='primary'>Return Home</Button>
            </Link>
          </>
        }
        onCancel={() =>
          setSwipeState((prev) => ({
            ...prev,
            isEmptyModalOpen: false,
          }))
        }
        title={<Text>All Transactions Reviewed!</Text>}
        onOk={() =>
          setSwipeState((prev) => ({
            ...prev,
            isEmptyModalOpen: false,
          }))
        }
        okText='Return Home'
      >
        <Flex justify='center' align='center'>
          <img
            alt='awe-inspiring photo of a waterfall in the forest'
            style={{ width: '100%', height: 'auto' }}
            src='https://orcasavestorage.blob.core.windows.net/images/pexels-mikhail-nilov-6942667.jpg'
          />
        </Flex>
      </Modal>
      <Modal
        centered
        open={swipeState.isModalOpen}
        footer={null}
        onCancel={() => {
          setSwipeState((prev) => ({
            ...prev,
            swiperKey: 'swiper-key-' + Math.random(),
            isModalOpen: false,
            selectedTransactionId: '',
          }));
        }}
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
        <Space direction='vertical' className='w-full'>
          <Flex justify='center'>
            <Text>{transaction?.formattedDate}</Text>
          </Flex>
          <Text
            strong
            ellipsis={{
              tooltip: true,
            }}
          >
            {transactionName}
          </Text>
          <Text
            type='secondary'
            ellipsis={{
              tooltip: true,
            }}
          >
            {transaction?.category ?? 'Unknown'}
          </Text>
          <Flex justify='center'>
            <Text className='ml-4'>
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
                <Text type='danger'>*</Text>How did you feel about this
                purchase?
                <InfoCircleOutlined style={{ marginLeft: '5px' }} />
              </Text>
            </Tooltip>
          </Flex>
          <Flex justify='center'>
            <Rate
              value={rating}
              key={swipeState.selectedTransactionId}
              allowClear={false}
              character={({ index = 0 }) => customIcons[index + 1]}
              style={{ marginTop: 8 }}
              onChange={rateImpulseBuy}
            />
          </Flex>
        </Space>
      </Modal>
      {process.env.NODE_ENV === 'development' && (
        <div className='flex justify-center'>
          <Button
            data-id='sync-transactions-button'
            onClick={() => syncItems(userId)}
          >
            Sync Transactions
          </Button>
          <UnreadButton userId={userId} />
        </div>
      )}

      <div className='flex justify-center'>
        <Title level={5}>Transactions Left</Title>
      </div>
      <div style={{ height: config.height }}>
        <Liquid {...config} />
      </div>
      <div className='flex justify-center text-center'>
        <Text>
          <strong>Swipe Left</strong> for Impulse Buys, or
          <strong> Swipe Right</strong> for Reviewed
        </Text>
      </div>
      <Flex vertical justify='center' align='end'>
        <div
          style={{ height: 240 }}
          className='flex justify-center mx-auto w-full md:w-4/5 lg:w-3/5'
        >
          <CardSwiper
            key={swipeState.swiperKey}
            disableSwipe={!!swipeState.selectedTransactionId}
            data={transactionCards}
            onDismiss={handleDismiss}
            dislikeButton={<div>Impulse Buy (A)</div>}
            likeButton={<div>Non-Impulse Buy (D)</div>}
            withRibbons
            withActionButtons
            likeRibbonText='Reviewed'
            dislikeRibbonText='Impulse Buy'
            ribbonColors={{
              bgLike: 'green',
              bgDislike: 'red',
              textColor: 'white',
            }}
            onFinish={() => {
              if (swipeState.transactions.length === 0) {
                setSwipeState((prev) => ({
                  ...prev,
                  isEmptyModalOpen: true,
                }));
              }
            }}
            emptyState={
              <Text>No more transactions! You&apos;re all caught up! 🎉</Text>
            }
          />
        </div>
        <Flex justify='center' className='mt-4 w-full'>
          <Button
            data-id='sync-transactions-button'
            size='large'
            disabled={swipeState.reviewHistory.length === 0}
            onClick={async () => {
              const transaction = swipeState.reviewHistory.at(-1);
              if (!transaction) return;
              await markTransactionAsUnread(transaction.id);
              console.log(
                swipeState.transactions.concat(
                  initialTransactions.filter((x) => x.id === transaction.id)
                )
              );
              setSwipeState((prev) => ({
                ...prev,
                transactions: prev.transactions.concat([transaction]),
                reviewHistory: prev.reviewHistory.slice(0, -1),
                swiperKey: 'swiper-key-' + Math.random(),
              }));
            }}
          >
            Undo
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}

function liquidConfig(currentCount: number, totalCount: number) {
  let binSize = 15;
  if (totalCount > binSize) binSize = 50;
  if (totalCount > binSize) binSize = 100;
  return {
    percent: currentCount / binSize,
    height: 150,
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

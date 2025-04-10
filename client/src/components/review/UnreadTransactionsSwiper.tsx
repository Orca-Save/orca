import { InfoCircleOutlined } from '@ant-design/icons';
import { Capacitor } from '@capacitor/core';
import {
  Button,
  Card,
  ConfigProvider,
  Flex,
  Modal,
  Progress,
  ProgressProps,
  Rate,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { FormattedTransaction } from '../../types/all';
import { apiFetch, currencyFormatter } from '../../utils/general';
import {
  impulseButtonTheme,
  lightGreenThemeColor,
} from '../../utils/themeConfig';
import ConfettiComp from '../shared/Confetti';
import {
  CardData,
  CardId,
  CardMetaData,
  CardSwiper,
  SwipeAction,
  SwipeOperation,
} from './CardSwiper';
import UnreadButton from './UnreadButton';
import useRatingInput from './useRatingInput';

const { Text, Paragraph, Title } = Typography;
const { Meta } = Card;

const twoColors: ProgressProps['strokeColor'] = {
  '0%': '#108ee9',
  '100%': '#87d068',
};
type UnreadTransactionsSwiperProps = {
  formattedTransactions: FormattedTransaction[];
  focusGoalImgURL: string;
};

type SwipeState = {
  transactions: FormattedTransaction[];
  reviewHistory: FormattedTransaction[];
  isModalOpen: boolean;
  swiperKey: string;
  isEmpty: boolean;
  selectedTransactionId: string;
};

function removeCardById(prev: SwipeState, id: string) {
  const transaction = prev.transactions.find((x) => x.id === id)!;
  return {
    ...prev,
    transactions: prev.transactions.filter(
      (transaction) => transaction.id !== id
    ),
    reviewHistory: prev.reviewHistory.concat([transaction]),
    selectedTransactionId: '',
    isModalOpen: false,
    // we're about to remove the last transaction
    isEmpty: prev.transactions.length === 1,
  };
}

export default function UnreadTransactionsSwiper({
  formattedTransactions,
  focusGoalImgURL,
}: UnreadTransactionsSwiperProps) {
  const initialTransactions = formattedTransactions;
  const [swipeState, setSwipeState] = useState<SwipeState>({
    transactions: [...initialTransactions],
    reviewHistory: [],
    isModalOpen: false,
    swiperKey: 'swiper-key',
    isEmpty: initialTransactions.length === 0,
    selectedTransactionId: '',
  });

  const [rating, setRating] = useState(5);

  const rateImpulseBuy = async (value: number) => {
    setRating(value);
    await apiFetch('/api/plaid/readTransaction', 'POST', {
      transactionId: swipeState.selectedTransactionId,
      impulseRating: value,
      impulse: true,
    });
    // const transaction = swipeState.transactions.find(
    //   (x) => x.id === swipeState.selectedTransactionId
    // )!;
    setSwipeState((prev) =>
      removeCardById(prev, swipeState.selectedTransactionId)
    );
    setRating(5);
  };

  const key = useRatingInput((rating) => {
    if (!swipeState.isModalOpen) return;
    rateImpulseBuy(rating);
  });
  const isWeb = Capacitor.getPlatform() === 'web';
  const customIcons: Record<number, React.ReactNode> = {
    1: (
      <Flex vertical justify='center'>
        <span>😞</span>
        {isWeb && <Text className='m-auto'>1</Text>}
      </Flex>
    ),
    2: (
      <Flex vertical justify='center'>
        <span>😐</span>
        {isWeb && <Text className='m-auto'>2</Text>}
      </Flex>
    ),
    3: (
      <Flex vertical justify='center'>
        <span>😊</span>
        {isWeb && <Text className='m-auto'>3</Text>}
      </Flex>
    ),
    4: (
      <Flex vertical justify='center'>
        <span>😃</span>
        {isWeb && <Text className='m-auto'>4</Text>}
      </Flex>
    ),
    5: (
      <Flex vertical justify='center'>
        <span>😍</span>
        {isWeb && <Text className='m-auto'>5</Text>}
      </Flex>
    ),
  };

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
    await apiFetch('/api/plaid/readTransaction', 'POST', {
      transactionId: id as string,
      impulse: isDislike,
    });
    setSwipeState((prev) => removeCardById(prev, id as string));
  }

  const transactionCards: CardData[] = swipeState.transactions.map(
    (transaction) => {
      const transactionName = transaction.name ?? 'Unknown';
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
              height: 200,
              backgroundColor:
                transaction.amount < 0 ? lightGreenThemeColor : undefined,
            }}
            vertical
          >
            <Text>{transaction?.formattedDate}</Text>
            <Text strong>{transactionName}</Text>
            <Button shape='round' size='small' type='text'>
              {transaction?.category ?? 'Unknown'}
            </Button>
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
          run={swipeState.isEmpty}
          redirect={false}
          path='/'
        />
      </div>
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
          <Flex justify='center'>
            <Text
              strong
              ellipsis={{
                tooltip: true,
              }}
            >
              {transactionName}
            </Text>
          </Flex>
          <Flex justify='center'>
            <Text
              type='secondary'
              ellipsis={{
                tooltip: true,
              }}
            >
              {transaction?.category ?? 'Unknown'}
            </Text>
          </Flex>
          <Flex justify='center'>
            <Text>
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
            onClick={async () => {
              await apiFetch('/api/plaid/syncUserItems', 'GET');
              window.location.reload();
            }}
          >
            Sync Transactions
          </Button>
          <UnreadButton />
        </div>
      )}

      {swipeState.transactions.length > 0 && (
        <>
          <div className='flex justify-center text-center'>
            <Title className='text-center' level={5}>
              Transactions Left
            </Title>
          </div>
          <Flex justify='center' className='w-full'>
            {swipeState.transactions.length}
          </Flex>
          <div className='w-4/5 mx-auto'>
            <Progress
              percent={config.percent * 100}
              status='active'
              showInfo={false}
              strokeColor={twoColors}
            />
          </div>
          <div className='flex justify-center text-center'>
            <Text>
              <strong>Swipe Left</strong> for Impulse Buys, or
              <strong> Swipe Right</strong> for Non-Impulse Buys
            </Text>
          </div>
        </>
      )}
      <div
        style={{ height: swipeState.isEmpty ? undefined : 300 }}
        className='flex justify-center mx-auto w-full md:w-4/5 lg:w-3/5'
      >
        <CardSwiper
          key={swipeState.swiperKey}
          disableSwipe={!!swipeState.selectedTransactionId}
          data={transactionCards}
          onDismiss={handleDismiss}
          dislikeButton={<div>Impulse Buy {isWeb ? '(A)' : ''}</div>}
          likeButton={<div>Non-Impulse Buy {isWeb ? '(D)' : ''}</div>}
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
            <div
            //  style={{ marginTop: 250 }}
            >
              <Flex justify='center' align='center' className='text-center'>
                <Title level={3}>
                  No more transactions! You&apos;re all caught up! 🎉
                </Title>
              </Flex>
              <Flex justify='center' align='center'>
                <img alt='focus-goal-image' src={focusGoalImgURL} />
              </Flex>
              <Flex justify='center' align='center' className='text-center m-2'>
                <Link to='/'>
                  <Button type='primary'>Return Home</Button>
                </Link>
              </Flex>
            </div>
          }
        />
      </div>
      <Flex justify='center' className='mt-4 mb-2 w-full'>
        <Button
          data-id='sync-transactions-button'
          size='large'
          disabled={swipeState.reviewHistory.length === 0}
          onClick={async () => {
            const transaction = swipeState.reviewHistory.at(-1);
            if (!transaction) return;

            await apiFetch('/api/plaid/unreadTransaction', 'POST', {
              transactionId: transaction.id,
            });

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

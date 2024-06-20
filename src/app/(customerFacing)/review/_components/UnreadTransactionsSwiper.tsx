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
  Col,
  ConfigProvider,
  Flex,
  Modal,
  Rate,
  Row,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  FormattedTransaction,
  markAllTransactionsAsRead,
  markTransactionAsRead,
} from '../../../_actions/plaid';
import ConfettiComp from '../../_components/Confetti';
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

export default function UnreadTransactionsSwiper({
  formattedTransactions,
  userId,
}: UnreadTransactionsSwiperProps) {
  const initialTransactions = formattedTransactions;
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swiperKey, setSwiperKey] = useState('swiper-key');
  const [isEmptyModalOpen, setIsEmptyModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const router = useRouter();
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>('');
  const rateImpulseBuy = async (value: number) => {
    setRating(value);
    await markTransactionAsRead(selectedTransactionId, true, value);
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== selectedTransactionId)
    );
    setSelectedTransactionId('');
    setIsModalOpen(false);
    setRating(5);
  };

  const key = useRatingInput((rating) => {
    if (!isModalOpen) return;
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
          id='big-boom'
          justify='center'
          align='center'
          className='w-full'
          style={{ height: 140 }}
          vertical
        >
          <Text>{transaction?.formattedDate}</Text>
          <Row className='w-full mx-auto'>
            <Col span={12} className='text-right'>
              <Text
                strong
                ellipsis={{
                  tooltip: true,
                }}
              >
                {transaction.name ? transaction.name : 'Unknown'}
              </Text>
            </Col>
            <Col span={12}>
              <Text
                type='secondary'
                ellipsis={{
                  tooltip: true,
                }}
              >
                {` (${transaction.accountName} ${transaction.accountMask})`}
              </Text>
            </Col>
          </Row>
          <Text
            strong
            style={{
              marginRight: '0.3rem',
            }}
          >
            {currencyFormatter(transaction.amount)}
          </Text>
        </Flex>
      ),
    };
  });
  const config = liquidConfig(transactions.length, initialTransactions.length);
  const transaction = transactions.find((x) => x.id === selectedTransactionId);
  return (
    <div className='w-full'>
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 800 }}>
        <ConfettiComp
          count={20}
          run={isEmptyModalOpen}
          redirect={false}
          path='/'
        />
      </div>
      <Modal
        centered
        open={isEmptyModalOpen}
        zIndex={500}
        footer={
          <>
            <Link href='/'>
              <Button type='primary'>Return Home</Button>
            </Link>
          </>
        }
        onCancel={() => setIsEmptyModalOpen(false)}
        title={<Text>All Transactions Reviewed!</Text>}
        onOk={() => setIsEmptyModalOpen(false)}
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
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setSwiperKey('swiper-key-' + Math.random());
          setIsModalOpen(false);
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
            <Row className='w-full'>
              <Col span={12} className='text-right'>
                <Text
                  ellipsis={{
                    tooltip: true,
                  }}
                >
                  {transaction?.name ? transaction.name : 'Unknown'}
                </Text>
              </Col>
              <Col span={12}>
                <Text
                  type='secondary'
                  ellipsis={{
                    tooltip: true,
                  }}
                >
                  {` (${transaction?.accountName} ${transaction?.accountMask})`}
                </Text>
              </Col>
            </Row>
          </Flex>
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
              key={selectedTransactionId}
              allowClear={false}
              character={({ index = 0 }) => customIcons[index + 1]}
              style={{ marginTop: 8 }}
              onChange={rateImpulseBuy}
            />
          </Flex>
        </Space>
      </Modal>
      {/* debug buttons */}
      {/* <div className='flex justify-center'>
        <Button
          data-id='sync-transactions-button'
          onClick={() => syncItems(userId)}
        >
          Sync Transactions
        </Button>
        <UnreadButton userId={userId} />
      </div> */}

      <div className='flex justify-center'>
        <Title level={5}>Transactions Left</Title>
      </div>
      <div style={{ height: config.height }}>
        <Liquid {...config} />
      </div>
      <div className='flex justify-center text-center'>
        <Text>
          <strong>Swipe Left</strong> for Impulse Buys, or{' '}
          <strong>Swipe Right</strong> for Reviewed
        </Text>
      </div>
      <Flex vertical justify='center' align='end'>
        <div
          style={{ height: 240 }}
          className='flex justify-center mx-auto w-full md:w-4/5 lg:w-3/5'
        >
          <CardSwiper
            key={swiperKey}
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
            onFinish={() => setIsEmptyModalOpen(true)}
            emptyState={
              <Text>No more transactions! You&apos;re all caught up! 🎉</Text>
            }
          />
        </div>
        <Flex justify='center' className='mt-4 w-full'>
          <Button
            data-id='sync-transactions-button'
            size='large'
            onClick={async () => {
              await markAllTransactionsAsRead(userId);
              router.push('/');
            }}
          >
            All Reviewed
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

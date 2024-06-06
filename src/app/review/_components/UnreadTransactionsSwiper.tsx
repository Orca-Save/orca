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
import { InstitutionCard } from '@/app/review/_components/InstitutionCard';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Liquid } from '@ant-design/plots';
import { Transaction as TransactionPrisma } from '@prisma/client';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Rate,
  Row,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles by using 'reset.css'
import { AccountBase, Institution, Item } from 'plaid';
import { useEffect, useState } from 'react';
import { markTransactionAsRead, syncItems } from '../../_actions/plaid';
import useRatingInput from './useRatingInput';
const { Text, Paragraph } = Typography;
const { Meta } = Card;
type Transaction = TransactionPrisma & {
  amount: number;
};
interface UnreadTransactionsSwiperProps {
  userId: string;
  plaidItem: {
    unreadTransactions: Transaction[];
    accounts: AccountBase[];
    items: Item[];
    institutions: Institution[];
  };
}

const customIcons: Record<number, React.ReactNode> = {
  1: <span>😞</span>,
  2: <span>😐</span>,
  3: <span>😊</span>,
  4: <span>😃</span>,
  5: <span>😍</span>,
};

export default function UnreadTransactionsSwiper({
  plaidItem,
  userId,
}: UnreadTransactionsSwiperProps) {
  const initialTransactions = plaidItem.unreadTransactions;
  const [transactions, setTransactions] = useState(initialTransactions);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const key = useRatingInput(setRating);

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

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
    await markTransactionAsRead(
      id as string,
      action === SwipeAction.DISLIKE,
      rating
    );
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  }

  const transactionCards: CardData[] = transactions.map((transaction) => {
    const account = plaidItem.accounts.find(
      (account) => account.account_id === transaction.accountId
    );
    // const institutionLogo =
    //   institution.logo ?? institution.url + '/apple-touch-icon.png';
    const institution = plaidItem.institutions.find(
      (institution) => institution.institution_id === transaction.institutionId
    );
    const institutionLogo =
      institution?.logo ?? institution?.url + '/favicon.ico';

    return {
      id: transaction.id,
      src: '',
      meta: {},
      content: (
        <Card>
          <Meta
            avatar={<Avatar src={transaction.logoIcon} />}
            title={transaction.name}
            description={
              <>
                <Text>{transaction.merchantName}</Text>
                <br />
                <Text type='secondary'>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </>
            }
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Title level={3}>${transaction.amount.toFixed(2)}</Title>
          </div>
          <InstitutionCard
            institution={institution}
            account={account}
            categoryIcon={transaction.personalFinanceCategoryIcon ?? ''}
          />
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div>
                    <Tooltip
                      title={
                        <>
                          <p style={{ marginBottom: '0.5rem' }}>
                            This rating is necessary to ensure the insights we
                            deliver are truly personalized.
                          </p>
                          <p>
                            For example, we don&apos;t want to suggest you cut
                            back on “Yoga with friends” to meet your goal if
                            this is something you truly value.
                          </p>
                        </>
                      }
                    >
                      <Text strong>
                        How did you feel about this purchase?
                        <InfoCircleOutlined style={{ marginLeft: '5px' }} />
                      </Text>
                    </Tooltip>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Rate
                      character={({ index = 0 }) => customIcons[index + 1]}
                      style={{ marginTop: 8 }}
                      value={rating}
                      onChange={(value) => setRating(value)}
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      ),
    };
  });
  const config = liquidConfig(transactions.length, initialTransactions.length);
  return (
    <>
      <div className='flex justify-center'>
        <Button onClick={() => syncItems(userId)}>Sync Transactions</Button>
      </div>

      <Liquid {...config} />
      <div className='flex justify-center h-full'>
        <div style={{ height: '450px' }} className='w-full md:w-4/5 lg:w-3/5'>
          <CardSwiper
            key={key}
            data={transactionCards}
            onDismiss={handleDismiss}
            dislikeButton={<div>Impulse</div>}
            likeButton={<div>Reviewed</div>}
            withActionButtons
            withRibbons
            likeRibbonText='Reviewed'
            dislikeRibbonText='Impulse'
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

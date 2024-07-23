import { Text } from '@/app/_components/Typography';
import { HappyProvider } from '@/components/HappyProvider';
import { greenThemeColors } from '@/lib/themeConfig';
import { ConfigProvider, Space } from 'antd';
import db from '../../../../server/src/db/db';
import { getPinnedUserGoal } from '../_actions/data';
import { QuickSaveButton } from './QuickSaveButton';

const getPinnedGoalTransfers = async (userId: string) => {
  return (
    await db.goalTransfer.findMany({
      where: {
        userId,
        pinned: true,
      },
      include: {
        category: true,
      },
    })
  ).map((transfer) =>
    Object.assign(transfer, {
      category: transfer.category?.name,
      amount: transfer.amount.toNumber(),
    })
  );
};

export default async function QuickSaveButtons({ userId }: { userId: string }) {
  const [quickTransfers, goal] = await Promise.all([
    getPinnedGoalTransfers(userId),
    getPinnedUserGoal(userId),
  ]);

  if (!quickTransfers) return <Text>No Pinned One-Tap Saves.</Text>;
  if (!goal) return <Text>No Pinned Goal.</Text>;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: greenThemeColors.colorPrimary,
        },
      }}
    >
      <Space wrap>
        {quickTransfers.map((transfer) => (
          <HappyProvider key={transfer.id}>
            <QuickSaveButton transfer={transfer} goalId={goal.id} />
          </HappyProvider>
        ))}
      </Space>
    </ConfigProvider>
  );
}

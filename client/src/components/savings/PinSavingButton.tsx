import { PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { apiFetch } from '../../utils/general';

type PinSavingButtonProps = {
  pinned: boolean | null;
  typeId: string;
  type: 'Goal' | 'GoalTransfer';
  userHasPinnedGoal?: boolean;
};

export default function PinSavingButton({
  pinned,
  typeId,
  type,
  userHasPinnedGoal,
}: PinSavingButtonProps) {
  const setPinnedURL = `/api/users/${
    type === 'Goal' ? 'setGoalPinned' : 'setGoalTransferPinned'
  }`;

  const onClick = async () => {
    const results = await apiFetch(setPinnedURL, 'POST', {
      typeId,
      pinned: !pinned,
    });
    window.location.reload();
  };

  if (pinned) return <PushpinFilled onClick={onClick} />;
  return (
    <Button
      data-id={`pin-${type.toLowerCase()}`}
      icon={<PushpinOutlined />}
      type='text'
      style={{ color: 'inherit' }}
      disabled={userHasPinnedGoal}
      onClick={onClick}
    />
  );
}

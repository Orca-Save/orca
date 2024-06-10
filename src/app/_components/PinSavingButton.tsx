'use client';

import { PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { setGoalPinned, setGoalTransferPinned } from '../_actions/users';

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
  const setPinned = type === 'Goal' ? setGoalPinned : setGoalTransferPinned;
  const onClick = () => setPinned(typeId, !pinned);

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

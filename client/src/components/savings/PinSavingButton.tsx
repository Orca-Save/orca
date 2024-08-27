import { PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import { Button, Tour, TourProps } from 'antd';
import { useRef, useState } from 'react';
import { apiFetch } from '../../utils/general';

type PinSavingButtonProps = {
  pinned: boolean | null;
  typeId: string;
  type: 'Goal' | 'GoalTransfer';
  userHasPinnedGoal?: boolean;
  userTour?: boolean;
};

export default function PinSavingButton({
  pinned,
  typeId,
  type,
  userTour,
  userHasPinnedGoal,
}: PinSavingButtonProps) {
  const buttonRef = useRef(null);
  const [open, setOpen] = useState<boolean>(userTour !== true);
  const tourClose = () => {
    setOpen(false);
    const tour = {
      pinnedGoal: true,
    };
    apiFetch('/api/users/updateTour', 'POST', {
      tour,
    });
  };

  const steps: TourProps['steps'] = [
    {
      title: 'Pinned Goal',
      description:
        'Ready to start saving for a new goal? Tap the pin icon to remove this one from focus, and tap the pin on a another to set it as your new focus goal, where impulse saves will automatically go from now on.',
      target: () => buttonRef.current,
    },
  ];
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

  if (pinned) {
    console.log('userTour', typeId, userTour);
    return (
      <>
        <PushpinFilled ref={buttonRef} onClick={onClick} />
        <Tour open={open} onClose={tourClose} steps={steps} />
      </>
    );
  }
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

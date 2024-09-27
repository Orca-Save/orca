import { PushpinFilled, PushpinOutlined } from '@ant-design/icons';
import { Button, Tour, TourProps } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(userTour === true);
  const tour: any = {};
  if (type === 'Goal') tour.pinnedGoal = true;
  else tour.pinnedOneTap = true;
  const tourClose = async () => {
    setOpen(false);
    await apiFetch('/api/users/updateTour', 'POST', {
      tour,
    });
  };
  console.log(tour);

  const setPinnedURL = `/api/users/${
    type === 'Goal' ? 'setGoalPinned' : 'setGoalTransferPinned'
  }`;

  const steps: TourProps['steps'] = [
    {
      title: type === 'Goal' ? 'Pinned Goal' : 'Pinned One-Tap Save',
      description:
        type === 'Goal'
          ? 'Ready to start saving for a new goal? Tap the pin icon to remove this one from focus, and tap the pin on a another to set it as your new focus goal, where impulse saves will automatically go from now on.'
          : 'Pinned one-tap saves appear on the dashboard for quick saves. Tap the pin icon to remove this one from focus, and tap the pin on another to set it as your new focus one-tap save.',
      target: () => buttonRef.current,
      nextButtonProps: {
        onClick: async () => {
          await apiFetch('/api/users/updateTour', 'POST', {
            tour,
          });
          navigate(type === 'Goal' ? '/log/one-taps' : '/log/transactions');
        },
        children: 'Next',
      },
    },
  ];

  const onClick = async () => {
    const results = await apiFetch(setPinnedURL, 'POST', {
      typeId,
      pinned: !pinned,
    });
    window.location.reload();
  };

  if (pinned) {
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

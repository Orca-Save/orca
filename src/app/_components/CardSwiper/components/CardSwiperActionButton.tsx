import { Button } from 'antd';
import { SwipeAction, SwipeDirection } from '..';

interface ActionButtonProps {
  action: SwipeAction;
  isCustom?: boolean;
  direction: SwipeDirection;
  onClick: (direction: SwipeDirection) => void;
  buttonContent: React.ReactNode;
}

function CardSwiperActionButton({
  buttonContent,
  direction,
  isCustom = false,
  action,
  onClick,
}: ActionButtonProps) {
  const className = `swipe-card__${isCustom ? 'custom-' : ''}action-button`;

  return (
    <Button
      size='large'
      style={{ width: '100%', height: '100%' }}
      onClick={() => onClick(direction)}
    >
      {buttonContent}
    </Button>
  );
}

export default CardSwiperActionButton;

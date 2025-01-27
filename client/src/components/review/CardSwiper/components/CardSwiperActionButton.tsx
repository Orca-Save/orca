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
      data-id={`swipe-card-${direction}-button-${action}`}
      size='large'
      // style={{ width: 220, height: 80 }}
      onClick={() => onClick(direction)}
    >
      {buttonContent}
    </Button>
  );
}

export default CardSwiperActionButton;

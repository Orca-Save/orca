import { useEffect, useRef, useState } from 'react';
import {
  CardData,
  CardEnterEvent,
  CardEvents,
  CardId,
  CardMetaData,
  SwipeAction,
  SwipeDirection,
  SwipeOperation,
} from '../types/types';
import { Swiper } from '../utils/swiper';

interface UseCardSwiper extends CardEvents {
  data: CardData[];
  disableSwipe?: boolean;
}

export const useCardSwiper = ({
  disableSwipe,
  onDismiss,
  onFinish,
  onEnter,
  data,
}: UseCardSwiper) => {
  const swiperElements = useRef<Swiper[]>([]);
  const [swiperIndex, setSwiperIndex] = useState(data.length);
  const [dynamicData, setDynamicData] = useState(data);
  const [isFinish, setIsFinish] = useState(false);

  const handleNewCardSwiper = (
    ref: HTMLDivElement | null,
    id: CardId,
    meta: CardMetaData
  ) => {
    if (ref) {
      const currentSwiper = new Swiper({
        element: ref,
        id,
        meta,
        onDismiss: handleDismiss,
      });
      currentSwiper.setDisableSwipe(disableSwipe);
      swiperElements.current.push(currentSwiper);
    }
  };

  const handleEnter: CardEnterEvent = (element, meta, id) => {
    onEnter && onEnter(element, meta, id);
  };

  const handleDismiss = (
    element: HTMLDivElement,
    meta: CardMetaData,
    id: CardId,
    action: SwipeAction,
    operation: SwipeOperation
  ) => {
    setSwiperIndex((prev) => prev - 1);
    onDismiss && onDismiss(element, meta, id, action, operation);
    swiperElements.current.pop();
  };

  const handleClickEvents = (direction: SwipeDirection) => {
    if (swiperIndex) {
      const swiper = swiperElements.current[swiperIndex - 1];
      swiper?.dismissById(direction);
    }
  };

  useEffect(() => {
    if (swiperIndex) {
      const currentSwiper = swiperElements.current[swiperIndex - 1];
      currentSwiper?.setDisableSwipe(disableSwipe);
    }
  }, [disableSwipe]);

  useEffect(() => {
    if (!swiperIndex) {
      setIsFinish(true);
      if (onFinish) onFinish(SwipeAction.FINISHED);
    }
  }, [swiperIndex]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      let swipeDirection = undefined;
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'w':
          swipeDirection = SwipeDirection.LEFT;
          break;
        case 'ArrowRight':
        case 'd':
        case 'e':
          swipeDirection = SwipeDirection.RIGHT;
          break;
        default:
          break;
      }

      if (swipeDirection) {
        handleClickEvents(swipeDirection);
      }
    };

    // Attach the event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDismiss]);

  return {
    isFinish,
    dynamicData,
    swiperIndex,
    swiperElements,
    handleEnter,
    setDynamicData,
    handleClickEvents,
    handleNewCardSwiper,
  };
};

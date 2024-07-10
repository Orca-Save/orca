import '../main.css';

import { impulseDefaultButtonTheme } from '@/lib/themeConfig';
import { ConfigProvider, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Title } from '../../Typography';
import { useCardSwiper } from '../hooks/useCardSwiper';
import { CardSwiperProps, SwipeAction, SwipeDirection } from '../types/types';
import { Swiper } from '../utils/swiper';
import CardSwiperActionButton from './CardSwiperActionButton';
import CardSwiperEmptyState from './CardSwiperEmptyState';
import { CardSwiperLeftActionButton } from './CardSwiperLeftActionButton';
import CardSwiperRibbons from './CardSwiperRibbons';
import { CardSwiperRightActionButton } from './CardSwiperRightActionButton';

export const CardSwiper = (props: CardSwiperProps) => {
  const {
    data,
    likeButton,
    dislikeButton,
    withActionButtons = false,
    emptyState,
    onDismiss,
    disableSwipe,
    onFinish,
    onEnter,
  } = props;
  const {
    handleEnter,
    handleClickEvents,
    handleNewCardSwiper,
    dynamicData,
    isFinish,
    swiperIndex,
    swiperElements,
  } = useCardSwiper({
    disableSwipe,
    onDismiss,
    onFinish,
    onEnter,
    data,
  });
  const [currentSwiper, setCurrentSwiper] = useState<Swiper | undefined>(
    swiperElements.current[swiperIndex]
  );
  const [hideActionButtons, setHideActionButtons] = useState('');

  useEffect(() => {
    setCurrentSwiper(swiperElements.current[swiperIndex - 1]);
  }, [swiperElements, swiperIndex]);

  useEffect(() => {
    currentSwiper &&
      handleEnter(currentSwiper.element, currentSwiper.meta, currentSwiper.id);
  }, [currentSwiper]);

  const CardComponents = useMemo(
    () =>
      dynamicData.map(({ id, header, src, content, meta }) => (
        <div
          key={id}
          ref={(ref) => handleNewCardSwiper(ref, id, meta)}
          className={'swipe-card__container'}
          id='swipe-card__container'
        >
          {header && (
            <div
              className='swipe-card__header-container'
              id='swipe-card__header-container'
            >
              <h2 id='swipe-card__header'>{header}</h2>
            </div>
          )}
          {props.withRibbons && (
            <CardSwiperRibbons
              likeRibbonText={props.likeRibbonText}
              dislikeRibbonText={props.dislikeRibbonText}
              ribbonColors={props.ribbonColors}
            />
          )}

          {/* <div className="swipe-card__image-container">
            <img className="swipe-card__image" src={src} alt={src} id="swipe-card__image" />
          </div> */}
          {content && <div className='swipe-card__content'>{content}</div>}
        </div>
      )),
    []
  );

  useEffect(() => {
    if (isFinish) setHideActionButtons('hide-action-buttons');
  }, [isFinish]);

  useEffect(() => {
    const handleWindowBlur = () => {
      currentSwiper?.handleTouchEnd();
      currentSwiper?.handleMoveUp();
    };

    window.addEventListener('blur', handleWindowBlur);

    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [currentSwiper]);

  return (
    <div className='swipe-card' id='swipe-card'>
      <div className='swipe-card__cards' id='swipe-card__cards'>
        {CardComponents}
        {emptyState && isFinish && (
          <CardSwiperEmptyState isFinish={isFinish}>
            {emptyState}
          </CardSwiperEmptyState>
        )}
      </div>
      {withActionButtons && (
        <div
          className={`swipe-card__children ${hideActionButtons}`}
          id='swipe-card__children'
        >
          {likeButton && dislikeButton ? (
            <div>
              <div className='flex justify-center'>
                <Title level={5}>Mark As</Title>
              </div>
              <Space size='large'>
                <ConfigProvider
                  theme={{
                    components: {
                      Button: impulseDefaultButtonTheme,
                    },
                  }}
                >
                  <CardSwiperActionButton
                    isCustom
                    direction={SwipeDirection.LEFT}
                    action={SwipeAction.DISLIKE}
                    onClick={handleClickEvents}
                    buttonContent={dislikeButton}
                  />
                </ConfigProvider>
                <CardSwiperActionButton
                  isCustom
                  direction={SwipeDirection.RIGHT}
                  action={SwipeAction.LIKE}
                  onClick={handleClickEvents}
                  buttonContent={likeButton}
                />
              </Space>
            </div>
          ) : (
            <>
              <CardSwiperActionButton
                direction={SwipeDirection.LEFT}
                action={SwipeAction.DISLIKE}
                onClick={handleClickEvents}
                buttonContent={<CardSwiperLeftActionButton />}
              />
              <CardSwiperActionButton
                direction={SwipeDirection.RIGHT}
                action={SwipeAction.LIKE}
                onClick={handleClickEvents}
                buttonContent={<CardSwiperRightActionButton />}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

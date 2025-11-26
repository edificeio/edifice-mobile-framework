import * as React from 'react';
import { ImageURISource } from 'react-native';

import ImageItem from './image-item/component';
import PdfItem from './pdf-item/component';
import PlayerItem from './player-item/component';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from './styles';
import { CarouselItemProps } from './types';
import UnknownItem from './unknown-item/component';
import UnviewableItem from './unviewable-item/component';

import { isAudioContent, isImageContent, isPdfContent, isVideoContent } from '~/framework/util/media';

export const CarouselItem = ({
  currentIndex,
  hideNavBar,
  info,
  isCurrentMediaUnknown,
  isNavBarVisible,
  itemSource,
  onInitialAVMediaLoad,
  setIsCarouselSwipeEnabled,
  showNavBar,
  toggleNavBarVisibility,
}: CarouselItemProps) => {
  const isCurrentItem = info.index === currentIndex;

  if (isCurrentMediaUnknown) {
    return <UnknownItem />;
  }

  if (isImageContent(info.item)) {
    return (
      <ImageItem
        containerHeight={SCREEN_HEIGHT}
        containerWidth={SCREEN_WIDTH}
        hideNavBar={hideNavBar}
        showNavBar={showNavBar}
        isNavBarVisible={isNavBarVisible}
        isShown={isCurrentItem}
        source={itemSource as ImageURISource}
        toggleNavBarVisibility={toggleNavBarVisibility}
      />
    );
  }

  if (isAudioContent(info.item) || isVideoContent(info.item)) {
    return (
      <PlayerItem
        {...info}
        isCurrentItem={isCurrentItem}
        hideNavBar={hideNavBar}
        onInitialMediaLoad={onInitialAVMediaLoad}
        showNavBar={showNavBar}
        source={itemSource}
      />
    );
  }

  if (isPdfContent(info.item)) {
    return (
      <PdfItem
        hideNavBar={hideNavBar}
        isNavBarVisible={isNavBarVisible}
        source={itemSource}
        toggleNavBar={toggleNavBarVisibility}
        setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled}
      />
    );
  }

  return <UnviewableItem file={info.item} />;
};

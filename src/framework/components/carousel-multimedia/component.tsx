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
  isSingleMediaMode,
  itemSource,
  onInitialAVMediaLoad,
  setIsCarouselSwipeEnabled,
  showNavBar,
  singleMedia,
  toggleNavBarVisibility,
}: CarouselItemProps) => {
  const [isPdfError, setIsPdfError] = React.useState(false);

  if (isCurrentMediaUnknown || (isSingleMediaMode && !singleMedia) || (!isSingleMediaMode && !info)) {
    return <UnknownItem />;
  }

  const media = isSingleMediaMode ? singleMedia! : info!.item;
  const isCurrentItem = isSingleMediaMode ? true : info!.index === currentIndex;

  if (!media.mime && media.src) return <UnviewableItem file={media} />;

  if (isImageContent(media)) {
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

  if (isAudioContent(media) || isVideoContent(media)) {
    return (
      <PlayerItem
        {...(isSingleMediaMode ? { index: 0, item: singleMedia! } : info!)}
        isCurrentItem={isCurrentItem}
        hideNavBar={hideNavBar}
        onInitialMediaLoad={onInitialAVMediaLoad}
        showNavBar={showNavBar}
        source={itemSource}
      />
    );
  }

  if (isPdfContent(media)) {
    if (isPdfError) {
      return <UnviewableItem file={media} />;
    }
    return (
      <PdfItem
        hideNavBar={hideNavBar}
        isNavBarVisible={isNavBarVisible}
        isShown={isCurrentItem}
        setIsCarouselSwipeEnabled={setIsCarouselSwipeEnabled}
        setIsPdfError={setIsPdfError}
        source={itemSource}
        toggleNavBar={toggleNavBarVisibility}
      />
    );
  }

  return <UnviewableItem file={media} />;
};
